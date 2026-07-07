"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Heart, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Wish } from "@/lib/types";
import Reveal from "./Reveal";

export default function EventDetails() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. COUNTDOWN STATE
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("September 11, 2026 18:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference < 0) {
        clearInterval(interval);
        return;
      }
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 4. FETCH LATEST WISHES FROM SUPABASE (with live updates)
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("wishes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) console.error("Error fetching wishes:", error);
      setWishes((data ?? []) as Wish[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("wishes-preview-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wishes" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const timeline = [
    {
      time: "4:00 PM",
      title: "Doors Open",
      description: "Welcome guests! Early photo sessions, reception meetups, and guest seating begins.",
      icon: <Clock className="w-5 h-5 text-[#8B4F58]" />,
    },
    {
      time: "5:00 PM",
      title: "The Ceremony & Vows",
      description: "The official ceremony exchange of beautiful vows and Nikah munaasabad.",
      icon: <Heart className="w-5 h-5 text-[#8B4F58]" />,
    },
    {
      time: "7:00 PM",
      title: "Dinner & Celebration",
      description: "A premium celebratory dinner service accompanied by wonderful family interactions.",
      icon: <Calendar className="w-5 h-5 text-[#8B4F58]" />,
    },
  ];

  return (
    <div className="w-full space-y-24 py-16 px-4 max-w-6xl mx-auto">
      
      {/* 2. COUNTDOWN TIMER SECTION */}
      <Reveal>
      <section className="text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-serif text-[#8B4F58] tracking-tight">
            Counting Down the Days
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Counting every single second until our wonderful celebration together.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white/50 backdrop-blur-sm border border-[#8B4F58]/10 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#8B4F58] tabular-nums">
                {String(item.value).padStart(2, "0")}
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      {/* 3. EVENT TIMELINE SECTION */}
      <Reveal>
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-serif text-[#8B4F58] tracking-tight">
            Wedding Schedule
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Here is an overview of the event timelines and milestones throughout the day.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto pl-6 md:pl-0">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#8B4F58]/10 -translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item, idx) => (
              <div 
                key={idx} 
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-12 ${
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#8B4F58]/20 flex items-center justify-center -translate-x-1/2 z-10 shadow-xs">
                  {item.icon}
                </div>

                <div className="w-full md:w-[45%] bg-white/50 backdrop-blur-sm border border-[#8B4F58]/5 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md ml-6 md:ml-0">
                  <span className="text-xs font-bold text-[#8B4F58] uppercase tracking-wider block mb-1">
                    {item.time}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="hidden md:block w-[45%]" />
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* 4. WISHES / GUESTBOOK PREVIEW SECTION */}
      <Reveal>
      <section className="space-y-8 bg-white/30 backdrop-blur-sm border border-[#8B4F58]/5 rounded-[32px] p-8 md:p-12 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-serif text-[#8B4F58] tracking-tight">
              Warm Wishes
            </h2>
            <p className="text-gray-400 text-sm max-w-md">
              Read the latest beautiful messages left by our friends and loving family members.
            </p>
          </div>
          <Button 
            variant="outline"
            className="border-[#8B4F58]/20 text-[#8B4F58] hover:bg-[#8B4F58]/5 rounded-full px-6 h-11 w-full md:w-auto transition-all duration-300"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Leave a Message
          </Button>
        </div>

        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white/40 animate-pulse rounded-2xl p-6 h-32 border border-gray-100" />
            ))}
          </div>
        ) : wishes.length > 0 ? (
          /* IF DATA EXISTS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishes.map((wish) => (
              <div 
                key={wish.id} 
                className="bg-white/80 rounded-2xl p-6 border border-[#8B4F58]/5 shadow-2xs space-y-3 transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8B4F58]/5 flex items-center justify-center text-[#8B4F58] font-bold">
                    {wish.name ? wish.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{wish.name}</h4>
                    <p className="text-[11px] text-gray-400 font-medium">{wish.relation}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  "{wish.text}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE (HADII UUSAN WAX XOG AH KU JIRAN) */
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#8B4F58]/10 rounded-2xl bg-white/20">
            <Sparkles className="w-8 h-8 text-[#8B4F58]/30 mb-3 animate-pulse" />
            <h4 className="text-sm font-medium text-gray-600">No wishes yet</h4>
            <p className="text-xs text-gray-400 max-w-xs mt-1">
              Be the first one to leave a heartfelt message for the beautiful couple!
            </p>
          </div>
        )}
      </section>
      </Reveal>

    </div>
  );
}