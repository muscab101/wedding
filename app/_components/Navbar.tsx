"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Home", href: "/dashboard" },
  { name: "RSVP & Pass", href: "/rsvp" },
  { name: "Venue", href: "/venue" },
  { name: "Gallery", href: "/gallery" },
  { name: "Wishes", href: "/wishes" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Profile details from the auth provider (Google supplies avatar + name).
  const meta = (user?.user_metadata ?? {}) as {
    avatar_url?: string;
    picture?: string;
    full_name?: string;
    name?: string;
  };
  const avatarUrl = meta.avatar_url || meta.picture || null;
  const displayName = meta.full_name || meta.name || user?.email || "Guest";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Monogram */}
        <Link href="/" className="shrink-0">
          <span className="font-serif text-2xl tracking-tight text-brand">
            A <span className="text-brand/40">&amp;</span> C
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-sm transition-colors ${
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:text-brand"
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute -bottom-[22px] left-0 h-px w-full bg-brand" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-accent text-sm font-semibold uppercase text-brand outline-none transition hover:border-brand/40">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.email?.charAt(0) || "G"
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="mt-2 w-56 rounded-2xl border-border p-1.5 shadow-lg"
                  align="end"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="truncate px-2.5 pt-2 font-serif text-sm text-brand">
                      {displayName}
                    </DropdownMenuLabel>
                    <div className="truncate px-2.5 pb-2 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-foreground focus:bg-accent focus:text-brand"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:text-brand"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover"
                >
                  Register
                </button>
              </div>
            ))}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/70 bg-background px-5 py-3 md:hidden">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  pathname === item.href
                    ? "bg-accent text-brand"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2 border-t border-border/70 pt-3">
                <button
                  onClick={() => router.push("/login")}
                  className="flex-1 rounded-full border border-border px-4 py-2 text-sm text-brand"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="flex-1 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
