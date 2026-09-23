import { TransactionServiceError } from "./errors.ts";

type ClaimsData = {
  claims?: {
    sub?: unknown;
  };
} | null;

export function requireAuthenticatedUserId(
  data: ClaimsData,
  error: unknown,
): string {
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || !userId) {
    throw new TransactionServiceError(
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  return userId;
}

export function requireVisibleTransaction<T>(data: T | null): T {
  if (!data) {
    throw new TransactionServiceError("NOT_FOUND", "Transaction not found.");
  }

  return data;
}
