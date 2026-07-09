"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  MessageSquare,
  Video,
  Megaphone,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Guests", href: "/admin/guests", icon: Users },
  { name: "Verify Guests", href: "/admin/verify", icon: BadgeCheck },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Videos", href: "/admin/videos", icon: Video },
  { name: "Communications", href: "/admin/communications", icon: Megaphone },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

/**
 * Responsive admin chrome: a static sidebar on desktop, and a hamburger +
 * slide-in drawer on mobile so the panel is usable on small screens.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const branding = () => (
    <div className="flex items-center gap-2 px-2 py-3">
      <div className="rounded-xl bg-accent p-2 text-brand">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <span className="font-serif text-lg font-semibold text-brand">Admin Suite</span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Full Access
        </p>
      </div>
    </div>
  );

  const nav = (onNavigate?: () => void) => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-brand text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const logoutBtn = () => (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-card p-4 md:flex">
        <div className="space-y-6">
          {branding()}
          {nav()}
        </div>
        {logoutBtn()}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-border bg-card p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                {branding()}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav(() => setOpen(false))}
            </div>
            {logoutBtn()}
          </aside>
        </div>
      )}

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-brand"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif text-lg font-semibold text-brand">Admin Suite</span>
        </header>
        {children}
      </div>
    </div>
  );
}
