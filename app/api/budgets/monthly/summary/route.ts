import {
  htmlResponse,
  renderBudgetFeedback,
  renderBudgetSummary,
} from "../../../../../lib/budgets/fragment.ts";
import { budgetMonthSchema } from "../../../../../lib/budgets/schemas.ts";
import { getMonthlyBudgetSummary } from "../../../../../lib/budgets/service.ts";
import { BudgetServiceError } from "../../../../../lib/budgets/types.ts";
import type { MonthlyBudgetSummary } from "../../../../../lib/budgets/types.ts";

type GetSummary = (month: string) => Promise<MonthlyBudgetSummary>;

function serviceErrorResponse(error: unknown) {
  if (error instanceof BudgetServiceError) {
    const status = error.code === "UNAUTHENTICATED" ? 401 : 500;
    return htmlResponse(renderBudgetFeedback("error", error.message), { status });
  }

  console.error("Unexpected monthly budget summary failure.", {
    errorType: error instanceof Error ? error.name : typeof error,
  });
  return htmlResponse(
    renderBudgetFeedback(
      "error",
      "The budget summary could not be loaded.",
    ),
    { status: 500 },
  );
}

export function createGetMonthlyBudgetSummaryHandler(
  loadSummary: GetSummary = getMonthlyBudgetSummary,
) {
  return async function GET(request: Request) {
    const month = new URL(request.url).searchParams.get("month");
    const parsed = budgetMonthSchema.safeParse(month);

    if (!parsed.success) {
      return htmlResponse(
        renderBudgetFeedback("error", parsed.error.issues[0].message, {
          month: parsed.error.issues.map((issue) => issue.message),
        }),
        { status: 422 },
      );
    }

    try {
      return htmlResponse(renderBudgetSummary(await loadSummary(parsed.data)));
    } catch (error) {
      return serviceErrorResponse(error);
    }
  };
}

export const GET = createGetMonthlyBudgetSummaryHandler();
