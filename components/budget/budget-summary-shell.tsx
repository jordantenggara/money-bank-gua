type BudgetSummaryShellProps = {
  initialHtml: string;
};

export function BudgetSummaryShell({ initialHtml }: BudgetSummaryShellProps) {
  return (
    <section
      id="budget-summary-fragment"
      dangerouslySetInnerHTML={{ __html: initialHtml }}
      {...({
        "data-hx-get": "/api/budgets/monthly/summary",
        "data-hx-trigger": "load, budgetChanged from:body",
        "data-hx-include": "#budget-month-filter",
        "data-hx-swap": "innerHTML",
      } as Record<string, string>)}
    />
  );
}
