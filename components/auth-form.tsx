"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setMessage("Email and password are required.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (isRegistering && password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const result = isRegistering
      ? await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
      : await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (isRegistering && !result.data.session) {
      setMessage("Registration successful. Check your email to confirm your account.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  const title = isRegistering ? "Create an account" : "Welcome back";
  const submitLabel = isRegistering ? "Register" : "Login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-700"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-700"
              id="password"
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {isRegistering && (
            <label className="block text-sm font-medium" htmlFor="confirm-password">
              Confirm password
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-700"
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>
          )}
          {message && (
            <p className="rounded-md bg-zinc-100 p-3 text-sm" role="status">
              {message}
            </p>
          )}
          <button
            className="w-full rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait…" : submitLabel}
          </button>
        </form>
        <p className="mt-5 text-sm text-zinc-600">
          {isRegistering ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-medium text-zinc-900 underline" href={isRegistering ? "/login" : "/register"}>
            {isRegistering ? "Login" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}
