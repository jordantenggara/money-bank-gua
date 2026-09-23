"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);
    const { error: signOutError } = await createClient().auth.signOut();
    setIsSubmitting(false);

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60"
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging out…" : "Logout"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
