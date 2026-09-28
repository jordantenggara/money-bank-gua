import type {
  MonthlyBudget,
  MonthlyBudgetSummary,
  SetMonthlyBudgetInput,
} from "./types.ts";
import { BudgetServiceError } from "./types.ts";

type MoneyValue = number | string;

export type BudgetRepository = {
  upsertBudget(userId: string, budgetMonth: string, amount: number): Promise<void>;
  findBudgetAmount(userId: string, budgetMonth: string): Promise<MoneyValue | null>;
  listExpenseAmounts(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<MoneyValue[]>;
};

export type BudgetContext = {
  userId: string;
  repository: BudgetRepository;
};

export type BudgetContextFactory = () => Promise<BudgetContext>;

function toCents(value: MoneyValue): number {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new BudgetServiceError(
      "INTERNAL_ERROR",
      "The budget request could not be completed.",
    );
  }

  return Math.round(amount * 100);
}

function fromCents(value: number): number {
  return Number((value / 100).toFixed(2));
}

export function normalizeBudgetMonth(month: string): string {
  return `${month}-01`;
}

export function getNextBudgetMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;

  return `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`;
}

export function calculateMonthlyBudgetSummary(
  month: string,
  budgetAmount: MoneyValue | null,
  expenseAmounts: MoneyValue[],
): MonthlyBudgetSummary {
  const totalExpenseCents = expenseAmounts.reduce<number>(
    (total, amount) => total + toCents(amount),
    0,
  );
  const totalExpense = fromCents(totalExpenseCents);

  if (budgetAmount === null) {
    return {
      month,
      totalBudget: null,
      totalExpense,
      remainingBudget: null,
      usagePercentage: null,
      status: "UNSET",
    };
  }

  const totalBudgetCents = toCents(budgetAmount);
  if (totalBudgetCents <= 0) {
    throw new BudgetServiceError(
      "INTERNAL_ERROR",
      "The budget request could not be completed.",
    );
  }

  let status: MonthlyBudgetSummary["status"];
  if (totalExpenseCents * 4 < totalBudgetCents * 3) {
    status = "SAFE";
  } else if (totalExpenseCents < totalBudgetCents) {
    status = "WARNING";
  } else if (totalExpenseCents === totalBudgetCents) {
    status = "LIMIT";
  } else {
    status = "OVER";
  }

  return {
    month,
    totalBudget: fromCents(totalBudgetCents),
    totalExpense,
    remainingBudget: fromCents(totalBudgetCents - totalExpenseCents),
    usagePercentage: Number(
      ((totalExpenseCents / totalBudgetCents) * 100).toFixed(2),
    ),
    status,
  };
}

export function requireAuthenticatedBudgetUserId(
  data: { claims?: { sub?: unknown } } | null,
  error: unknown,
): string {
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    throw new BudgetServiceError(
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  return userId;
}

function throwDatabaseError(
  operation: string,
  error: { code?: string } | null,
): never {
  console.error("Budget database operation failed.", {
    operation,
    code: error?.code ?? "UNKNOWN",
  });
  throw new BudgetServiceError(
    "INTERNAL_ERROR",
    "The budget request could not be completed.",
  );
}

async function getAuthenticatedBudgetContext(): Promise<BudgetContext> {
  const { createClient } = await import("../supabase/server.ts");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = requireAuthenticatedBudgetUserId(data, error);

  const repository: BudgetRepository = {
    async upsertBudget(ownerId, budgetMonth, amount) {
      const { error: upsertError } = await supabase
        .from("monthly_budgets")
        .upsert(
          {
            user_id: ownerId,
            budget_month: budgetMonth,
            amount,
          },
          { onConflict: "user_id,budget_month" },
        );

      if (upsertError) throwDatabaseError("upsert", upsertError);
    },

    async findBudgetAmount(ownerId, budgetMonth) {
      const { data: budget, error: budgetError } = await supabase
        .from("monthly_budgets")
        .select("amount")
        .eq("user_id", ownerId)
        .eq("budget_month", budgetMonth)
        .maybeSingle();

      if (budgetError) throwDatabaseError("find", budgetError);
      return (budget?.amount as MoneyValue | undefined) ?? null;
    },

    async listExpenseAmounts(ownerId, startDate, endDate) {
      const { data: expenses, error: expenseError } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", ownerId)
        .eq("type", "expense")
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

      if (expenseError) throwDatabaseError("aggregate-expenses", expenseError);
      return (expenses ?? []).map((row) => row.amount as MoneyValue);
    },
  };

  return { userId, repository };
}

export function createBudgetOperations(getContext: BudgetContextFactory) {
  return {
    async setMonthlyBudget(input: SetMonthlyBudgetInput): Promise<MonthlyBudget> {
      const { userId, repository } = await getContext();
      const budgetMonth = normalizeBudgetMonth(input.month);

      await repository.upsertBudget(userId, budgetMonth, input.amount);
      return { month: input.month, amount: input.amount };
    },

    async getMonthlyBudgetSummary(month: string): Promise<MonthlyBudgetSummary> {
      const { userId, repository } = await getContext();
      const startDate = normalizeBudgetMonth(month);
      const endDate = getNextBudgetMonth(month);
      const [budgetAmount, expenseAmounts] = await Promise.all([
        repository.findBudgetAmount(userId, startDate),
        repository.listExpenseAmounts(userId, startDate, endDate),
      ]);

      return calculateMonthlyBudgetSummary(month, budgetAmount, expenseAmounts);
    },
  };
}

const budgetOperations = createBudgetOperations(getAuthenticatedBudgetContext);

export const setMonthlyBudget = budgetOperations.setMonthlyBudget;
export const getMonthlyBudgetSummary = budgetOperations.getMonthlyBudgetSummary;
