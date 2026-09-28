import { MonthlyBudgetSummary, BudgetStatus } from "./types";

export function getMonthDateRange(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { startDate, endDate };
}

export function computeBudgetStatus(totalBudget: number | null, totalExpense: number): BudgetStatus {
  if (totalBudget === null || totalBudget <= 0) {
    return "UNSET";
  }
  const percentage = (totalExpense / totalBudget) * 100;
  if (percentage < 75) return "SAFE";
  if (percentage < 100) return "WARNING";
  if (percentage === 100) return "LIMIT";
  return "OVER";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMonthlyBudgetSummary(supabase: any, userId: string, monthStr: string): Promise<MonthlyBudgetSummary> {
  const { startDate, endDate } = getMonthDateRange(monthStr);

  // Fetch budget for user and month
  const { data: budgetData } = await supabase
    .from("monthly_budgets")
    .select("amount")
    .eq("user_id", userId)
    .eq("budget_month", startDate)
    .maybeSingle();

  const totalBudget = budgetData ? Number(budgetData.amount) : null;

  // Fetch expense transactions for user in month
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("transaction_date", startDate)
    .lt("transaction_date", endDate);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalExpense = (transactions || []).reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const remainingBudget = totalBudget !== null ? totalBudget - totalExpense : null;
  const usagePercentage = totalBudget !== null && totalBudget > 0 ? (totalExpense / totalBudget) * 100 : null;
  const status = computeBudgetStatus(totalBudget, totalExpense);

  return {
    month: monthStr,
    totalBudget,
    totalExpense,
    remainingBudget,
    usagePercentage,
    status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertMonthlyBudget(supabase: any, userId: string, monthStr: string, amount: number) {
  const { startDate } = getMonthDateRange(monthStr);

  const { data, error } = await supabase
    .from("monthly_budgets")
    .upsert(
      {
        user_id: userId,
        budget_month: startDate,
        amount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,budget_month" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
