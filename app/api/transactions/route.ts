import {
  readJson,
  serviceErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/transactions/http";
import { createTransactionSchema } from "@/lib/transactions/schemas";
import {
  createTransaction,
  listTransactions,
} from "@/lib/transactions/service";

export async function GET() {
  try {
    return successResponse(await listTransactions());
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (body.response) return body.response;

  const parsed = createTransactionSchema.safeParse(body.data);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  try {
    return successResponse(await createTransaction(parsed.data), 201);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
