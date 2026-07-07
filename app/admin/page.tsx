"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Users, CheckCircle2, MessageSquare, Video, Loader2 } from "lucide-react";
import { AdminSidebar } from "./_components/admin-sidebar";

export default function AdminDashboard() {
  const { loading } = useAdminAuth();
  const [stats, setStats] = useState({ guests: 0, scanned: 0, messages: 0, videos: 0 });

  useEffect(() => {
    if (loading) return;
    const fetchData = async () => {
      const countOf = (table: string) =>
        supabase.from(table).select("*", { count: "exact", head: true });

      const [guests, scanned, messages, videos] = await Promise.all([
        countOf("rsvps"),
        supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("scanned", true),
        countOf("wishes"),
        countOf("videos"),
      ]);

      setStats({
        guests: guests.count ?? 0,
        scanned: scanned.count ?? 0,
        messages: messages.count ?? 0,
        videos: videos.count ?? 0,
      });
    };
    fetchData();
  }, [loading]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  const cards = [
    { title: "Total Guests", value: stats.guests, icon: Users, color: "text-brand" },
    { title: "Checked In", value: stats.scanned, icon: CheckCircle2, color: "text-green-600" },
    { title: "Messages", value: stats.messages, icon: MessageSquare, color: "text-blue-600" },
    { title: "Video Clips", value: stats.videos, icon: Video, color: "text-amber-600" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 space-y-8 p-6 md:p-10">
        <header>
          <h1 className="font-serif text-3xl tracking-tight text-brand">System Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time overview of your wedding.</p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.title}</span>
                  <Icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <div className="mt-3 font-serif text-4xl text-foreground tabular-nums">{c.value}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
