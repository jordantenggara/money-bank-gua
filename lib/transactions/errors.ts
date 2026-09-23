export type TransactionServiceErrorCode =
  | "UNAUTHENTICATED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export class TransactionServiceError extends Error {
  public readonly code: TransactionServiceErrorCode;

  constructor(code: TransactionServiceErrorCode, message: string) {
    super(message);
    this.name = "TransactionServiceError";
    this.code = code;
  }
}
