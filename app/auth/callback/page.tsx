"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * OAuth landing route. Supabase redirects here after Google sign-in with a
 * `?code=` (PKCE). The browser client's `detectSessionInUrl` exchanges that
 * code for a session automatically; we simply wait for the session to be
 * established, then route the guest onward. Having a single dedicated callback
 * URL (covered by the Supabase redirect allow-list) makes this reliable in
 * production instead of depending on whatever page the redirect lands on.
 */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    const goOnward = () => {
      if (settled) return;
      settled = true;
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/dashboard");
    };

    // Surface any error Supabase passed back (e.g. access denied, bad config).
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errDesc = query.get("error_description") || hash.get("error_description");
    if (errDesc) {
      setError(errDesc);
      return;
    }

    // The session may already be exchanged by the time we mount...
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goOnward();
    });

    // ...otherwise fire once the code exchange completes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goOnward();
    });

    // Safety net: if nothing resolves, send the user back to sign in.
    const timeout = setTimeout(() => {
      if (!settled) router.replace("/login");
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5">
      <div className="text-center">
        {error ? (
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
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
      </div>
    </main>
  );
}
