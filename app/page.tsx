"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAppSettings } from "@/hooks/useAppSettings";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2 + i * 0.18, ease: "easeOut" as const },
  }),
};

export default function Home() {
  const { t } = useI18n();
  const { settings } = useAppSettings();
  const shortDate = new Date(settings.wedding_date)
    .toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, " · ");
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-5 py-16 text-center sm:px-6">
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
        {t("landing.eyebrow")}
      </motion.p>

      <motion.h1
        custom={1}
        variants={fade}
        initial="hidden"
        animate="show"
        className="w-full font-serif text-[2.75rem] leading-[1.08] tracking-tight text-brand sm:text-6xl md:text-7xl"
      >
        Abdirahim{" "}
        <span className="mx-1 font-light text-brand/40 sm:mx-3">&amp;</span>{" "}
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
          {shortDate}
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("landing.subtitle")}
        </p>
      </motion.div>

      <motion.div
        custom={3}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
      >
        <Link
          href="/rsvp"
          className="w-full rounded-full bg-brand px-8 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover hover:shadow-md sm:w-auto"
        >
          {t("landing.rsvpCta")}
        </Link>
        <Link
          href="/login"
          className="w-full rounded-full border border-border px-8 py-3 text-center text-sm font-medium text-brand transition hover:bg-accent sm:w-auto"
        >
          {t("landing.signIn")}
        </Link>
      </motion.div>
    </main>
  );
}
