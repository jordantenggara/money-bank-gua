import { MonthlyBudgetSummary } from "./types";

export function renderBudgetSummaryFragment(summary: MonthlyBudgetSummary): string {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "—";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const usageText = summary.usagePercentage !== null ? `${summary.usagePercentage.toFixed(2).replace(".", ",")}%` : "—";
  const status = summary.status;

  return `
    <div id="budget-summary-content" class="budget-summary rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4" data-budget-month="${summary.month}" data-budget-status="${status}">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Monthly Budget (${summary.month})</h3>
      </div>

      <dl class="budget-summary__totals grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="budget-summary__item rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
          <dt class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total budget</dt>
          <dd id="budget-total" class="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">${formatCurrency(summary.totalBudget)}</dd>
        </div>
        <div class="budget-summary__item rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
          <dt class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total expense</dt>
          <dd id="budget-expense" class="mt-1 text-xl font-bold text-red-600 dark:text-red-400">${formatCurrency(summary.totalExpense)}</dd>
        </div>
        <div class="budget-summary__item rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
          <dt class="text-xs font-medium text-zinc-500 dark:text-zinc-400">Remaining budget</dt>
          <dd id="budget-remaining" class="mt-1 text-xl font-bold ${summary.remainingBudget !== null && summary.remainingBudget < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"}">
            ${formatCurrency(summary.remainingBudget)}
          </dd>
        </div>
      </dl>

      <div id="budget-usage-indicator" class="budget-summary__indicator rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" data-budget-status="${status}">
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Usage: <span id="budget-usage" class="font-semibold">${usageText}</span>
        </p>
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status: <strong id="budget-status" class="uppercase">${status}</strong>
        </p>
      </div>
    </div>
  `;
}
