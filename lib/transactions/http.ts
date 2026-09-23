import { ZodError } from "zod";
import { TransactionServiceError } from "@/lib/transactions/errors";
import type {
  ApiError,
  ApiErrorCode,
  ApiSuccess,
} from "@/lib/transactions/types";

export function successResponse<T>(data: T, status = 200) {
  const body: ApiSuccess<T> = { data, error: null };
  return Response.json(body, { status });
}

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
) {
  const body: ApiError = {
    data: null,
    error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) },
  };
  return Response.json(body, { status });
}

export function validationErrorResponse(error: ZodError) {
  const flattened = error.flatten();
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened.fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]),
    ),
  );

  return errorResponse(
    422,
    "VALIDATION_ERROR",
    flattened.formErrors[0] ?? "The request contains invalid values.",
    fieldErrors,
  );
}

export function serviceErrorResponse(error: unknown) {
  if (error instanceof TransactionServiceError) {
    if (error.code === "UNAUTHENTICATED") {
      return errorResponse(401, error.code, error.message);
    }
    if (error.code === "NOT_FOUND") {
      return errorResponse(404, error.code, error.message);
    }
    return errorResponse(500, error.code, error.message);
  }

  console.error("Unexpected transaction request failure.", {
    errorType: error instanceof Error ? error.name : typeof error,
  });
  return errorResponse(
    500,
    "INTERNAL_ERROR",
    "The transaction request could not be completed.",
  );
}

export async function readJson(request: Request) {
  try {
    return { data: await request.json(), response: null } as const;
  } catch {
    return {
      data: null,
      response: errorResponse(400, "BAD_REQUEST", "Request body must be valid JSON."),
    } as const;
  }
}
