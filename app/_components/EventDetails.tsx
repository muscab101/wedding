"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Calendar, Heart, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Wish } from "@/lib/types";
import Reveal from "./Reveal";

const timeline = [
  {
    time: "4:00 PM",
    title: "Doors Open",
    description:
      "Welcome guests! Early photo sessions, reception meetups, and guest seating begins.",
    icon: Clock,
  },
  {
    time: "5:00 PM",
    title: "The Ceremony & Vows",
    description:
      "The official ceremony — the exchange of vows and the Nikah munaasabad.",
    icon: Heart,
  },
  {
    time: "7:00 PM",
    title: "Dinner & Celebration",
    description:
      "A premium celebratory dinner accompanied by wonderful family moments.",
    icon: Calendar,
  },
];

export default function EventDetails() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown to the ceremony
  useEffect(() => {
    const target = new Date("September 11, 2026 18:00:00").getTime();
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Latest wishes from Supabase, with live updates
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
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-28 px-5 py-20 sm:px-8">
      {/* Countdown */}
      <Reveal>
        <section className="space-y-10 text-center">
          <div className="space-y-3">
            <span className="eyebrow">The moment approaches</span>
            <h2 className="text-3xl tracking-tight text-brand sm:text-4xl">
              Counting Down the Days
            </h2>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-brand/20"
              >
                <div className="font-serif text-4xl text-brand tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Schedule */}
      <Reveal>
        <section className="space-y-12">
          <div className="space-y-3 text-center">
            <span className="eyebrow">The day, hour by hour</span>
            <h2 className="text-3xl tracking-tight text-brand sm:text-4xl">
              Wedding Schedule
            </h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="relative space-y-8 border-l border-border pl-8">
              {timeline.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="relative">
                    <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
                      <Icon className="h-4 w-4 text-brand" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">
                      {item.time}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Wishes preview */}
      <Reveal>
        <section className="space-y-8 rounded-3xl border border-border bg-brand-soft/60 p-8 md:p-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-3 text-center md:text-left">
              <span className="eyebrow">From loved ones</span>
              <h2 className="text-3xl tracking-tight text-brand sm:text-4xl">
                Warm Wishes
              </h2>
            </div>
            <Link
              href="/wishes"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-brand transition hover:bg-accent"
            >
              <MessageSquare className="h-4 w-4" />
              Leave a Message
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : wishes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {wishes.map((wish) => (
                <div
                  key={wish.id}
                  className="space-y-3 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-semibold text-brand">
                      {wish.name ? wish.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{wish.name}</h4>
                      <p className="text-[11px] font-medium text-muted-foreground">{wish.relation}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{wish.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-brand/30" />
              <h4 className="text-sm font-medium text-foreground">No wishes yet</h4>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Be the first to leave a heartfelt message for the couple!
              </p>
            </div>
          )}
        </section>
      </Reveal>
    </div>
  );
}
