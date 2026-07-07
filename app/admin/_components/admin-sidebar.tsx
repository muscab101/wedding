"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Video,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Guests", href: "/admin/guests", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Videos", href: "/admin/videos", icon: Video },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between border-r border-border bg-card p-4">
      <div className="space-y-6">
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

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
      </div>

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </aside>
  );
}
