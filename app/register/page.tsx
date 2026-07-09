"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "../_components/GoogleIcon";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  // New registration (Email, Password & Confirm)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password !== confirmPassword) {
      setError(t("register.errMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("register.errShort"));
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already")) setError(t("register.errInUse"));
      else if (msg.includes("valid")) setError(t("register.errInvalidEmail"));
      else setError(t("register.errGeneric"));
      setLoading(false);
      return;
    }

    // If email confirmation is on, no session is returned yet.
    if (!data.session) {
      setNotice(t("register.notice"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  // Sign up with Google Account (redirects to Google, then back)
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(t("login.errGoogle"));
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-tint),transparent_70%)]" />

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-3xl tracking-tight text-brand">
            A <span className="text-brand/40">&amp;</span> C
          </Link>
          <h1 className="mt-6 font-serif text-3xl tracking-tight text-brand">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("register.subtitle")}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-brand/15 bg-brand-soft p-3 text-sm text-brand">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t("common.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t("common.password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t("register.pwPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-foreground">
                {t("common.confirmPassword")}
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder={t("register.pwConfirmPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("register.create")}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("common.or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5" />
            {t("common.google")}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("register.haveInvite")}{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            {t("common.signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
