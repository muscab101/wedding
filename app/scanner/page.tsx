"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import {
  Loader2,
  Hash,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ScanLine,
} from "lucide-react";
import { passIdSchema } from "@/lib/schemas";
import type { Rsvp } from "@/lib/types";
import { ScannerNavbar } from "../_components/Scanner-navbar";

type ScanStatus = "ready" | "found" | "success" | "error";

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

  const findGuestByPass = async (rawValue: string) => {
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
    setStatus("found");
  };

  const confirmVerification = async () => {
    if (!guestData) return;
    // Atomic: only the first scan of a pass matches `.eq("scanned", false)`.
    const { data, error } = await supabase
      .from("rsvps")
      .update({ scanned: true, scanned_at: new Date().toISOString() })
      .eq("id", guestData.id)
      .eq("scanned", false)
      .select();

    if (error) {
      console.error("Verification failed:", error);
      setStatus("error");
      setMessage("Could not verify. Please retry.");
      return;
    }
    if (!data || data.length === 0) {
      setStatus("error");
      setMessage("This pass has already been used.");
      return;
    }
    setStatus("success");
    setMessage("Access granted.");
  };

  const handleScan = (codes: IDetectedBarcode[]) => {
    if (scanned || codes.length === 0) return;
    const value = codes[0]?.rawValue;
    if (!value) return;
    setScanned(true);
    findGuestByPass(value);
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

  return (
    <div className="min-h-screen bg-muted/40">
      <ScannerNavbar userEmail={user?.email ?? ""} />

      <main className="mx-auto max-w-md space-y-5 px-4 py-8">
        <div className="space-y-1 text-center">
          <span className="eyebrow justify-center">Gate Control</span>
          <h1 className="font-serif text-2xl text-brand">Scan Entry Pass</h1>
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

          {status === "found" && guestData && (
            <div className="space-y-4 rounded-2xl border border-brand/30 bg-card p-5">
              <div className="space-y-1 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest Details</p>
                <h2 className="font-serif text-2xl text-brand">{guestData.name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-brand" /> {guestData.total_guests} Guests
                </div>
                <div className="flex items-center gap-2 font-mono text-foreground">
                  <Hash className="h-4 w-4 text-brand" /> {guestData.pass_id}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-brand" />
                  Registered: {guestData.created_at ? new Date(guestData.created_at).toLocaleString() : "N/A"}
                </div>
              </div>
              {guestData.scanned ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 p-3 font-semibold text-red-600">
                  <XCircle className="h-5 w-5" /> Already Used!
                </div>
              ) : (
                <button
                  onClick={confirmVerification}
                  className="h-11 w-full rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover"
                >
                  Verify &amp; Approve Entry
                </button>
              )}
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 p-4 text-center font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" /> {message}
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
