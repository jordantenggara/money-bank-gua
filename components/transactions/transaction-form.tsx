"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TransactionItem } from "./transaction-row";

type TransactionFormProps = {
  initialData?: TransactionItem | null;
  onSubmit: (data: { type: "income" | "expense"; amount: number; description: string; transaction_date: string }) => Promise<void>;
  onCancel: () => void;
};

export function TransactionForm({ initialData, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">(initialData?.type || "income");
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [transactionDate, setTransactionDate] = useState(
    initialData?.transaction_date || new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc || trimmedDesc.length > 200) {
      setError("Description is required (1-200 characters).");
      return;
    }

    if (!transactionDate) {
      setError("Transaction date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: numericAmount,
        description: trimmedDesc,
        transaction_date: transactionDate,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save transaction.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value as "income" | "expense")}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>

      <Input
        label="Amount (IDR)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="e.g. 50000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Input
        label="Description"
        type="text"
        maxLength={200}
        placeholder="e.g. Lunch with friends"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <Input
        label="Transaction Date"
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        required
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400" role="status">{error}</p>}

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Transaction" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
