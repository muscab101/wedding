"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { domToPng } from "modern-screenshot";
import { supabase } from "@/lib/supabase";
import { generatePassId, rsvpInputSchema } from "@/lib/schemas";
import type { RsvpPass } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  CheckCircle,
  User,
  Users,
  Calendar,
  MapPin,
  Download,
  QrCode,
  Sparkles,
  Loader2,
  Wallet,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Navbar from "../_components/Navbar";
import Celebration from "../_components/Celebration";

export default function RsvpAndPassPage() {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [status, setStatus] = useState("attending");
  const [loading, setLoading] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<RsvpPass | null>(null);
  const [savingPass, setSavingPass] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const passRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Require a logged-in guest before any pass / QR code is shown.
  // No session => no form, no pass, no QR.
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

  // Restore a previously generated pass from localStorage — but only for a
  // signed-in guest, so a logged-out visitor can never see a QR code.
  useEffect(() => {
    if (!authUser) {
      setGeneratedPass(null);
      return;
    }
    const savedPass = localStorage.getItem("wedding_pass");
    if (savedPass) {
      setGeneratedPass(JSON.parse(savedPass));
    }
  }, [authUser]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Hard guard: never issue a pass to a visitor without a session.
    if (!authUser) {
      router.push("/login");
      return;
    }

    // Validate input before touching Firestore.
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
      // Collision-safe, human-readable pass ID (also enforced UNIQUE in the DB).
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
        scanned: false, // set true by the gate scanner
        scanned_at: null, // filled in at check-in
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

  // Save the pass as a high-resolution PNG the guest can keep in their phone's
  // Photos. Works on every device with no developer accounts. (Native Apple/
  // Google Wallet passes require signing certificates — a future backend step.)
  const handleSavePass = async () => {
    if (!passRef.current) return;
    setSavingPass(true);
    try {
      const dataUrl = await domToPng(passRef.current, {
        scale: 3, // sharp on retina / high-DPI phone screens
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `wedding-pass-${generatedPass?.passId ?? "entry"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to save pass:", error);
      alert("Could not save the pass image. Please try the Print option instead.");
    } finally {
      setSavingPass(false);
    }
  };

  // While we resolve the session, show a lightweight loader.
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="w-full min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B4F58]" />
        </div>
      </>
    );
  }

  // No session => block the entire RSVP / pass flow behind a sign-in gate.
  if (!authUser) {
    return (
      <>
        <Navbar />
        <div className="w-full min-h-screen bg-white flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white border border-gray-100 rounded-[32px] shadow-xs p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#8B4F58]/5 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-[#8B4F58]" />
            </div>
            <h1 className="text-2xl font-serif text-[#8B4F58] tracking-tight">
              Sign in to get your Entry Pass
            </h1>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
              Your QR entry pass is reserved for invited guests. Please sign in
              to RSVP and receive your official Digital Entry Pass.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl h-11 font-medium text-sm transition-all"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Celebration show={celebrate} onDone={() => setCelebrate(false)} />
      <div className="w-full min-h-screen bg-white py-12 px-4 max-w-4xl mx-auto space-y-10 selection:bg-[#8B4F58]/10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8B4F58]/10 bg-white text-xs font-medium text-[#8B4F58] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> RSVP &amp; Entry Pass
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#8B4F58] tracking-tight">
            {generatedPass ? "Your Digital Entry Pass" : "Confirm Your Attendance"}
          </h1>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            {generatedPass 
              ? "This pass is permanently saved on your device. Please show it at the gate."
              : "Please fill out the form below to generate your official Digital Entry Pass."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: RSVP Form */}
          <div className="md:col-span-5 bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-5">
            <h3 className="text-lg font-serif text-[#8B4F58] font-semibold">
              RSVP Status
            </h3>
            
            {!generatedPass ? (
              <form onSubmit={handleRsvpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> Full Name
                  </label>
                  <Input 
                    placeholder="e.g., Mohamed Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#8B4F58]"
                  />
                </div>

                {/* PLUS / MINUS COUNTER FOR GUESTS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" /> Total Guests (Including Yourself)
                  </label>
                  
                  <div className="flex items-center justify-between border border-gray-200 rounded-xl p-2 h-11 bg-white">
                    <span className="text-xs font-medium text-gray-700 pl-1">
                      {guests === "1" ? "Just Me (1 Person)" : `Me & ${parseInt(guests) - 1} ${parseInt(guests) === 2 ? "Guest" : "Guests"} (${guests} People)`}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={loading || guests === "1"}
                        onClick={() => setGuests((prev) => (parseInt(prev) - 1).toString())}
                        className="h-7 w-7 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <span className="text-base font-medium leading-none">-</span>
                      </Button>

                      <span className="w-6 text-center text-xs font-semibold text-gray-800">
                        {guests}
                      </span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={loading || guests === "4"}
                        onClick={() => setGuests((prev) => (parseInt(prev) + 1).toString())}
                        className="h-7 w-7 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <span className="text-base font-medium leading-none">+</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide">
                    Will You Attend?
                  </label>
                  <Select value={status} onValueChange={(v) => v && setStatus(v)} disabled={loading}>
                    <SelectTrigger className="rounded-xl border-gray-200 h-12 text-sm font-medium px-4 focus:ring-[#8B4F58] bg-white transition-all text-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    
                    <SelectContent className="p-2 rounded-xl border-gray-100 shadow-md">
                      <SelectItem 
                        value="attending" 
                        className="py-3 px-4 text-sm font-medium rounded-lg cursor-pointer focus:bg-[#8B4F58]/5 focus:text-[#8B4F58] transition-colors"
                      >
                        Yes, I will be there
                      </SelectItem>
                      <SelectItem 
                        value="maybe" 
                        className="py-3 px-4 text-sm font-medium rounded-lg cursor-pointer focus:bg-[#8B4F58]/5 focus:text-[#8B4F58] transition-colors"
                      >
                        Maybe, I'm not sure yet
                      </SelectItem>
                      <SelectItem 
                        value="declined" 
                        className="py-3 px-4 text-sm font-medium rounded-lg cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors"
                      >
                        Sorry, I cannot make it
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl h-11 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm RSVP
                </Button>
              </form>
            ) : (
              <div className="space-y-3 text-center py-4 bg-[#8B4F58]/5 rounded-2xl p-4">
                <CheckCircle className="w-8 h-8 text-[#8B4F58] mx-auto" />
                <h4 className="text-sm font-semibold text-gray-800">RSVP Confirmed!</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your spot is secured. If you wish to register a different name, you can clear this pass.
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if(confirm("Do you want to clear this pass and RSVP again?")) {
                      localStorage.removeItem("wedding_pass");
                      setGeneratedPass(null);
                    }
                  }}
                  className="mt-2 text-xs text-red-600 border-red-100 hover:bg-red-50 rounded-xl"
                >
                  Cancel &amp; Re-RSVP
                </Button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Wedding Pass Display */}
          <div className="md:col-span-7 flex flex-col items-center justify-center space-y-4">
            {generatedPass ? (
              <div className="w-full max-w-sm space-y-4">
                {/* Ticket Card */}
                <div ref={passRef} className="w-full bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-xs relative">
                  
                  {/* Top Section */}
                  <div className="bg-[#8B4F58] p-6 text-white text-center space-y-2 relative">
                    <div className="absolute top-4 right-4 text-white/20">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-white/80 font-medium">Official Entry Pass</p>
                    <h4 className="text-2xl font-serif tracking-wide">The Wedding Celebration</h4>
                    <div className="pt-2 flex items-center justify-center gap-4 text-xs text-white/90">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 11.09.2026</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Diamond lounge</span>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6 space-y-6 text-center relative bg-white">
                    
                    {/* Decorative Ticket Cutouts */}
                    <div className="absolute -left-3 top-0 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full" />
                    <div className="absolute -right-3 top-0 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full" />

                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Guest Name</p>
                      <h5 className="text-lg font-semibold text-gray-800">{generatedPass.name}</h5>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3.5 my-2">
                      <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase">Allowed Guests</p>
                        <p className="text-sm font-bold text-[#8B4F58] mt-0.5">{generatedPass.totalGuests} {generatedPass.totalGuests > 1 ? "People" : "Person"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase">Pass ID</p>
                        <p className="text-sm font-mono font-bold text-gray-700 mt-0.5">{generatedPass.passId}</p>
                      </div>
                    </div>

                    {/* REAL DYNAMIC QR CODE */}
                    <div className="flex flex-col items-center justify-center pt-2 space-y-2">
                      <div className="p-2 bg-white border border-gray-100 rounded-2xl inline-flex items-center justify-center">
                        <QRCodeSVG
                          value={generatedPass.passId}
                          size={112}
                          level="M"
                          className="w-28 h-28"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 max-w-[200px]">Please present this digital pass at the entrance gate.</p>
                    </div>
                  </div>

                  {/* Print Action */}
                  <div className="p-4 bg-white border-t border-gray-100 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => window.print()}
                      className="text-xs font-medium text-[#8B4F58] hover:text-[#723E46] hover:bg-[#8B4F58]/5 gap-1.5 rounded-xl mx-auto h-9 w-full"
                    >
                      <Download className="w-3.5 h-3.5" /> Save / Print Pass
                    </Button>
                  </div>
                </div>

                {/* SAVE PASS TO PHONE (downloads the ticket as an image) */}
                <Button
                  type="button"
                  onClick={handleSavePass}
                  disabled={savingPass}
                  className="w-full bg-black hover:bg-neutral-900 text-white rounded-xl h-11 font-sans text-sm font-medium flex items-center justify-center gap-2 border border-neutral-800 shadow-xs transition-all"
                >
                  {savingPass ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 text-white" />
                  )}
                  <span>Save Pass to Phone</span>
                </Button>
                <p className="text-[10px] text-gray-400 text-center px-2">
                  Downloads your pass as an image you can keep in your Photos and
                  show at the gate.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-[4/5] border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center text-center p-8 bg-white text-gray-400">
                <QrCode className="w-12 h-12 stroke-[1] mb-2 text-gray-300" />
                <h4 className="text-sm font-medium text-gray-600">Your pass will appear here</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">once you fill out and submit the RSVP form on the left.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}