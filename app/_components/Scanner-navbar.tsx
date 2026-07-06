"use client";

import React from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, ScanLine } from "lucide-react"; // Hubi inaad haysato lucide-react (wuxuu la yimaadaa Shadcn)

export function ScannerNavbar({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-[#8B4F58]/10 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <div className="bg-[#FFF0F5] p-2 rounded-xl text-[#8B4F58]">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-[#8B4F58]">Wedding Portal</span>
            <span className="ml-2 text-xs bg-[#8B4F58]/10 text-[#8B4F58] px-2 py-0.5 rounded-full font-medium">
              Scanner Mode
            </span>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400 font-medium">Logged in as</p>
            <p className="text-sm font-medium text-gray-700">{userEmail}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl gap-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xs:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}