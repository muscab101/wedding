"use client";

import React from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  Car, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../_components/Navbar";

export default function VenuePage() {
  // Toos u tilmaamaya Diamond Lounge, West Ealing, London
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.433230419363!2d-0.3236353233777478!3d51.50524587181344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760df768f8bfab%3A0x633eeb6d2d4157bc!2s142%20The%20Broadway%2C%20West%20Ealing%2C%20London%20W13%200TL!5e0!3m2!1sen!2suk!4v1719912345678!5m2!1sen!2suk";
  const googleMapsExternalUrl = "https://maps.google.com/?q=Diamond+Lounge,+142+The+Broadway,+West+Ealing,+London,+W13+0TL";

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-white py-12 px-4 max-w-5xl mx-auto space-y-12 selection:bg-[#8B4F58]/10">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#8B4F58]/10 bg-white text-xs font-medium text-[#8B4F58] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" /> Wedding Venue
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#8B4F58] tracking-tight">The Location</h1>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            Find all the details regarding the celebration venue, timing, and directions below.
          </p>
        </div>

        {/* Main Grid: Details & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Venue Info Cards */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Card 1: Main details */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-5 flex-1">
              <h3 className="text-lg font-serif text-[#8B4F58] font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4" /> Diamond Lounge
              </h3>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B4F58]/5 rounded-xl text-[#8B4F58] mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</h4>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">Diamond Lounge</p>
                    <p className="text-xs text-gray-400">142 The Broadway, West Ealing</p>
                    <p className="text-xs text-gray-400">London, W13 0TL, UK</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B4F58]/5 rounded-xl text-[#8B4F58] mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</h4>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">Friday, September 11, 2026</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#8B4F58]/5 rounded-xl text-[#8B4F58] mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</h4>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">6:00 PM - 11:59 PM BST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Parking & Extra Info */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Car className="w-4 h-4 text-gray-400" /> Guest Parking Info
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Free secure underground parking is available for all registered guests at the venue. Please display your Digital Entry Pass upon arrival.
              </p>
              
              <div className="pt-3">
                <Button
                  render={<a href={googleMapsExternalUrl} target="_blank" rel="noopener noreferrer" />}
                  className="w-full bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl h-10 text-xs font-medium gap-1.5 transition-all shadow-xs"
                >
                  Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Google Map Embed */}
          <div className="lg:col-span-7 bg-white border border-gray-100 p-3 rounded-[32px] shadow-xs min-h-[350px] lg:min-h-auto flex">
            <div className="w-full h-full rounded-[24px] overflow-hidden border border-gray-50 relative group bg-gray-50">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[380px] grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-500"
              />
              
              {/* Subtle top branding corner accent over maps */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-gray-100 px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-1.5 text-[10px] font-semibold text-[#8B4F58]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Venue Location Map
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}