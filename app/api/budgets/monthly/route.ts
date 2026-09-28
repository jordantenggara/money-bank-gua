import type { ZodError } from "zod";
import {
  htmlResponse,
  renderBudgetFeedback,
} from "../../../../lib/budgets/fragment.ts";
import { monthlyBudgetFormSchema } from "../../../../lib/budgets/schemas.ts";
import { setMonthlyBudget } from "../../../../lib/budgets/service.ts";
import { BudgetServiceError } from "../../../../lib/budgets/types.ts";
import type { MonthlyBudget } from "../../../../lib/budgets/types.ts";

type SetBudget = (input: {
  month: string;
  amount: number;
}) => Promise<MonthlyBudget>;

function validationResponse(error: ZodError) {
  const flattened = error.flatten();
  const fieldErrors = Object.fromEntries(
    Object.entries(flattened.fieldErrors).filter(
      (entry): entry is [string, string[]] => Array.isArray(entry[1]),
    ),
  );

  return htmlResponse(
    renderBudgetFeedback(
      "error",
      flattened.formErrors[0] ?? "Please correct the budget values.",
      fieldErrors,
    ),
    { status: 422 },
  );
}

function serviceErrorResponse(error: unknown) {
  if (error instanceof BudgetServiceError) {
    const status = error.code === "UNAUTHENTICATED" ? 401 : 500;
    return htmlResponse(renderBudgetFeedback("error", error.message), { status });
  }

  console.error("Unexpected monthly budget request failure.", {
    errorType: error instanceof Error ? error.name : typeof error,
  });
  return htmlResponse(
    renderBudgetFeedback("error", "The budget request could not be completed."),
    { status: 500 },
  );
}

export function createPutMonthlyBudgetHandler(
  saveBudget: SetBudget = setMonthlyBudget,
) {
  return async function PUT(request: Request) {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return htmlResponse(
        renderBudgetFeedback("error", "Request body must be valid form data."),
        { status: 400 },
      );
    }

    const parsed = monthlyBudgetFormSchema.safeParse({
      month: formData.get("month"),
      amount: formData.get("amount"),
    });
    if (!parsed.success) return validationResponse(parsed.error);

    try {
      const budget = await saveBudget(parsed.data);
      return htmlResponse(
        renderBudgetFeedback(
          "success",
          `Budget for ${budget.month} was saved successfully.`,
        ),
        { headers: { "HX-Trigger": "budgetChanged" } },
      );
    } catch (error) {
      return serviceErrorResponse(error);
    }
  };
}

export const PUT = createPutMonthlyBudgetHandler();
