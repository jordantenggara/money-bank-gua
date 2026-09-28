import { MonthFilter } from "./month-filter";
import { BudgetSummaryShell } from "./budget-summary-shell";
import { BudgetForm } from "./budget-form";

type BudgetPanelProps = {
  currentMonth: string;
  initialSummaryHtml: string;
};

export function BudgetPanel({ currentMonth, initialSummaryHtml }: BudgetPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Monthly Budget & Monitoring</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Track and manage your spending limits per month.</p>
        </div>
        <MonthFilter selectedMonth={currentMonth} />
      </div>

      <BudgetSummaryShell initialHtml={initialSummaryHtml} />

      <BudgetForm />
    </div>
  );
}
