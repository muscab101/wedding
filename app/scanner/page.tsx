"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import {
  Loader2,
  Hash,
  Users,
  CheckCircle2,
  XCircle,
  ScanLine,
  ShieldAlert,
} from "lucide-react";
import { passIdSchema } from "@/lib/schemas";
import type { Rsvp } from "@/lib/types";
import { ScannerNavbar } from "../_components/Scanner-navbar";

type ScanStatus = "ready" | "checked" | "error";

export default function ScannerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [guestData, setGuestData] = useState<Rsvp | null>(null);
  const [status, setStatus] = useState<ScanStatus>("ready");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const guard = (u: User | null) => {
      if (!u || u.email !== "scanner@gmail.com") {
        router.push("/login");
      } else {
        setUser(u);
        setLoading(false);
      }
    };
    supabase.auth.getSession().then(({ data }) => guard(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => guard(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [router]);

  // Look up the pass and simply report whether the admin has verified it.
  // The scanner is read-only — it never changes any records.
  const checkPass = async (rawValue: string) => {
    const parsed = passIdSchema.safeParse(rawValue);
    if (!parsed.success) {
      setStatus("error");
      setMessage("Invalid or unrecognized QR code.");
      return;
    }

    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("pass_id", parsed.data)
      .maybeSingle();

    if (error) {
      console.error("Lookup failed:", error);
      setStatus("error");
      setMessage("Lookup failed. Check your connection and retry.");
      return;
    }
    if (!data) {
      setStatus("error");
      setMessage("No guest found for this pass.");
      return;
    }

    setGuestData(data as Rsvp);
    setStatus("checked");
  };

  const handleScan = (codes: IDetectedBarcode[]) => {
    if (scanned || codes.length === 0) return;
    const value = codes[0]?.rawValue;
    if (!value) return;
    setScanned(true);
    checkPass(value);
  };

  const reset = () => {
    setScanned(false);
    setGuestData(null);
    setStatus("ready");
    setMessage("");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  const allowed = !!guestData?.scanned;

  return (
    <div className="min-h-screen bg-muted/40">
      <ScannerNavbar userEmail={user?.email ?? ""} />

      <main className="mx-auto max-w-md space-y-5 px-4 py-8">
        <div className="space-y-1 text-center">
          <span className="eyebrow justify-center">Gate Control</span>
          <h1 className="font-serif text-2xl text-brand">Check Entry Pass</h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm">
          {!scanned && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border">
                <Scanner
                  onScan={handleScan}
                  onError={(error) => console.error("Scanner error:", error)}
                  constraints={{ facingMode: "environment" }}
                />
              </div>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ScanLine className="h-3.5 w-3.5" /> Point the camera at a guest&apos;s QR pass
              </p>
            </div>
          )}

          {status === "checked" && guestData && (
            <div className="space-y-4">
              {/* Verdict banner */}
              {allowed ? (
                <div className="flex flex-col items-center gap-1 rounded-2xl bg-green-50 p-6 text-center text-green-700">
                  <CheckCircle2 className="h-10 w-10" />
                  <p className="text-lg font-bold">Access Allowed</p>
                  <p className="text-xs text-green-600">This guest has been verified by the admin.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 rounded-2xl bg-red-50 p-6 text-center text-red-600">
                  <ShieldAlert className="h-10 w-10" />
                  <p className="text-lg font-bold">Not Verified</p>
                  <p className="text-xs text-red-500">
                    This guest has not been verified yet. Please direct them to the admin.
                  </p>
                </div>
              )}

              {/* Guest details */}
              <div className="space-y-1 rounded-2xl border border-border p-5 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest</p>
                <h2 className="font-serif text-2xl text-brand">{guestData.name}</h2>
                <div className="mt-3 flex items-center justify-center gap-4 text-sm text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand" /> {guestData.total_guests} Guests
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Hash className="h-4 w-4 text-brand" /> {guestData.pass_id}
                  </span>
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 p-4 text-center font-medium text-red-600">
              <XCircle className="h-5 w-5" /> {message}
            </div>
          )}

          {scanned && (
            <button
              onClick={reset}
              className="mt-4 h-11 w-full rounded-xl border border-border text-sm font-medium text-brand transition hover:bg-accent"
            >
              Scan Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
