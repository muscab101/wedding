"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Users, UsersRound, BadgeCheck, MessageSquare, Video, Loader2 } from "lucide-react";
import type { Rsvp } from "@/lib/types";

export default function AdminDashboard() {
  const { loading } = useAdminAuth();
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [counts, setCounts] = useState({ messages: 0, videos: 0 });

  useEffect(() => {
    if (loading) return;

    const loadRsvps = async () => {
      const { data } = await supabase.from("rsvps").select("*");
      setRsvps((data ?? []) as Rsvp[]);
    };
    const loadCounts = async () => {
      const [m, v] = await Promise.all([
        supabase.from("wishes").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ messages: m.count ?? 0, videos: v.count ?? 0 });
    };
    loadRsvps();
    loadCounts();

    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, loadRsvps)
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, loadCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, loadCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  const totalParties = rsvps.length;
  const totalPeople = rsvps.reduce((s, r) => s + (r.total_guests || 1), 0);
  const verifiedParties = rsvps.filter((r) => r.scanned).length;
  const verifiedPeople = rsvps.filter((r) => r.scanned).reduce((s, r) => s + (r.total_guests || 1), 0);
  const pct = totalParties ? Math.round((verifiedParties / totalParties) * 100) : 0;

  const cards = [
    { title: "Guest Parties", value: totalParties, icon: Users, color: "text-brand" },
    { title: "Total People", value: totalPeople, icon: UsersRound, color: "text-brand" },
    { title: "Checked In", value: verifiedParties, icon: BadgeCheck, color: "text-green-600" },
    { title: "Messages", value: counts.messages, icon: MessageSquare, color: "text-blue-600" },
    { title: "Video Clips", value: counts.videos, icon: Video, color: "text-amber-600" },
  ];

  return (
    <main className="flex-1 space-y-8 p-6 md:p-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-brand">System Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time overview of your wedding.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
          </span>
          Live
        </span>
      </header>

      {/* Check-in progress */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand">Check-in Progress</h2>
            <p className="text-sm text-muted-foreground">
              {verifiedParties} of {totalParties} parties checked in
              {totalPeople > 0 && ` · ${verifiedPeople} of ${totalPeople} people`}
            </p>
          </div>
          <span className="font-serif text-4xl text-brand tabular-nums">{pct}%</span>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </span>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="mt-3 font-serif text-4xl text-foreground tabular-nums">{c.value}</div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
