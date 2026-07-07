"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
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

  // Keyboard navigation for the lightbox.
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
      <div className="w-full min-h-screen py-12 px-4 max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8B4F58]/10 bg-white/50 text-xs font-medium uppercase tracking-widest text-[#8B4F58]">
            <Camera className="w-3.5 h-3.5" /> Our Moments
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#8B4F58] tracking-tight">
            Captured Memories
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            A glimpse into our journey together. Tap any photo to view it up close.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 gap-4 [column-fill:_balance]">
          {PHOTOS.map((photo, i) => (
            <motion.button
              key={photo.src}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-[#8B4F58]/5 shadow-sm relative cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.caption}
                loading="lazy"
                className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-medium font-serif tracking-wide">
                  {photo.caption}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 md:left-8 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.div
              key={active}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full text-center space-y-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTOS[active].src}
                alt={PHOTOS[active].caption}
                className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <p className="text-white/90 font-serif text-lg tracking-wide">
                {PHOTOS[active].caption}
              </p>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 md:right-8 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
