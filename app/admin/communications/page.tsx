"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAppSettings } from "@/hooks/useAppSettings";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Megaphone,
  MessageSquare,
  Send,
  Check,
  Link2,
  History,
} from "lucide-react";

interface Comm {
  id: string;
  type: "announcement" | "sms";
  message: string;
  link: string | null;
  status: string;
  recipients: number | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-50 text-green-700 border-green-100",
  sent: "bg-green-50 text-green-700 border-green-100",
  "no-recipients": "bg-amber-50 text-amber-700 border-amber-100",
  "not-configured": "bg-amber-50 text-amber-700 border-amber-100",
  failed: "bg-red-50 text-red-600 border-red-100",
};

export default function CommunicationsPage() {
  const { loading } = useAdminAuth();
  const { settings } = useAppSettings();
  const [history, setHistory] = useState<Comm[]>([]);

  const [annMsg, setAnnMsg] = useState("");
  const [annLink, setAnnLink] = useState("");
  const [annActive, setAnnActive] = useState(false);
  const [savingAnn, setSavingAnn] = useState(false);
  const [savedAnn, setSavedAnn] = useState(false);

  const [smsMsg, setSmsMsg] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [smsResult, setSmsResult] = useState("");

  useEffect(() => {
    if (loading) return;
    const load = async () => {
      const { data } = await supabase
        .from("communications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setHistory((data ?? []) as Comm[]);
    };
    load();
    const channel = supabase
      .channel("communications-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "communications" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  useEffect(() => {
    setAnnMsg(settings.announcement ?? "");
    setAnnLink(settings.announcement_link ?? "");
    setAnnActive(settings.announcement_active);
  }, [settings.announcement, settings.announcement_link, settings.announcement_active]);

  const logComm = (row: {
    type: string;
    message: string;
    link?: string | null;
    status: string;
    recipients?: number | null;
  }) => supabase.from("communications").insert(row);

  const publishAnnouncement = async (active: boolean) => {
    setSavingAnn(true);
    setSavedAnn(false);
    const { error } = await supabase
      .from("app_settings")
      .update({
        announcement: annMsg.trim() || null,
        announcement_link: annLink.trim() || null,
        announcement_active: active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (!error) {
      setAnnActive(active);
      setSavedAnn(true);
      setTimeout(() => setSavedAnn(false), 3000);
      if (active && annMsg.trim()) {
        await logComm({
          type: "announcement",
          message: annMsg.trim(),
          link: annLink.trim() || null,
          status: "published",
        });
      }
    }
    setSavingAnn(false);
  };

  const sendSms = async () => {
    if (!smsMsg.trim()) return;
    setSendingSms(true);
    setSmsResult("");
    let status = "failed";
    let recipients: number | null = null;
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sess.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ message: smsMsg.trim() }),
      });
      const j = await res.json();
      status = j.status ?? (res.ok ? "sent" : "failed");
      recipients = typeof j.sent === "number" ? j.sent : null;
      setSmsResult(j.note ?? j.error ?? "Message processed.");
    } catch {
      setSmsResult("Could not reach the SMS service.");
    }
    await logComm({ type: "sms", message: smsMsg.trim(), status, recipients });
    setSendingSms(false);
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
        <h1 className="font-serif text-3xl tracking-tight text-brand">Communications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Broadcast announcements and messages to your guests.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Announcement */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <Megaphone className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold">Announcement Banner</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Shows at the top of every guest page. Add an optional link.
          </p>
          <div className="space-y-3">
            <textarea
              value={annMsg}
              onChange={(e) => setAnnMsg(e.target.value)}
              rows={3}
              placeholder="e.g. The ceremony will start 15 minutes late."
              className="w-full resize-none rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-brand/40"
            />
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={annLink}
                onChange={(e) => setAnnLink(e.target.value)}
                placeholder="https://… (optional link)"
                className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-brand/40"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => publishAnnouncement(true)}
              disabled={savingAnn || !annMsg.trim()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
            >
              {savingAnn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedAnn && annActive ? (
                <Check className="h-4 w-4" />
              ) : null}
              Publish
            </button>
            <button
              onClick={() => publishAnnouncement(false)}
              disabled={savingAnn}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              Hide banner
            </button>
            <span className="text-xs text-muted-foreground">
              {annActive ? "● Currently showing" : "○ Hidden"}
            </span>
          </div>
        </div>

        {/* SMS */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-brand">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold">Send SMS</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Draft a text message to broadcast to guests.
          </p>
          <textarea
            value={smsMsg}
            onChange={(e) => setSmsMsg(e.target.value)}
            rows={4}
            maxLength={320}
            placeholder="e.g. Reminder: doors open at 4 PM today. See you soon!"
            className="w-full resize-none rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-brand/40"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{smsMsg.length}/320</span>
            <button
              onClick={sendSms}
              disabled={sendingSms || !smsMsg.trim()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
            >
              {sendingSms ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send SMS
            </button>
          </div>
          {smsResult && (
            <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              {smsResult}
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand" />
          <h2 className="font-serif text-lg font-semibold text-brand">Message History</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 pl-6">Type</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {history.map((c) => (
                  <tr key={c.id} className="align-top transition-colors hover:bg-muted/30">
                    <td className="p-4 pl-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium capitalize text-foreground">
                        {c.type === "sms" ? (
                          <MessageSquare className="h-3.5 w-3.5 text-brand" />
                        ) : (
                          <Megaphone className="h-3.5 w-3.5 text-brand" />
                        )}
                        {c.type}
                      </span>
                    </td>
                    <td className="max-w-xs p-4">
                      <p className="truncate text-foreground">{c.message}</p>
                      {c.link && (
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-xs text-brand hover:underline"
                        >
                          {c.link}
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                          STATUS_STYLES[c.status] ?? "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.status}
                        {typeof c.recipients === "number" ? ` · ${c.recipients}` : ""}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-sm text-muted-foreground">
                      No messages sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
