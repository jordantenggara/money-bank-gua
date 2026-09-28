import assert from "node:assert/strict";
import test from "node:test";
import { createPutMonthlyBudgetHandler } from "../app/api/budgets/monthly/route.ts";
import { createGetMonthlyBudgetSummaryHandler } from "../app/api/budgets/monthly/summary/route.ts";
import {
  budgetAmountSchema,
  budgetMonthSchema,
  monthlyBudgetFormSchema,
} from "../lib/budgets/schemas.ts";
import {
  calculateMonthlyBudgetSummary,
  createBudgetOperations,
  getNextBudgetMonth,
  normalizeBudgetMonth,
  requireAuthenticatedBudgetUserId,
} from "../lib/budgets/service.ts";
import {
  BudgetServiceError,
  type MonthlyBudgetSummary,
} from "../lib/budgets/types.ts";

type StoredBudget = { userId: string; month: string; amount: number };
type StoredTransaction = {
  userId: string;
  type: "income" | "expense";
  amount: number;
  date: string;
};

function createMemoryContext(
  userId: string,
  budgets: StoredBudget[],
  transactions: StoredTransaction[] = [],
) {
  return async () => ({
    userId,
    repository: {
      async upsertBudget(ownerId: string, month: string, amount: number) {
        const existing = budgets.find(
          (budget) => budget.userId === ownerId && budget.month === month,
        );
        if (existing) existing.amount = amount;
        else budgets.push({ userId: ownerId, month, amount });
      },
      async findBudgetAmount(ownerId: string, month: string) {
        return (
          budgets.find(
            (budget) => budget.userId === ownerId && budget.month === month,
          )?.amount ?? null
        );
      },
      async listExpenseAmounts(
        ownerId: string,
        startDate: string,
        endDate: string,
      ) {
        return transactions
          .filter(
            (transaction) =>
              transaction.userId === ownerId &&
              transaction.type === "expense" &&
              transaction.date >= startDate &&
              transaction.date < endDate,
          )
          .map((transaction) => transaction.amount);
      },
    },
  });
}

test("budget schemas accept valid form values and normalize the amount", () => {
  assert.equal(budgetMonthSchema.parse("2026-09"), "2026-09");
  assert.equal(budgetAmountSchema.parse("1250000.50"), 1_250_000.5);
  assert.deepEqual(
    monthlyBudgetFormSchema.parse({ month: "2026-09", amount: "500.25" }),
    { month: "2026-09", amount: 500.25 },
  );
});

test("budget schemas reject invalid months and invalid amounts", () => {
  for (const month of ["2026-00", "2026-13", "2026-9", "0000-01", "September"]) {
    assert.equal(budgetMonthSchema.safeParse(month).success, false);
  }
  for (const amount of ["", "0", "-1", "1.001", "1e3", "10000000000"]) {
    assert.equal(budgetAmountSchema.safeParse(amount).success, false);
  }
});

test("months normalize to first-day inclusive and next-month exclusive bounds", () => {
  assert.equal(normalizeBudgetMonth("2026-09"), "2026-09-01");
  assert.equal(getNextBudgetMonth("2026-09"), "2026-10-01");
  assert.equal(getNextBudgetMonth("2026-12"), "2027-01-01");
});

test("summary returns UNSET while still reporting the selected month's expenses", () => {
  assert.deepEqual(calculateMonthlyBudgetSummary("2026-09", null, [10, "5.25"]), {
    month: "2026-09",
    totalBudget: null,
    totalExpense: 15.25,
    remainingBudget: null,
    usagePercentage: null,
    status: "UNSET",
  });
});

test("summary applies all budget thresholds and preserves actual overspending", () => {
  assert.equal(calculateMonthlyBudgetSummary("2026-09", 100, [74.99]).status, "SAFE");
  assert.equal(calculateMonthlyBudgetSummary("2026-09", 100, [75]).status, "WARNING");
  assert.equal(calculateMonthlyBudgetSummary("2026-09", 100, [100]).status, "LIMIT");
  assert.deepEqual(calculateMonthlyBudgetSummary("2026-09", 100, [120]), {
    month: "2026-09",
    totalBudget: 100,
    totalExpense: 120,
    remainingBudget: -20,
    usagePercentage: 120,
    status: "OVER",
  });
});

