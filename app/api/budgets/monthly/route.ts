import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertMonthlyBudget, getMonthlyBudgetSummary } from "@/lib/budgets/service";
import { setBudgetSchema } from "@/lib/budgets/schemas";
import { renderBudgetSummaryFragment } from "@/lib/budgets/fragment";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new NextResponse(
      `<div id="budget-form-feedback-message" class="budget-feedback budget-feedback--error" data-budget-feedback="error" role="status"><p>Unauthorized. Please log in.</p></div>`,
      {
        status: 401,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

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
    return new NextResponse(
      `<div id="budget-form-feedback-message" class="budget-feedback budget-feedback--error" data-budget-feedback="error" role="status"><p>Invalid request body.</p></div>`,
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const parsed = setBudgetSchema.safeParse(formData);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map((i) => i.message).join(", ");
    return new NextResponse(
      `<div id="budget-form-feedback-message" class="budget-feedback budget-feedback--error" data-budget-feedback="error" role="status"><p>Validation error: ${errorMessage}</p></div>`,
      {
        status: 422,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  try {
    const { month, amount } = parsed.data;
    await upsertMonthlyBudget(supabase, user.id, month, amount);

    const summary = await getMonthlyBudgetSummary(supabase, user.id, month);
    const html = renderBudgetSummaryFragment(summary);

    const feedbackHtml = `
      <div id="budget-form-feedback-message" class="budget-feedback budget-feedback--success" data-budget-feedback="success" role="status">
        <p>Budget for ${month} was saved successfully.</p>
      </div>
      ${html}
    `;

    return new NextResponse(feedbackHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "HX-Trigger": "budgetChanged",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new NextResponse(
      `<div id="budget-form-feedback-message" class="budget-feedback budget-feedback--error" data-budget-feedback="error" role="status"><p>Failed to update budget: ${message}</p></div>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
