"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Trash2, Loader2, CheckCircle, Clock, Calendar, Download } from "lucide-react";
import type { Rsvp } from "@/lib/types";

export default function GuestsAdminPage() {
  const { loading } = useAdminAuth();
  const [guests, setGuests] = useState<Rsvp[]>([]);

  useEffect(() => {
    if (loading) return;
    const load = async () => {
      const { data } = await supabase.from("rsvps").select("*").order("created_at", { ascending: false });
      setGuests((data ?? []) as Rsvp[]);
    };
    load();
    const channel = supabase
      .channel("rsvps-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      await supabase.from("rsvps").delete().eq("id", id);
    }
  };

  // Download the current guest list as a CSV (Excel-friendly, UTF-8 with BOM).
  const exportCsv = () => {
    const headers = ["Name", "Pass ID", "Party Size", "Verified", "RSVP Status", "Created At"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = guests.map((g) =>
      [
        g.name,
        g.pass_id,
        String(g.total_guests || 1),
        g.scanned ? "Yes" : "No",
        g.status,
        g.created_at ? new Date(g.created_at).toISOString() : "",
      ].map(esc).join(",")
    );
    const csv = [headers.map(esc).join(","), ...rows].join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-guests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  return (
    <main className="flex-1 space-y-6 p-6 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-brand">Guest Records</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage guest information and monitor entry status. {guests.length} total.
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={guests.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-brand transition hover:bg-accent disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Pass ID</th>
                  <th className="p-4 text-center">Party</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {guests.map((guest) => (
                  <tr key={guest.id} className="transition-colors hover:bg-muted/30">
                    <td className="p-4 pl-6 font-semibold text-foreground">{guest.name}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{guest.pass_id}</td>
                    <td className="p-4 text-center font-medium text-foreground">{guest.total_guests || 1}</td>
                    <td className="p-4">
                      {guest.scanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" /> Scanned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          <Clock className="h-3 w-3" /> Waiting
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {guest.created_at &&
                          new Date(guest.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">
                      No guests have RSVP&apos;d yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </main>
  );
}
