import { getMonthlyBudgetSummary } from "@/lib/budgets/service";
import { renderBudgetSummary, renderBudgetFeedback, htmlResponse } from "@/lib/budgets/fragment";
import { budgetMonthSchema } from "@/lib/budgets/schemas";
import { BudgetServiceError } from "@/lib/budgets/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const parsedMonth = budgetMonthSchema.safeParse(monthParam);
  if (!parsedMonth.success) {
    const errorHtml = renderBudgetFeedback("error", "Invalid month format. Expected YYYY-MM.");
    return htmlResponse(errorHtml, { status: 400 });
  }

  try {
    const summary = await getMonthlyBudgetSummary(parsedMonth.data);
    const html = renderBudgetSummary(summary);
    return htmlResponse(html, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof BudgetServiceError && err.code === "UNAUTHENTICATED") {
      const errorHtml = renderBudgetFeedback("error", "Authentication is required.");
      return htmlResponse(errorHtml, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    const errorHtml = renderBudgetFeedback("error", message);
    return htmlResponse(errorHtml, { status: 500 });
  }
}
