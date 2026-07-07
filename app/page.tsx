"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2 + i * 0.18, ease: "easeOut" as const },
  }),
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      {/* Soft rose ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--brand-tint),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-brand-soft to-transparent" />

      <motion.p
        custom={0}
        variants={fade}
        initial="hidden"
        animate="show"
        className="eyebrow mb-6"
      >
        Together with their families
      </motion.p>

      <motion.h1
        custom={1}
        variants={fade}
        initial="hidden"
        animate="show"
        className="font-serif text-5xl leading-[1.05] tracking-tight text-brand sm:text-7xl"
      >
        Abdirahim
        <span className="mx-3 font-light text-brand/40">&amp;</span>
        Creezel
      </motion.h1>

      <motion.div
        custom={2}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-col items-center gap-4"
      >
        <div className="rule text-xs uppercase tracking-[0.35em] text-muted-foreground">
          11 · 09 · 2026
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          We joyfully invite you to celebrate our wedding at the Diamond Lounge,
          London. Sign in to RSVP and receive your digital entry pass.
        </p>
      </motion.div>

      <motion.div
        custom={3}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-10 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/rsvp"
          className="rounded-full bg-brand px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover hover:shadow-md"
        >
          RSVP &amp; Get Your Pass
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-border px-8 py-3 text-sm font-medium text-brand transition hover:bg-accent"
        >
          Sign In
        </Link>
      </motion.div>
    </main>
  );
}
