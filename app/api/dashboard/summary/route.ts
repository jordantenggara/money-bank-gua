import {
  serviceErrorResponse,
  successResponse,
} from "@/lib/transactions/http";
import { getDashboardSummary } from "@/lib/transactions/service";

export async function GET() {
  try {
    return successResponse(await getDashboardSummary());
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
