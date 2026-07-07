"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, ShieldCheck, Database, Radio } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";

export default function SettingsAdminPage() {
  const { user, loading } = useAdminAuth();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <header>
          <h1 className="font-serif text-3xl tracking-tight text-brand">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Access control and data overview for the portal.</p>
        </header>

        <div className="grid max-w-3xl grid-cols-1 gap-4">
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
    </div>
  );
}
