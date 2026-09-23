import assert from "node:assert/strict";
import test from "node:test";
import {
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../lib/transactions/schemas.ts";
import { TransactionServiceError } from "../lib/transactions/errors.ts";
import {
  requireAuthenticatedUserId,
  requireVisibleTransaction,
} from "../lib/transactions/guards.ts";
import { calculateSummary } from "../lib/transactions/summary.ts";

test("create schema accepts and normalizes a valid transaction", () => {
  const result = createTransactionSchema.parse({
    type: "income",
    amount: 1250.5,
    description: "  Scholarship  ",
    transactionDate: "2026-09-23",
  });

  assert.deepEqual(result, {
    type: "income",
    amount: 1250.5,
    description: "Scholarship",
    transactionDate: "2026-09-23",
  });
});

test("create schema rejects invalid values and client supplied ownership", () => {
  const result = createTransactionSchema.safeParse({
    type: "transfer",
    amount: 1.001,
    description: " ",
    transactionDate: "2026-02-30",
    user_id: "a different user",
  });

  assert.equal(result.success, false);
});

test("update schema requires at least one editable field", () => {
  assert.equal(updateTransactionSchema.safeParse({}).success, false);
  assert.equal(
    updateTransactionSchema.safeParse({ description: "Updated" }).success,
    true,
  );
});

test("transaction IDs must be UUIDs", () => {
  assert.equal(transactionIdSchema.safeParse("not-an-id").success, false);
  assert.equal(
    transactionIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
      .success,
    true,
  );
});

test("summary totals income, expense, and balance consistently", () => {
  assert.deepEqual(
    calculateSummary([
      { type: "income", amount: "100.25" },
      { type: "income", amount: 20 },
      { type: "expense", amount: "35.10" },
    ]),
    { totalIncome: 120.25, totalExpense: 35.1, balance: 85.15 },
  );
});

test("requests without verified claims are rejected as unauthenticated", () => {
  assert.throws(
    () => requireAuthenticatedUserId(null, new Error("missing session")),
    (error) =>
      error instanceof TransactionServiceError &&
      error.code === "UNAUTHENTICATED",
  );
});

test("missing and RLS-hidden rows share the same not-found result", () => {
  assert.throws(
    () => requireVisibleTransaction(null),
    (error) =>
      error instanceof TransactionServiceError && error.code === "NOT_FOUND",
  );
});
