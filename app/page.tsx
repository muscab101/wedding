"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  // 1. Animation-ka Qoraalka (Xaraf-xaraf ama erey-erey)
  const textWords = "Welcome to Our Wedding Celebration".split(" ");

  return (
    <main className="relative w-full h-screen overflow-hidden bg-white flex items-center justify-center">
      
      {/* BACKGROUND IMAGE WITH ZOOM-OUT ANIMATION */}
      <motion.div
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }} // Opcacity 0.4 si qoraalku u muuqdo, waad kordhin kartaa hadaad rabto
        transition={{ duration: 3.5, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/wedding-hero.jpg')" }}
      />

      {/* ROSE & WHITE GRADIENT OVERLAY (Si uu midabka Rose u soo baxo) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFF0F5]/30 to-white/90 pointer-events-none" />

      {/* CONTENT (QORAALADA IYO BUTTONS-KA) */}
      <div className="relative z-10 text-center px-4 max-w-3xl flex flex-col items-center">
        
        {/* ANIMATED TEXT (Erey-Erey u soo baxaya) */}
        <h1 className="text-5xl md:text-7xl font-serif text-[#8B4F58] mb-6 tracking-wide drop-shadow-sm">
          {textWords.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 1.5 + index * 0.2, // Wuxuu bilaabanayaa marka sawirka zoom-out-kiisa xoogaa socdo
                ease: "easeOut"
              }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* QORAAL KOOBAN OO SII DHASHA */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="text-lg md:text-xl text-gray-600 font-light tracking-widest uppercase mb-8"
        >
          Save The Date • October 12, 2026
        </motion.p>

        {/* BUTTONS (LOGIN / RSVP) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/singin" className="bg-[#8B4F58] hover:bg-[#723E46] text-white font-medium px-8 py-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105">
            RSVP Now / Login
          </Link>
          <Link href="/our-story" className="bg-white/80 hover:bg-white text-[#8B4F58] border border-[#8B4F58]/30 font-medium px-8 py-3 rounded-full shadow-sm transition-all duration-300 transform hover:scale-105">
            Our Story
          </Link>
        </motion.div>
          

      </div>
    </main>
  );
}