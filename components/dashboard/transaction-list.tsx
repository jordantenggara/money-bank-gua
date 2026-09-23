"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionRow, TransactionItem } from "@/components/transactions/transaction-row";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";

type TransactionListProps = {
  transactions: TransactionItem[];
  onAdd: (data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) => Promise<void>;
  onEdit: (id: string, data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TransactionList({ transactions, onAdd, onEdit, onDelete }: TransactionListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  async function handleAddSubmit(data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    await onAdd(data);
    setIsAddOpen(false);
  }

  async function handleEditSubmit(data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    if (!editingTransaction) return;
    await onEdit(editingTransaction.id, data);
    setEditingTransaction(null);
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "income") return tx.type === "income";
    if (filter === "expense") return tx.type === "expense";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Transaction History</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your income and expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* UI-based Transaction Filter */}
          <div className="inline-flex rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-sm text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                filter === "all"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("income")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                filter === "income"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFilter("expense")}
              className={`rounded px-3 py-1 font-medium transition-colors ${
                filter === "expense"
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Expense
            </button>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>+ Add Transaction</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No transactions found for this filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  onEdit={(t) => setEditingTransaction(t)}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Dialog */}
      <TransactionDialog isOpen={isAddOpen} title="Add Transaction" onClose={() => setIsAddOpen(false)}>
        <TransactionForm
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddOpen(false)}
        />
      </TransactionDialog>

      {/* Edit Transaction Dialog */}
      <TransactionDialog
        isOpen={!!editingTransaction}
        title="Edit Transaction"
        onClose={() => setEditingTransaction(null)}
      >
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingTransaction(null)}
        />
      </TransactionDialog>
    </div>
  );
}
