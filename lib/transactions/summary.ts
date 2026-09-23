import type { DashboardSummary, TransactionType } from "./types.ts";

type SummaryRow = {
  type: TransactionType;
  amount: number | string;
};

export function calculateSummary(rows: SummaryRow[]): DashboardSummary {
  const totals = rows.reduce(
    (summary, row) => {
      const amount = Number(row.amount);
      if (row.type === "income") summary.totalIncome += amount;
      if (row.type === "expense") summary.totalExpense += amount;
      return summary;
    },
    { totalIncome: 0, totalExpense: 0 },
  );

  const totalIncome = Number(totals.totalIncome.toFixed(2));
  const totalExpense = Number(totals.totalExpense.toFixed(2));

  return {
    totalIncome,
    totalExpense,
    balance: Number((totalIncome - totalExpense).toFixed(2)),
  };
}
