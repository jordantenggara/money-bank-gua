export type BudgetStatus = "UNSET" | "SAFE" | "WARNING" | "LIMIT" | "OVER";

export type MonthlyBudgetSummary = {
  month: string;
  totalBudget: number | null;
  totalExpense: number;
  remainingBudget: number | null;
  usagePercentage: number | null;
  status: BudgetStatus;
};

export type SetMonthlyBudgetInput = {
  month: string;
  amount: number;
};

export type MonthlyBudget = {
  month: string;
  amount: number;
};

export type BudgetServiceErrorCode = "UNAUTHENTICATED" | "INTERNAL_ERROR";

export class BudgetServiceError extends Error {
  public readonly code: BudgetServiceErrorCode;

  constructor(code: BudgetServiceErrorCode, message: string) {
    super(message);
    this.name = "BudgetServiceError";
    this.code = code;
  }
}