test("setting the same user's month updates one budget instead of duplicating it", async () => {
  const budgets: StoredBudget[] = [];
  const operations = createBudgetOperations(
    createMemoryContext("user-a", budgets),
  );

  await operations.setMonthlyBudget({ month: "2026-09", amount: 100 });
  await operations.setMonthlyBudget({ month: "2026-09", amount: 250 });

  assert.deepEqual(budgets, [
    { userId: "user-a", month: "2026-09-01", amount: 250 },
  ]);
});

test("aggregation includes only current-user expenses inside month boundaries", async () => {
  const budgets: StoredBudget[] = [
    { userId: "user-a", month: "2026-09-01", amount: 100 },
    { userId: "user-b", month: "2026-09-01", amount: 999 },
  ];
  const transactions: StoredTransaction[] = [
    { userId: "user-a", type: "expense", amount: 10, date: "2026-09-01" },
    { userId: "user-a", type: "expense", amount: 20, date: "2026-09-30" },
    { userId: "user-a", type: "expense", amount: 30, date: "2026-10-01" },
    { userId: "user-a", type: "income", amount: 50, date: "2026-09-15" },
    { userId: "user-b", type: "expense", amount: 900, date: "2026-09-15" },
  ];
  const operations = createBudgetOperations(
    createMemoryContext("user-a", budgets, transactions),
  );

  assert.deepEqual(await operations.getMonthlyBudgetSummary("2026-09"), {
    month: "2026-09",
    totalBudget: 100,
    totalExpense: 30,
    remainingBudget: 70,
    usagePercentage: 30,
    status: "SAFE",
  });
});

test("missing verified claims are rejected as unauthenticated", () => {
  assert.throws(
    () => requireAuthenticatedBudgetUserId(null, new Error("missing session")),
    (error) =>
      error instanceof BudgetServiceError && error.code === "UNAUTHENTICATED",
  );
});

test("PUT endpoint validates form data and emits budgetChanged after success", async () => {
  let savedInput: { month: string; amount: number } | undefined;
  const handler = createPutMonthlyBudgetHandler(async (input) => {
    savedInput = input;
    return input;
  });
  const validForm = new URLSearchParams({
    month: "2026-09",
    amount: "100.25",
  });
  const success = await handler(
    new Request("http://localhost/api/budgets/monthly", {
      method: "PUT",
      body: validForm,
    }),
  );

  assert.equal(success.status, 200);
  assert.equal(success.headers.get("HX-Trigger"), "budgetChanged");
  assert.match(success.headers.get("Content-Type") ?? "", /^text\/html/);
  assert.deepEqual(savedInput, { month: "2026-09", amount: 100.25 });

  const invalidForm = new FormData();
  invalidForm.set("month", "2026-13");
  invalidForm.set("amount", "0");
  const invalid = await handler(
    new Request("http://localhost/api/budgets/monthly", {
      method: "PUT",
      body: invalidForm,
    }),
  );
  assert.equal(invalid.status, 422);
  assert.match(await invalid.text(), /data-budget-feedback="error"/);
});

test("budget endpoints return safe unauthenticated and summary HTML responses", async () => {
  const unauthenticated = createPutMonthlyBudgetHandler(async () => {
    throw new BudgetServiceError("UNAUTHENTICATED", "Authentication is required.");
  });
  const form = new FormData();
  form.set("month", "2026-09");
  form.set("amount", "100");
  const unauthorizedResponse = await unauthenticated(
    new Request("http://localhost/api/budgets/monthly", {
      method: "PUT",
      body: form,
    }),
  );
  assert.equal(unauthorizedResponse.status, 401);
  assert.doesNotMatch(await unauthorizedResponse.text(), /stack|token|session/i);

  const expected: MonthlyBudgetSummary = {
    month: "2026-09",
    totalBudget: 100,
    totalExpense: 120,
    remainingBudget: -20,
    usagePercentage: 120,
    status: "OVER",
  };
  const summaryHandler = createGetMonthlyBudgetSummaryHandler(async () => expected);
  const summaryResponse = await summaryHandler(
    new Request(
      "http://localhost/api/budgets/monthly/summary?month=2026-09",
    ),
  );
  const summaryHtml = await summaryResponse.text();
  assert.equal(summaryResponse.status, 200);
  assert.match(summaryHtml, /data-budget-status="OVER"/);
  assert.match(summaryHtml, /id="budget-status">OVER</);
  assert.match(summaryHtml, /120%/);

  const invalidMonth = await summaryHandler(
    new Request(
      "http://localhost/api/budgets/monthly/summary?month=2026-99",
    ),
  );
  assert.equal(invalidMonth.status, 422);
});
