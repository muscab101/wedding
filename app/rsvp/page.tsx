"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
  Wallet
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

export default function RsvpAndPassPage() {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [status, setStatus] = useState("attending");
  const [loading, setLoading] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<any>(null);

  // 1. Marka uu boggu kaco, hubi haddii uu Pass horey ugu keydsanaa localStorage
  useEffect(() => {
    const savedPass = localStorage.getItem("wedding_pass");
    if (savedPass) {
      setGeneratedPass(JSON.parse(savedPass));
    }
  }, []);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const passId = "WD-" + Math.floor(100000 + Math.random() * 900000); 
      
      const rsvpData = {
        name: name.trim(),
        totalGuests: parseInt(guests),
        status: status,
        passId: passId,
      };

      // U keydi Firestore iyadoo la raacinayo xaqiijinta albaabka (QR scanning fields)
      await addDoc(collection(db, "rsvps"), {
        ...rsvpData,
        scanned: false,       // Waxaa loo isticmaali doonaa xaqiijinta albaabka
        scannedAt: null,      // Markuu albaabka yimaado ayaa la buuxin doonaa
        createdAt: serverTimestamp(),
      });

      if (status === "attending") {
        // 2. Ku keydi localStorage si uusan marnaba uga bixin website-ka
        localStorage.setItem("wedding_pass", JSON.stringify(rsvpData));
        setGeneratedPass(rsvpData);
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

  // Dynamic QR Code API (Wuxuu dhaliyaa QR Code dhab ah oo ka tarjumaya Pass ID-ga)
  const qrCodeUrl = generatedPass 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generatedPass.passId}`
    : "";

  // Functions loo diyaariyay Wallet Integration (Halkaan waxaad ku xiri kartaa API-gaaga dambe)
  const handleAddToAppleWallet = () => {
    alert(`Generating Apple Wallet Pass (.pkpass) for ${generatedPass?.name}...`);
  };

  const handleAddToGoogleWallet = () => {
    alert("Redirecting to Google Wallet Save URL...");
  };

  return (
    <>
      <Navbar />
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
                  <Select value={status} onValueChange={setStatus} disabled={loading}>
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
                <div className="w-full bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-xs relative">
                  
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
                        <img 
                          src={qrCodeUrl} 
                          alt="Wedding Pass QR Code" 
                          className="w-28 h-28 object-contain"
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

                {/* WALLET BUTTONS CONTAINER */}
                <div className="grid grid-cols-2 gap-3 w-full px-1">
                  {/* Apple Wallet Button */}
                  <Button
                    type="button"
                    onClick={handleAddToAppleWallet}
                    className="bg-black hover:bg-neutral-900 text-white rounded-xl h-11 font-sans text-xs font-medium flex items-center justify-center gap-2 border border-neutral-800 shadow-xs transition-all"
                  >
                    <Wallet className="w-4 h-4 text-white" />
                    <span>Add to Apple Wallet</span>
                  </Button>

                  {/* Google Wallet Button */}
                  <Button
                    type="button"
                    onClick={handleAddToGoogleWallet}
                    variant="outline"
                    className="bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 rounded-xl h-11 font-sans text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <svg className="w-4 h-4 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.36 1-.1 1-.72V8c0-.62-.41-.36-1-.72zM5 5h14v1.2c-.59.36-1 .97-1 1.68V11H5V5zm14 14H5v-6h13v2.12c0 .71.41 1.32 1 1.68V19zm1-6.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
                    </svg>
                    <span>Google Wallet</span>
                  </Button>
                </div>
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