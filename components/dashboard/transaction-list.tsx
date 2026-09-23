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

  async function handleAddSubmit(data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    await onAdd(data);
    setIsAddOpen(false);
  }

  async function handleEditSubmit(data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    if (!editingTransaction) return;
    await onEdit(editingTransaction.id, data);
    setEditingTransaction(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Transaction History</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your income and expenses.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>+ Add Transaction</Button>
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No transactions found. Add your first transaction to get started.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
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
