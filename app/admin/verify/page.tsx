"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Loader2, BadgeCheck, ShieldCheck, Search, Users } from "lucide-react";
import type { Rsvp } from "@/lib/types";

export default function VerifyAdminPage() {
  const { loading } = useAdminAuth();
  const [guests, setGuests] = useState<Rsvp[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (loading) return;
    const load = async () => {
      const { data } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });
      setGuests((data ?? []) as Rsvp[]);
    };
    load();
    const channel = supabase
      .channel("rsvps-verify-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  // Verifying a guest marks their pass approved so the gate scanner allows them.
  const setVerified = async (id: string, next: boolean) => {
    setBusyId(id);
    await supabase
      .from("rsvps")
      .update({ scanned: next, scanned_at: next ? new Date().toISOString() : null })
      .eq("id", id);
    setBusyId(null);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  const q = query.trim().toLowerCase();
  const filtered = q
    ? guests.filter(
        (g) => g.name.toLowerCase().includes(q) || g.pass_id.toLowerCase().includes(q)
      )
    : guests;
  const verifiedCount = guests.filter((g) => g.scanned).length;

  return (
    <main className="flex-1 space-y-6 p-6 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-brand">Verify Guests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Approve guests so the gate scanner can allow them in.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-brand">
            <ShieldCheck className="h-3.5 w-3.5" /> {verifiedCount} / {guests.length} verified
          </span>
        </header>

        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or pass ID…"
            className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-brand/40"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <div
              key={g.id}
              className={`space-y-3 rounded-2xl border bg-card p-5 transition ${
                g.scanned ? "border-green-200" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{g.name}</h3>
                  <p className="font-mono text-xs text-muted-foreground">{g.pass_id}</p>
                </div>
                {g.scanned && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                    <BadgeCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {g.total_guests || 1}{" "}
                {(g.total_guests || 1) > 1 ? "guests" : "guest"}
              </div>

              {g.scanned ? (
                <button
                  disabled={busyId === g.id}
                  onClick={() => setVerified(g.id, false)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-60"
                >
                  {busyId === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Undo verification
                </button>
              ) : (
                <button
                  disabled={busyId === g.id}
                  onClick={() => setVerified(g.id, true)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  {busyId === g.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BadgeCheck className="h-3.5 w-3.5" />
                  )}
                  Verify Guest
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
              {guests.length === 0 ? "No guests have RSVP'd yet." : "No guests match your search."}
            </div>
          )}
        </div>
    </main>
  );
}
