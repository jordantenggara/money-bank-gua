"use client";

import { Select } from "@/components/ui/select";

type MonthFilterProps = {
  selectedMonth: string;
};

export function MonthFilter({ selectedMonth }: MonthFilterProps) {
  const currentDate = new Date();
  const months = [];
  for (let i = -6; i <= 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ val, label });
  }

  return (
    <div className="w-full sm:w-64">
      <Select
        id="budget-month-filter"
        name="month"
        label="Select Month"
        defaultValue={selectedMonth}
        {...({
          "data-hx-get": "/api/budgets/monthly/summary",
          "data-hx-target": "#budget-summary-fragment",
          "data-hx-swap": "innerHTML",
          "data-hx-trigger": "change",
        } as Record<string, string>)}
      >
        {months.map((m) => (
          <option key={m.val} value={m.val}>
            {m.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
