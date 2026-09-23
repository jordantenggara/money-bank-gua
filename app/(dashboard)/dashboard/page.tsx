import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
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

  return <DashboardClient initialTransactions={transactions || []} initialHideBalance={hideBalanceCookie} />;
}
