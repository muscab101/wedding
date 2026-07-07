"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../_components/Navbar";

/**
 * Placeholder photos — swap `src` for the couple's real engagement/wedding
 * photos (or wire to Supabase Storage) whenever they're ready.
 */
const PHOTOS = [
  { src: "https://picsum.photos/seed/wedding-a/700/900", caption: "The Proposal" },
  { src: "https://picsum.photos/seed/wedding-b/700/560", caption: "Golden Hour" },
  { src: "https://picsum.photos/seed/wedding-c/700/820", caption: "First Dance" },
  { src: "https://picsum.photos/seed/wedding-d/700/620", caption: "Family & Friends" },
  { src: "https://picsum.photos/seed/wedding-e/700/900", caption: "The Venue" },
  { src: "https://picsum.photos/seed/wedding-f/700/560", caption: "Sweet Moments" },
  { src: "https://picsum.photos/seed/wedding-g/700/760", caption: "Getting Ready" },
  { src: "https://picsum.photos/seed/wedding-h/700/640", caption: "Celebration" },
  { src: "https://picsum.photos/seed/wedding-i/700/880", caption: "Together" },
];

export default function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % PHOTOS.length)),
    []
  );
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    []
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, next, prev]);

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen w-full max-w-6xl space-y-12 px-5 py-14 sm:px-8">
        <header className="space-y-3 text-center">
          <span className="eyebrow">Our moments</span>
          <h1 className="font-serif text-4xl tracking-tight text-brand sm:text-5xl">
            Captured Memories
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            A glimpse into our journey together. Tap any photo to view it up close.
          </p>
        </header>

        <div className="columns-2 gap-4 [column-fill:_balance] md:columns-3">
          {PHOTOS.map((photo, i) => (
            <motion.button
              key={photo.src}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.caption}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="font-serif text-sm tracking-wide text-white">
                  {photo.caption}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute right-5 top-5 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:left-8"
              aria-label="Previous"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <motion.div
              key={active}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl space-y-3 text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTOS[active].src}
                alt={PHOTOS[active].caption}
                className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
              />
              <p className="font-serif text-lg tracking-wide text-white/90">
                {PHOTOS[active].caption}
              </p>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:right-8"
              aria-label="Next"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
