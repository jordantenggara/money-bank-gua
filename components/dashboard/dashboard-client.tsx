"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { TransactionItem } from "@/components/transactions/transaction-row";
import { Toast } from "@/components/ui/toast";
import type { ApiError, ApiSuccess, Transaction } from "@/lib/transactions/types";

type TransactionFormData = {
  type: "income" | "expense";
  amount: number;
  description: string;
  transaction_date: string;
};

function toTransactionItem(transaction: Transaction): TransactionItem {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    transaction_date: transaction.transactionDate,
  };
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) return null;

  const payload = (await response.json()) as ApiSuccess<T> | ApiError;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "The request could not be completed.");
  }

  return payload.data;
}

type DashboardClientProps = {
  initialTransactions: TransactionItem[];
  initialHideBalance: boolean;
};

export function DashboardClient({ initialTransactions, initialHideBalance }: DashboardClientProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [hideBalance, setHideBalance] = useState<boolean>(initialHideBalance);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const toggleHideBalance = () => {
    const nextState = !hideBalance;
    setHideBalance(nextState);
    document.cookie = `money-bank-gua-hide-balance=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  async function refreshTransactions() {
    try {
      const data = await apiRequest<Transaction[]>("/api/transactions");
      setTransactions((data ?? []).map(toTransactionItem));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load transactions.";
      setToastMessage({ message, type: "error" });
    }
  }

  async function handleAdd(data: TransactionFormData) {
    try {
      await apiRequest<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: data.type,
          amount: data.amount,
          description: data.description,
          transactionDate: data.transaction_date,
        }),
      });
      await refreshTransactions();
      setToastMessage({ message: "Transaction added successfully.", type: "success" });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add transaction.";
      setToastMessage({ message, type: "error" });
      throw new Error(message);
    }
  }

  async function handleEdit(id: string, data: TransactionFormData) {
    try {
      await apiRequest<Transaction>(`/api/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: data.type,
          amount: data.amount,
          description: data.description,
          transactionDate: data.transaction_date,
        }),
      });
      await refreshTransactions();
      setToastMessage({ message: "Transaction updated successfully.", type: "success" });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update transaction.";
      setToastMessage({ message, type: "error" });
      throw new Error(message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await apiRequest(`/api/transactions/${id}`, { method: "DELETE" });
      await refreshTransactions();
      setToastMessage({ message: "Transaction deleted successfully.", type: "success" });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete transaction.";
      setToastMessage({ message, type: "error" });
    }
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <BalanceCard balance={balance} hidden={hideBalance} onToggleHide={toggleHideBalance} />
        </div>
        <div className="lg:col-span-2">
          <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} hidden={hideBalance} />
        </div>
      </div>

      <TransactionList
        transactions={transactions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
