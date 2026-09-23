import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import LogoutButton from "@/components/logout-button";
import { cookies } from "next/headers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("money-bank-gua-theme")?.value;
  const defaultTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Money Bank Gua</span>
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Student Expense Tracker
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Money Bank Gua &copy; {new Date().getFullYear()} - Student Expense Tracker
        </footer>
      </div>
    </ThemeProvider>
  );
}
