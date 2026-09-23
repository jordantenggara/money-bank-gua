import {
  errorResponse,
  readJson,
  serviceErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/transactions/http";
import {
  transactionIdSchema,
  updateTransactionSchema,
} from "@/lib/transactions/schemas";
import {
  deleteTransaction,
  updateTransaction,
} from "@/lib/transactions/service";

type TransactionRouteContext = {
  params: Promise<{ id: string }>;
};

async function parseId(context: TransactionRouteContext) {
  const { id } = await context.params;
  return transactionIdSchema.safeParse(id);
}

export async function PATCH(
  request: Request,
  context: TransactionRouteContext,
) {
  const parsedId = await parseId(context);
  if (!parsedId.success) {
    return errorResponse(400, "BAD_REQUEST", parsedId.error.issues[0].message);
  }

  const body = await readJson(request);
  if (body.response) return body.response;

  const parsedBody = updateTransactionSchema.safeParse(body.data);
  if (!parsedBody.success) return validationErrorResponse(parsedBody.error);

  try {
    return successResponse(
      await updateTransaction(parsedId.data, parsedBody.data),
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: TransactionRouteContext,
) {
  const parsedId = await parseId(context);
  if (!parsedId.success) {
    return errorResponse(400, "BAD_REQUEST", parsedId.error.issues[0].message);
  }

  try {
    await deleteTransaction(parsedId.data);
    return new Response(null, { status: 204 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
