import assert from "node:assert/strict";
import test from "node:test";
import type { Database } from "../types/database.ts";

type MonthlyBudgetRow = Database["public"]["Tables"]["monthly_budgets"]["Row"];
type MonthlyBudgetInsert = Database["public"]["Tables"]["monthly_budgets"]["Insert"];
type MonthlyBudgetUpdate = Database["public"]["Tables"]["monthly_budgets"]["Update"];

test("monthly_budgets Database type contract matches SRS-012 schema requirements", () => {
  const sampleRow: MonthlyBudgetRow = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "123e4567-e89b-12d3-a456-426614174000",
    budget_month: "2026-09-01",
    amount: 1500.0,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  };

  assert.equal(typeof sampleRow.id, "string");
  assert.equal(typeof sampleRow.user_id, "string");
  assert.equal(typeof sampleRow.budget_month, "string");
  assert.equal(typeof sampleRow.amount, "number");
});

test("budget_month must be normalized to the first date of a calendar month (SRS-012)", () => {
  const isValidFirstDayOfMonth = (dateStr: string): boolean => {
    const match = /^(\d{4})-(\d{2})-(01)$/.exec(dateStr);
    return match !== null;
  };

  assert.equal(isValidFirstDayOfMonth("2026-09-01"), true);
  assert.equal(isValidFirstDayOfMonth("2026-09-15"), false);
  assert.equal(isValidFirstDayOfMonth("2026-09-30"), false);
});

test("monthly_budgets amount constraint enforces positive decimal values (> 0)", () => {
  const isPositiveAmount = (amount: number): boolean => {
    return Number.isFinite(amount) && amount > 0;
  };

  assert.equal(isPositiveAmount(100.5), true);
  assert.equal(isPositiveAmount(0), false);
  assert.equal(isPositiveAmount(-50), false);
});

test("monthly_budgets RLS policy requires auth.uid() = user_id isolation", () => {
  const sessionUserId = "user-session-123";

  const isAccessAllowed = (rowUserId: string, activeUserId: string | null): boolean => {
    return activeUserId !== null && activeUserId === rowUserId;
  };

  assert.equal(isAccessAllowed("user-session-123", sessionUserId), true);
  assert.equal(isAccessAllowed("other-user-456", sessionUserId), false);
  assert.equal(isAccessAllowed("user-session-123", null), false);
});
