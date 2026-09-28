"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BudgetForm() {
  return (
    <form
      className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
      {...({
        "data-hx-put": "/api/budgets/monthly",
        "data-hx-target": "#budget-form-feedback",
        "data-hx-swap": "innerHTML",
        "data-hx-include": "#budget-month-filter",
      } as Record<string, string>)}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Set / Update Monthly Budget</h3>
      <Input
        label="Budget Amount (IDR)"
        type="number"
        step="0.01"
        min="0.01"
        name="amount"
        placeholder="e.g. 1500000"
        required
      />
      <div id="budget-form-feedback"></div>
      <div className="flex justify-end">
        <Button type="submit">Save Budget</Button>
      </div>
    </form>
  );
}
