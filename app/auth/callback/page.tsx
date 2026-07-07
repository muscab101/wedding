"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * OAuth landing route. Supabase redirects here after Google sign-in with a
 * `?code=` (PKCE). We exchange that code for a session explicitly — this is
 * deterministic (no reliance on an implicit URL scan) and any failure is shown
 * to the user instead of silently bouncing them back to sign in.
 */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errDesc =
        url.searchParams.get("error_description") ||
        new URLSearchParams(url.hash.replace(/^#/, "")).get("error_description");
      const next = url.searchParams.get("next") || "/dashboard";

      if (errDesc) {
        setError(errDesc);
        return;
      }

      // No code in the URL — maybe the session already exists (e.g. re-visit).
      if (!code) {
        const { data } = await supabase.auth.getSession();
        router.replace(data.session ? next : "/login");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Code exchange failed:", exchangeError);
        setError(exchangeError.message);
        return;
      }

      router.replace(next);
    };

    run();
  }, [router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5">
      {error ? (
        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-serif text-2xl tracking-tight text-brand">Sign-in problem</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="h-11 w-full rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <p className="text-sm">Signing you in…</p>
        </div>
      )}
    </main>
  );
}
