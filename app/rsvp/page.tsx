"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { generatePassId, rsvpInputSchema } from "@/lib/schemas";
import type { RsvpPass } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Download,
  Loader2,
  Lock,
  Minus,
  Plus,
  CalendarX2,
  BadgeCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../_components/Navbar";
import Celebration from "../_components/Celebration";
import { AddToCalendar } from "../_components/AddToCalendar";
import { AddToGoogleWallet } from "../_components/AddToGoogleWallet";

// RSVP closes this many days before the ceremony.
const WEDDING_DATE = new Date("September 11, 2026 18:00:00");
const RSVP_CLOSE_DAYS = 7;
const RSVP_DEADLINE = new Date(
  WEDDING_DATE.getTime() - RSVP_CLOSE_DAYS * 24 * 60 * 60 * 1000
);

export default function RsvpAndPassPage() {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [status, setStatus] = useState("attending");
  const [loading, setLoading] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<RsvpPass | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passVerified, setPassVerified] = useState(false);
  const passRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Once we're within a week of the wedding, new RSVPs are closed.
  const rsvpClosed = Date.now() >= RSVP_DEADLINE.getTime();

  // Require a logged-in guest before any pass / QR code is shown.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Restore a saved pass only for a signed-in guest.
  useEffect(() => {
    if (!authUser) {
      setGeneratedPass(null);
      return;
    }
    const savedPass = localStorage.getItem("wedding_pass");
    if (savedPass) setGeneratedPass(JSON.parse(savedPass));
  }, [authUser]);

  // Track whether this pass has been verified/scanned at the gate. Once it has,
  // the guest can no longer cancel it. Live-updates via realtime, so the pass
  // flips to "Checked In" the moment the scanner approves it.
  useEffect(() => {
    const passId = generatedPass?.passId;
    if (!passId) {
      setPassVerified(false);
      return;
    }
    let active = true;
    supabase
      .from("rsvps")
      .select("scanned")
      .eq("pass_id", passId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setPassVerified(!!data?.scanned);
      });

    const channel = supabase
      .channel(`pass-status-${passId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rsvps", filter: `pass_id=eq.${passId}` },
        (payload) => {
          if (active) setPassVerified(!!(payload.new as { scanned?: boolean }).scanned);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [generatedPass?.passId]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (rsvpClosed) {
      alert("RSVP is now closed — we're within a week of the wedding.");
      return;
    }

    const parsed = rsvpInputSchema.safeParse({
      name,
      totalGuests: parseInt(guests),
      status,
    });
    if (!parsed.success) {
      alert(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    try {
      const passId = generatePassId();
      const rsvpData: RsvpPass = {
        name: parsed.data.name,
        totalGuests: parsed.data.totalGuests,
        status: parsed.data.status,
        passId,
      };

      const { error: insertError } = await supabase.from("rsvps").insert({
        name: rsvpData.name,
        total_guests: rsvpData.totalGuests,
        status: rsvpData.status,
        pass_id: passId,
        scanned: false,
        scanned_at: null,
      });
      if (insertError) throw insertError;

      if (parsed.data.status === "attending") {
        localStorage.setItem("wedding_pass", JSON.stringify(rsvpData));
        setGeneratedPass(rsvpData);
        setCelebrate(true);
      } else {
        alert("Thank you for your response!");
        setName("");
      }
    } catch (error) {
      console.error("RSVP Error:", error);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[70vh] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      </>
    );
  }

  if (!authUser) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[70vh] w-full items-center justify-center px-5">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Lock className="h-6 w-6 text-brand" />
            </div>
            <h1 className="font-serif text-2xl tracking-tight text-brand">
              Sign in to get your Entry Pass
            </h1>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your QR entry pass is reserved for invited guests. Please sign in to
              RSVP and receive your official Digital Entry Pass.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="h-11 w-full rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Celebration show={celebrate} onDone={() => setCelebrate(false)} />
      <main className="mx-auto min-h-screen w-full max-w-4xl space-y-10 px-5 py-14 sm:px-8">
        <header className="space-y-3 text-center">
          <span className="eyebrow">RSVP &amp; Entry Pass</span>
          <h1 className="font-serif text-3xl tracking-tight text-brand sm:text-4xl">
            {generatedPass
              ? "Your Digital Entry Pass"
              : rsvpClosed
                ? "RSVP Closed"
                : "Confirm Your Attendance"}
          </h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {generatedPass
              ? "This pass is saved on your device. Please show it at the gate."
              : rsvpClosed
                ? "RSVPs are closed within a week of the wedding. Please contact the couple directly."
                : "Fill out the form below to generate your official Digital Entry Pass."}
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          {/* Form / confirmation */}
          <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:col-span-5">
            <h3 className="font-serif text-lg font-semibold text-brand">RSVP Status</h3>

            {!generatedPass ? (
              rsvpClosed ? (
                <div className="space-y-3 rounded-2xl border border-border bg-muted/40 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                    <CalendarX2 className="h-6 w-6 text-brand" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">RSVP is now closed</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    RSVPs closed one week before the wedding. If you still need to attend,
                    please contact the couple directly.
                  </p>
                </div>
              ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                  <Input
                    placeholder="e.g., Mohamed Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Total Guests (including yourself)
                  </label>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-input px-2">
                    <span className="pl-1 text-xs font-medium text-foreground">
                      {guests === "1"
                        ? "Just me (1 person)"
                        : `Me & ${parseInt(guests) - 1} ${parseInt(guests) === 2 ? "guest" : "guests"} (${guests} people)`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={loading || guests === "1"}
                        onClick={() => setGuests((p) => (parseInt(p) - 1).toString())}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-foreground">{guests}</span>
                      <button
                        type="button"
                        disabled={loading || guests === "4"}
                        onClick={() => setGuests((p) => (parseInt(p) + 1).toString())}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Will you attend?</label>
                  <Select value={status} onValueChange={(v) => v && setStatus(v)} disabled={loading}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="attending">Yes, I will be there</SelectItem>
                      <SelectItem value="maybe">Maybe, I&apos;m not sure yet</SelectItem>
                      <SelectItem value="declined">Sorry, I cannot make it</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Confirm RSVP
                </button>
              </form>
              )
            ) : (
              <div className="space-y-3 rounded-2xl bg-brand-soft p-4 text-center">
                {passVerified ? (
                  <BadgeCheck className="mx-auto h-8 w-8 text-green-600" />
                ) : (
                  <CheckCircle className="mx-auto h-8 w-8 text-brand" />
                )}
                <h4 className="text-sm font-semibold text-foreground">
                  {passVerified ? "Checked In ✓" : "RSVP Confirmed!"}
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {passVerified
                    ? "Your pass has been verified at the gate, so it can no longer be changed or cancelled."
                    : "Your spot is secured. To register a different name, clear this pass."}
                </p>
                {!passVerified && (
                  <button
                    onClick={() => {
                      if (confirm("Do you want to clear this pass and RSVP again?")) {
                        localStorage.removeItem("wedding_pass");
                        setGeneratedPass(null);
                      }
                    }}
                    className="mt-2 rounded-xl border border-red-100 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
                  >
                    Cancel &amp; Re-RSVP
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pass */}
          <div className="flex flex-col items-center justify-center md:col-span-7">
            {generatedPass ? (
              <div className="w-full max-w-sm space-y-4">
                <div ref={passRef} className="overflow-hidden rounded-[32px] border border-border bg-card shadow-sm">
                  <div className="relative space-y-2 bg-brand p-6 text-center text-white">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
                      Official Entry Pass
                    </p>
                    <h4 className="font-serif text-2xl tracking-wide">The Wedding Celebration</h4>
                    <div className="flex items-center justify-center gap-4 pt-2 text-xs text-white/90">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> 11.09.2026</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Diamond Lounge</span>
                    </div>
                  </div>

                  <div className="space-y-6 bg-card p-6 text-center">
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Guest Name</p>
                      <h5 className="text-lg font-semibold text-foreground">{generatedPass.name}</h5>
                    </div>

                    <div className="my-2 grid grid-cols-2 gap-4 border-y border-border py-3.5">
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Allowed Guests</p>
                        <p className="mt-0.5 text-sm font-bold text-brand">
                          {generatedPass.totalGuests} {generatedPass.totalGuests > 1 ? "People" : "Person"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-muted-foreground">Pass ID</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{generatedPass.passId}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 pt-2">
                      <div className="inline-flex items-center justify-center rounded-2xl border border-border bg-white p-2">
                        <QRCodeSVG value={generatedPass.passId} size={112} level="M" className="h-28 w-28" />
                      </div>
                      {passVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                          <BadgeCheck className="h-3 w-3" /> Verified · Checked In
                        </span>
                      ) : (
                        <p className="max-w-[200px] text-[10px] text-muted-foreground">
                          Please present this digital pass at the entrance gate.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border bg-card p-4 text-center">
                    <button
                      onClick={() => window.print()}
                      className="mx-auto flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-medium text-brand transition hover:bg-accent"
                    >
                      <Download className="h-3.5 w-3.5" /> Save / Print Pass
                    </button>
                  </div>
                </div>

                <AddToCalendar />

                <AddToGoogleWallet
                  saveUrl={`/api/wallet?passId=${encodeURIComponent(
                    generatedPass.passId
                  )}&name=${encodeURIComponent(generatedPass.name)}&guests=${generatedPass.totalGuests}`}
                />
              </div>
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <Lock className="h-6 w-6 text-brand/50" />
                </div>
                <h4 className="text-sm font-medium text-foreground">Your pass will appear here</h4>
                <p className="mt-1 max-w-[200px] text-xs">
                  once you fill out and submit the RSVP form.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
