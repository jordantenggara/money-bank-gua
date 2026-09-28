import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { BudgetPanel } from "@/components/budget/budget-panel";
import { HtmxLoader } from "@/components/htmx/htmx-loader";
import { getMonthlyBudgetSummary } from "@/lib/budgets/service";
import { renderBudgetSummary } from "@/lib/budgets/fragment";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const hideBalanceCookie = cookieStore.get("money-bank-gua-hide-balance")?.value === "true";

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const initialSummary = await getMonthlyBudgetSummary(currentMonth);
  const initialSummaryHtml = renderBudgetSummary(initialSummary);

  return (
    <div className="space-y-10">
      <HtmxLoader />
      <DashboardClient initialTransactions={transactions || []} initialHideBalance={hideBalanceCookie} />
      <hr className="border-zinc-200 dark:border-zinc-800" />
      <BudgetPanel currentMonth={currentMonth} initialSummaryHtml={initialSummaryHtml} />
    </div>
  );
}
