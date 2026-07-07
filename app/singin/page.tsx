"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Diiwaangelinta cusub (Email, Password & Confirm)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Xaqiiji in labada password ay is leeyihiin
    if (password !== confirmPassword) {
      setError("Password-ka iyo Xaqiijintiisa iskuma mid ah.");
      return;
    }

    // Xaqiiji dhumucda password-ka (Firebase wuxuu rabaa ugu yaraan 6 xaraf)
    if (password.length < 6) {
      setError("Password-ku waa inuu ka koobnaadaa ugu yaraan 6 xaraf.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      console.error(signUpError);
      if (signUpError.message.toLowerCase().includes("already")) {
        setError("Email-kan hadda ka hor ayaa la isticmaalay.");
      } else if (signUpError.message.toLowerCase().includes("valid")) {
        setError("Qaabka Email-ka aad u qortay ma saxan.");
      } else {
        setError("Waxaa dhacay khaldan inta ay diiwaangelintu socotay.");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  };

  // 2. Ku gelidda Google Account (redirects to Google, then back)
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (oauthError) {
      console.error(oauthError);
      setError("Google Login waa uu fashilmay.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFF0F5]/50 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FFF0F5] via-white to-[#FFE4E1]/30 -z-10" />

      <Card className="w-full max-w-md bg-white border-[#8B4F58]/10 shadow-xl rounded-2xl z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif text-[#8B4F58]">Create Invitation</CardTitle>
          <CardDescription className="text-gray-500">
            Register your email to generate your wedding QR pass
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 transition-all">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="marian@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-200 focus-visible:ring-[#8B4F58] rounded-xl h-11"
                required
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-200 focus-visible:ring-[#8B4F58] rounded-xl h-11"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-200 focus-visible:ring-[#8B4F58] rounded-xl h-11"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8B4F58] hover:bg-[#723E46] text-white font-medium h-11 rounded-xl transition-all shadow-sm mt-2"
            >
              {loading ? "Creating Account..." : "Sign Up / Register"}
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 font-medium h-11 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.61 14.99 1 12 1 7.37 1 3.41 3.66 1.44 7.54l3.8 2.95C6.18 7.33 8.87 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.57z"/>
              <path fill="#FBBC05" d="M5.24 14.51c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.44 6.94C.52 8.78 0 10.83 0 13s.52 4.22 1.44 6.06l3.8-2.95z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.67-2.31 1.07-4.3 1.07-3.13 0-5.82-2.29-6.76-5.45L1.44 16.82C3.41 20.34 7.37 23 12 23z"/>
            </svg>
            Google Account
          </Button>
        </CardContent>

        <CardFooter className="justify-center text-sm text-gray-500 pb-6">
          Already have an invite? <span className="text-[#8B4F58] font-medium ml-1 cursor-pointer hover:underline" onClick={() => router.push("/login")}>Log In</span>
        </CardFooter>
      </Card>
    </div>
  );
}