"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hero from "../../public/hero.png"
import Image from "next/image";

export default function HeroSection() {
  const [animate, setAnimate] = useState(false);

  // Waxay kicinaysaa animation-ka isla mark marka boggu soo gado (Hydration ka dib)
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-76px)] w-full flex items-center justify-center overflow-hidden px-4 py-12 md:py-24">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* DHINACA BIDIX: QORAALKA (TEXT CONTENT) */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left space-y-6 md:space-y-8">
          
          {/* Guurka Sanadka / Tagline */}
          <div 
            className={`inline-flex items-center justify-center lg:justify-start gap-2 border border-[#8B4F58]/10 px-4 py-1.5 rounded-full shadow-sm w-fit mx-auto lg:mx-0 transition-all duration-1000 transform ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 bg-[#8B4F58] rounded-full animate-ping" />
            <span className="text-xs font-medium uppercase tracking-widest text-[#8B4F58]">
              The Celebration of Love
            </span>
          </div>

          {/* Magacyada Lammaanaha */}
          <h1 
            className={`text-5xl md:text-7xl font-serif text-[#8B4F58] tracking-tight leading-tight transition-all duration-1000 delay-200 transform ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Abdirahim <br className="hidden md:inline" />
            <span className="text-3xl md:text-5xl font-sans font-light text-gray-400 mx-2 md:mx-0 block md:inline md:my-0 my-2">
              &amp;
            </span>{" "}
            Creezel Tie
          </h1>

          {/* Sharaxaad Kooban */}
          <p 
            className={`text-gray-500 max-w-xl text-base md:text-lg leading-relaxed mx-auto lg:mx-0 transition-all duration-1000 delay-400 transform ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            We are thrilled to invite you to share in our joy as we exchange vows and 
            begin our beautiful journey together. Your presence is our greatest gift.
          </p>

          {/* Xogta Muhiimka ah (Date & Venue Mini Cards) */}
          <div 
            className={`grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 transition-all duration-1000 delay-600 transform ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#8B4F58]/10 shadow-sm bg-white/10 backdrop-blur-xs">
              <Calendar className="w-5 h-5 text-[#8B4F58] shrink-0" />
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Date</p>
                <p className="text-sm font-semibold text-gray-700">September 11, 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#8B4F58]/10 shadow-sm bg-white/10 backdrop-blur-xs">
              <MapPin className="w-5 h-5 text-[#8B4F58] shrink-0" />
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Location</p>
                <p className="text-sm font-semibold text-gray-700 truncate">London, UK</p>
              </div>
            </div>
          </div>

          {/* Badamada Falgalka (CTAs) */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 transition-all duration-1000 delay-800 transform ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Button 
              className="w-full sm:w-auto bg-[#8B4F58] hover:bg-[#723E46] text-white font-medium h-12 px-8 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Link href="/rsvp">RSVP &amp; Get Entry Pass</Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-[#8B4F58]/20 bg-transparent text-gray-700 font-medium h-12 px-8 rounded-full transition-all duration-300 hover:bg-[#8B4F58]/5"
            >
              <Link href="/venue">View Ceremony Details</Link>
            </Button>
          </div>

        </div>

        {/* DHINACA MIDIG: SAWIRKA OO LEH FRAME QURUX BADAN (IMAGE FRAME) */}
        <div 
          className={`lg:col-span-5 flex justify-center items-center transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) delay-300 transform ${
            animate ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-y-12 lg:translate-y-0 lg:translate-x-12"
          }`}
        >
          <div className="relative w-full max-w-[360px] aspect-[3/4] sm:max-w-[400px]">
            {/* Elegant Border Frame Decoration Behind the Image */}
            <div className="absolute inset-0 border border-[#8B4F58]/20 rounded-[40px] transform rotate-3 scale-102 transition-transform duration-500 hover:rotate-1" />
            
            {/* The Main Image Container */}
            <div className="absolute inset-0 p-3 rounded-[40px] shadow-2xl border border-[#8B4F58]/10 overflow-hidden group bg-transparent">
              <div className="w-full h-full rounded-[32px] overflow-hidden relative">
                <Image 
                  src={Hero} 
                  alt="Abdirahim and Xalimo Wedding Portrait" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                
                {/* Overlay soft gradient inside image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#8B4F58]/20 via-transparent to-transparent opacity-60" />
              </div>
            </div>

            {/* Floating Tag over Image */}
            <div className="absolute -bottom-4 -left-4 border border-[#8B4F58]/10 shadow-lg px-5 py-3 rounded-2xl hidden sm:flex items-center gap-3 animate-bounce [animation-duration:3s] bg-white/80 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif text-[#8B4F58] bg-[#8B4F58]/5">
                💍
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase text-gray-400 font-medium font-sans">Save the date</p>
                <p className="text-xs font-bold text-gray-700 font-sans">11 . 09 . 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator animation at the very bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 hidden md:flex flex-col items-center gap-1 opacity-60 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest font-medium font-sans">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}