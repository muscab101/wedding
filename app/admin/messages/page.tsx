"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Trash2, Loader2, MessageSquareText, Calendar } from "lucide-react";
import type { Wish } from "@/lib/types";

export default function MessagesAdminPage() {
  const { loading } = useAdminAuth();
  const [messages, setMessages] = useState<Wish[]>([]);

  useEffect(() => {
    if (loading) return;
    const load = async () => {
      const { data } = await supabase.from("wishes").select("*").order("created_at", { ascending: false });
      setMessages((data ?? []) as Wish[]);
    };
    load();
    const channel = supabase
      .channel("wishes-admin-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this message?")) {
      await supabase.from("wishes").delete().eq("id", id);
    }
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
          <h1 className="font-serif text-3xl tracking-tight text-brand">Guest Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read and audit the blessings sent by your guests. {messages.length} total.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand">
                  <MessageSquareText className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wide">{msg.name || "Anonymous Guest"}</span>
                  {msg.relation && (
                    <span className="text-xs font-normal normal-case text-muted-foreground">· {msg.relation}</span>
                  )}
                </div>
                <p className="text-sm italic leading-relaxed text-foreground">&ldquo;{msg.text}&rdquo;</p>
                {msg.created_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(msg.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(msg.id)}
                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
              No messages yet.
            </div>
          )}
        </div>
    </main>
  );
}
