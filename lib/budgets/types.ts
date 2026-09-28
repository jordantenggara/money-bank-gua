export type BudgetStatus = "UNSET" | "SAFE" | "WARNING" | "LIMIT" | "OVER";

export type MonthlyBudgetSummary = {
  month: string; // YYYY-MM
  totalBudget: number | null;
  totalExpense: number;
  remainingBudget: number | null;
  usagePercentage: number | null;
  status: BudgetStatus;
};
