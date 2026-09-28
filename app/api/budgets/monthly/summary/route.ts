import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyBudgetSummary } from "@/lib/budgets/service";
import { renderBudgetSummaryFragment } from "@/lib/budgets/fragment";
import { monthSchema } from "@/lib/budgets/schemas";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const parsedMonth = monthSchema.safeParse(monthParam);
  if (!parsedMonth.success) {
    return new NextResponse("<div class='p-3 text-sm text-red-600 bg-red-50 rounded'>Invalid month format.</div>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new NextResponse("<div class='p-3 text-sm text-red-600 bg-red-50 rounded'>Unauthorized. Please log in.</div>", {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const summary = await getMonthlyBudgetSummary(supabase, user.id, parsedMonth.data);
    const html = renderBudgetSummaryFragment(summary);
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new NextResponse(`<div class='p-3 text-sm text-red-600 bg-red-50 rounded'>Error: ${message}</div>`, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
