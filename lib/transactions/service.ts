import { createClient } from "@/lib/supabase/server";
import { TransactionServiceError } from "@/lib/transactions/errors";
import {
  requireAuthenticatedUserId,
  requireVisibleTransaction,
} from "@/lib/transactions/guards";
import { calculateSummary } from "@/lib/transactions/summary";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from "@/lib/transactions/types";

type DatabaseTransactionRow = {
  id: string;
  type: TransactionType;
  amount: number | string;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
};

type SummaryRow = Pick<DatabaseTransactionRow, "type" | "amount">;

function toTransaction(row: DatabaseTransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    transactionDate: row.transaction_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwDatabaseError(
  operation: string,
  error: { code?: string } | null,
): never {
  console.error("Transaction database operation failed.", {
    operation,
    code: error?.code ?? "UNKNOWN",
  });
  throw new TransactionServiceError(
    "INTERNAL_ERROR",
    "The transaction request could not be completed.",
  );
}

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = requireAuthenticatedUserId(data, error);

  return { supabase, userId };
}

export async function listTransactions(): Promise<Transaction[]> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, description, transaction_date, created_at, updated_at",
    )
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throwDatabaseError("list", error);
  return ((data ?? []) as DatabaseTransactionRow[]).map(toTransaction);
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: input.type,
      amount: input.amount,
      description: input.description,
      transaction_date: input.transactionDate,
    })
    .select(
      "id, type, amount, description, transaction_date, created_at, updated_at",
    )
    .single();

  if (error || !data) throwDatabaseError("create", error);
  return toTransaction(data as DatabaseTransactionRow);
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const { supabase, userId } = await getAuthenticatedContext();
  const changes: Record<string, string | number> = {};

  if (input.type !== undefined) changes.type = input.type;
  if (input.amount !== undefined) changes.amount = input.amount;
  if (input.description !== undefined) changes.description = input.description;
  if (input.transactionDate !== undefined) {
    changes.transaction_date = input.transactionDate;
  }

  const { data, error } = await supabase
    .from("transactions")
    .update(changes)
    .eq("id", id)
    .eq("user_id", userId)
    .select(
      "id, type, amount, description, transaction_date, created_at, updated_at",
    )
    .maybeSingle();

  if (error) throwDatabaseError("update", error);
  return toTransaction(requireVisibleTransaction(data) as DatabaseTransactionRow);
}

export async function deleteTransaction(id: string): Promise<void> {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throwDatabaseError("delete", error);
  requireVisibleTransaction(data);
}

export async function getDashboardSummary() {
  const { supabase, userId } = await getAuthenticatedContext();
  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", userId);

  if (error) throwDatabaseError("summary", error);
  return calculateSummary((data ?? []) as SummaryRow[]);
}
