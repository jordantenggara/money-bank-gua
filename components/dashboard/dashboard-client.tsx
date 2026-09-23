"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { TransactionItem } from "@/components/transactions/transaction-row";
import { Toast } from "@/components/ui/toast";

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
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setToastMessage({ message: error.message, type: "error" });
    } else {
      setTransactions(data || []);
    }
  }

  async function handleAdd(data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").insert([data]);

    if (error) {
      setToastMessage({ message: error.message, type: "error" });
      throw new Error(error.message);
    }

    setToastMessage({ message: "Transaction added successfully.", type: "success" });
    await refreshTransactions();
    router.refresh();
  }

  async function handleEdit(id: string, data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").update(data).eq("id", id);

    if (error) {
      setToastMessage({ message: error.message, type: "error" });
      throw new Error(error.message);
    }

    setToastMessage({ message: "Transaction updated successfully.", type: "success" });
    await refreshTransactions();
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      setToastMessage({ message: error.message, type: "error" });
      return;
    }

    setToastMessage({ message: "Transaction deleted successfully.", type: "success" });
    await refreshTransactions();
    router.refresh();
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
