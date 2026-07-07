"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Hash, Clock, Users } from "lucide-react";
import { passIdSchema } from "@/lib/schemas";
import type { Rsvp } from "@/lib/types";

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
    } = supabase.auth.onAuthStateChange((_event, session) =>
      guard(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const findGuestByPass = async (rawValue: string) => {
    // 1. Validate the QR payload before hitting the database.
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

    // Conditional update: `.eq("scanned", false)` makes this atomic — only the
    // first scan of a pass matches, so two devices can't both approve it.
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
      setMessage("⚠️ This pass has already been used.");
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
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center text-[#8B4F58]">
            Gate Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!scanned && (
            <Scanner
              onScan={handleScan}
              onError={(error) => console.error("Scanner error:", error)}
              constraints={{ facingMode: "environment" }}
            />
          )}

          {status === "found" && guestData && (
            <div className="bg-white border-2 border-[#8B4F58] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-400 uppercase tracking-widest">
                  Guest Details
                </p>
                <h2 className="text-2xl font-serif text-[#8B4F58]">
                  {guestData.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" /> {guestData.total_guests} Guests
                </div>
                <div className="flex items-center gap-2 text-sm font-mono">
                  <Hash className="w-4 h-4" /> {guestData.pass_id}
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Registered:{" "}
                  {guestData.created_at
                    ? new Date(guestData.created_at).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              {guestData.scanned ? (
                <div className="text-red-500 font-bold text-center">
                  ⚠️ Already Used!
                </div>
              ) : (
                <Button
                  onClick={confirmVerification}
                  className="w-full bg-[#8B4F58] hover:bg-[#723E46]"
                >
                  Verify & Approve Entry
                </Button>
              )}
            </div>
          )}

          {status === "success" && (
            <div className="text-green-600 text-center font-bold p-4 bg-green-50 rounded-xl">
              ✅ {message}
            </div>
          )}
          {status === "error" && (
            <div className="text-red-600 text-center p-4">❌ {message}</div>
          )}

          {scanned && (
            <Button variant="ghost" onClick={reset} className="w-full mt-4">
              Scan Next
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
