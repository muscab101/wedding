"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Video, 
  LogOut,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Guests Control", href: "/admin/guests", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "DevToon Videos", href: "/admin/videos", icon: Video },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-[#8B4F58]/10 min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen">
      <div className="space-y-6">
        {/* Branding Title */}
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="bg-[#FFF0F5] p-2 rounded-xl text-[#8B4F58]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg text-[#8B4F58]">Admin Suite</span>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Full Access Control</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-[#8B4F58] text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action Button */}
      <Button 
        variant="ghost" 
        onClick={handleLogout}
        className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </aside>
  );
}