"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, ScanLine } from "lucide-react";

export function ScannerNavbar({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-accent p-2 text-brand">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-semibold text-brand">Wedding Portal</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-brand">
              Scanner
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-foreground transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
