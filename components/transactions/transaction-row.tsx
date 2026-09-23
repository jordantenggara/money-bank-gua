"use client";

import { Button } from "@/components/ui/button";

export type TransactionItem = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
};

type TransactionRowProps = {
  transaction: TransactionItem;
  onEdit: (transaction: TransactionItem) => void;
  onDelete: (id: string) => void;
};

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "income";
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(transaction.amount);

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">{transaction.transaction_date}</td>
      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{transaction.description}</td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isIncome
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {transaction.type}
        </span>
      </td>
      <td className={`px-4 py-3 text-sm font-semibold text-right ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
        {isIncome ? "+" : "-"} {formattedAmount}
      </td>
      <td className="px-4 py-3 text-right text-sm space-x-2">
        <Button variant="outline" className="text-xs px-2.5 py-1" onClick={() => onEdit(transaction)}>
          Edit
        </Button>
        <Button variant="danger" className="text-xs px-2.5 py-1" onClick={() => onDelete(transaction.id)}>
          Delete
        </Button>
      </td>
    </tr>
  );
}
