"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldCheck, Database, Radio, CalendarClock, Check } from "lucide-react";

// ISO -> "YYYY-MM-DDTHH:mm" in the browser's local time (for the datetime-local input)
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function SettingsAdminPage() {
  const { user, loading } = useAdminAuth();
  const { settings } = useAppSettings();
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Seed the input from the current wedding date once it loads.
  useEffect(() => {
    setDateInput(toLocalInput(settings.wedding_date));
  }, [settings.wedding_date]);

  const saveDate = async () => {
    if (!dateInput) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const iso = new Date(dateInput).toISOString();
    const { error: err } = await supabase
      .from("app_settings")
      .update({ wedding_date: iso, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (err) {
      console.error(err);
      setError("Could not save — check your admin permissions and try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  return (
    <main className="flex-1 space-y-6 p-6 md:p-10">
      <header>
        <h1 className="font-serif text-3xl tracking-tight text-brand">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the wedding date and review access &amp; data.
        </p>
      </header>

      <div className="grid max-w-3xl grid-cols-1 gap-4">
        {/* Wedding date */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <CalendarClock className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold">Wedding Date &amp; Time</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Changing this updates the countdown, RSVP deadline, entry passes and calendar
            links across the whole site. Enter the local time at the venue (London).
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-11 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-brand/40"
            />
            <button
              onClick={saveDate}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : null}
              {saved ? "Saved" : "Save Date"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold">Security Context</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            The admin panel is restricted to a single administrator account.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4 text-sm">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium text-foreground">{user?.email ?? "admin@gmail.com"}</span>
          </div>
        </div>

        {/* Data */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <Database className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold">Data</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Guests, wishes, and videos are stored in Supabase (Postgres) and protected by
            row-level security.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <Radio className="h-4 w-4 text-green-600" />
            Realtime updates are enabled — dashboards refresh automatically as guests interact.
          </div>
        </div>
      </div>
    </main>
  );
}
