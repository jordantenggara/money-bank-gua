type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  hidden: boolean;
};

export function SummaryCards({ totalIncome, totalExpense, hidden }: SummaryCardsProps) {
  const formatCurrency = (amount: number) =>
    hidden
      ? "Rp ••••••••"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Income</h3>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(totalIncome)}
        </p>
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Total Expense</h3>
        <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(totalExpense)}
        </p>
      </div>
    </div>
  );
}
