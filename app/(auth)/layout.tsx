import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cookies } from "next/headers";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("money-bank-gua-theme")?.value;
  const defaultTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <header className="absolute top-4 right-4">
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">{children}</main>
      </div>
    </ThemeProvider>
  );
}
