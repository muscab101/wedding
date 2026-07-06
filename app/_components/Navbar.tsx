"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// Lucide Icons
import { Heart, Home, QrCode, MapPin, MessageSquareHeart, LogOut, LayoutDashboard } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/singin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Liiska cusub ee loo habeeyay baahida martida
  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "RSVP & Pass", href: "/rsvp", icon: QrCode },
    { name: "Venue / Location", href: "/venue", icon: MapPin },
    { name: "Wishes & Videos", href: "/wishes", icon: MessageSquareHeart },
  ];

  return (
    <div className="w-full bg-transparent px-3 py-4 sticky top-0 z-50 flex justify-center">
      <nav className="w-full max-w-6xl bg-white/90 backdrop-blur-md border border-[#8B4F58]/10 shadow-[0_4px_20px_-4px_rgba(139,79,88,0.1)] rounded-full px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-300">
        
        {/* Bidix: Logo (M-R & Heart) */}
        <Link href="/" className="flex items-center gap-1.5 group pl-1 shrink-0">
          <Heart className="w-6 h-6 fill-[#8B4F58] text-[#8B4F58] transition-transform group-hover:scale-110 duration-300" />
          {/* Qoraalka M-R wuxuu dhumayaa marka mobile aad u yar la joogo si menu-ka dhexda u rarto */}
          <span className="text-xl font-serif font-semibold text-[#8B4F58] tracking-wider hidden sm:inline">
            C &amp; A
          </span>
        </Link>

        {/* Dhexda: Menu Link-yada (Isla falgalaya shaashadaha) */}
        {/* `gap-6 sm:gap-8` wuxuu isku soo dhoweynayaa icon-nada marka mobile la joogo */}
        <div className="flex items-center gap-6 sm:gap-8 justify-center mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-all duration-200 pb-1.5 ${
                  isActive 
                    ? "text-[#8B4F58]" 
                    : "text-gray-500 hover:text-[#8B4F58]"
                }`}
              >
                {/* Icon-ka had iyo jeer wuu muuqdaa */}
                <Icon className={`w-5 h-5 sm:w-4 sm:h-4 ${isActive ? "text-[#8B4F58]" : "text-gray-400 hover:text-[#8B4F58]"}`} />
                
                {/* Qoraalka (`item.name`) wuxuu dhumayaa marka md (desktop) laga hoos maro sida sawirka dambe */}
                <span className="hidden md:inline">{item.name}</span>
                
                {/* Dot-ka casriyaysan ee ka hooseeya icon-ka furan */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8B4F58] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Midig: Profile Dropdown ama Login buttons */}
        <div className="flex items-center gap-2 pr-1 shrink-0">
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-[#FFF0F5] border border-[#8B4F58]/20 flex items-center justify-center text-[#8B4F58] font-bold text-sm uppercase hover:bg-[#FFE4E1] cursor-pointer outline-none transition-all shadow-sm">
                    {user.email?.charAt(0) || "G"}
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="w-54 bg-white border-[#8B4F58]/10 rounded-2xl shadow-xl mt-3 p-1.5" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-serif text-[#8B4F58] text-sm px-2.5 pt-2">
                        Welcome back
                      </DropdownMenuLabel>
                      <div className="px-2.5 pb-2 text-xs text-gray-400 truncate">
                        {user.email}
                      </div>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                    
                    <DropdownMenuItem 
                      onClick={() => router.push("/dashboard")}
                      className="cursor-pointer focus:bg-[#FFF0F5] focus:text-[#8B4F58] rounded-xl flex items-center gap-2 py-2 px-2.5 text-gray-600 text-sm"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-xl flex items-center gap-2 py-2 px-2.5 text-sm"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push("/singin")}
                    className="text-gray-500 hover:text-[#8B4F58] hover:bg-[#FFF0F5] rounded-full font-medium text-xs h-8 px-2.5 sm:px-4"
                  >
                    Sign In
                  </Button>
                  {/* Register-ka wuxuu ku dhumayaa mobile-ka yar si ay booska u badbaadiyaan */}
                  <Button 
                    onClick={() => router.push("/register")}
                    className="bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-full font-medium text-xs h-8 px-3 shadow-sm hidden sm:inline-flex"
                  >
                    Register
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </nav>
    </div>
  );
}