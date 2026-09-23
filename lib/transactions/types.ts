export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export type ApiError = {
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
