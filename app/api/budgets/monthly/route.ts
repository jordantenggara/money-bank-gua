import { setMonthlyBudget, getMonthlyBudgetSummary } from "@/lib/budgets/service";
import { renderBudgetSummary, renderBudgetFeedback, htmlResponse } from "@/lib/budgets/fragment";
import { monthlyBudgetFormSchema } from "@/lib/budgets/schemas";
import { BudgetServiceError } from "@/lib/budgets/types";

export async function PUT(request: Request) {
  let formData;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      formData = {
        month: params.get("month"),
        amount: params.get("amount"),
      };
    } else {
      formData = await request.json();
    }
  } catch {
    const errorHtml = renderBudgetFeedback("error", "Invalid request body.");
    return htmlResponse(errorHtml, { status: 400 });
  }

  const parsed = monthlyBudgetFormSchema.safeParse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    const errorHtml = renderBudgetFeedback("error", "Validation error", fieldErrors);
    return htmlResponse(errorHtml, { status: 422 });
  }

  try {
    const { month, amount } = parsed.data;
    await setMonthlyBudget({ month, amount });

    const summary = await getMonthlyBudgetSummary(month);
    const summaryHtml = renderBudgetSummary(summary);
    const feedbackHtml = renderBudgetFeedback("success", `Budget for ${month} was saved successfully.`);

    const responseHtml = `
      <div id="budget-form-feedback-message">
        ${feedbackHtml}
      </div>
      ${summaryHtml}
    `;

    return htmlResponse(responseHtml, {
      status: 200,
      headers: {
        "HX-Trigger": "budgetChanged",
      },
    });
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
