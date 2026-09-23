import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  data: T;
  error: null;
};

export type ApiError = {
  data: null;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null } as ApiSuccess<T>, { status });
}

export function errorResponse(code: string, message: string, status = 400, fieldErrors?: Record<string, string[]>) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    } as ApiError,
    { status }
  );
}