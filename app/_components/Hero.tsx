"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import HeroImg from "../../public/hero.png";

export default function HeroSection() {
  const [animate, setAnimate] = useState(false);

  // Triggers the entrance animation right after the page mounts (post-hydration)
  useEffect(() => {
    setAnimate(true);
  }, []);

  const reveal = (delay: string) =>
    `transition-all duration-1000 ${delay} ${
      animate ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    }`;

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] w-full items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_50%_at_50%_0%,var(--brand-tint),transparent_70%)]" />

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Text */}
        <div className="flex flex-col items-center space-y-7 text-center lg:col-span-7 lg:items-start lg:text-left">
          <span className={`eyebrow ${reveal("delay-0")}`}>The celebration of love</span>

          <h1
            className={`font-serif text-5xl leading-[1.05] tracking-tight text-brand sm:text-6xl lg:text-7xl ${reveal(
              "delay-100"
            )}`}
          >
            Abdirahim{" "}
            <span className="mx-1 font-light text-brand/40 sm:mx-2">&amp;</span>{" "}
            Creezel
          </h1>

          <p className={`max-w-xl text-base leading-relaxed text-muted-foreground ${reveal("delay-200")}`}>
            We are thrilled to invite you to share in our joy as we exchange vows
            and begin our beautiful journey together. Your presence is our
            greatest gift.
          </p>

          <div className={`grid w-full max-w-md grid-cols-2 gap-4 ${reveal("delay-300")}`}>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Calendar className="h-5 w-5 shrink-0 text-brand" />
              <div className="text-left">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="text-sm font-semibold text-foreground">September 11, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <MapPin className="h-5 w-5 shrink-0 text-brand" />
              <div className="text-left">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Location</p>
                <p className="truncate text-sm font-semibold text-foreground">London, UK</p>
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-3 pt-2 sm:flex-row ${reveal("delay-500")}`}>
            <Link
              href="/rsvp"
              className="rounded-full bg-brand px-8 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover"
            >
              RSVP &amp; Get Entry Pass
            </Link>
            <Link
              href="/venue"
              className="rounded-full border border-border px-8 py-3 text-center text-sm font-medium text-brand transition hover:bg-accent"
            >
              View Venue Details
            </Link>
          </div>
        </div>

        {/* Image */}
        <div
          className={`flex justify-center lg:col-span-5 ${
            animate ? "translate-x-0 scale-100 opacity-100" : "translate-x-6 scale-95 opacity-0"
          } transition-all duration-1000 delay-300`}
        >
          <div className="relative aspect-[3/4] w-full max-w-[380px]">
            <div className="absolute inset-0 -rotate-2 rounded-[36px] border border-brand/20" />
            <div className="absolute inset-0 overflow-hidden rounded-[36px] border border-border bg-card p-2.5 shadow-xl">
              <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-muted">
                <Image
                  src={HeroImg}
                  alt="Abdirahim and Creezel wedding portrait"
                  className="h-full w-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-card/90 px-5 py-3 shadow-lg backdrop-blur-md sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm">💍</div>
              <div className="text-left">
                <p className="text-[10px] font-medium uppercase text-muted-foreground">Save the date</p>
                <p className="text-xs font-bold text-foreground">11 · 09 · 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 animate-bounce flex-col items-center gap-1 text-muted-foreground md:flex">
        <span className="text-[10px] font-medium uppercase tracking-widest">Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
