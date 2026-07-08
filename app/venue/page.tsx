"use client";

import React from "react";
import { MapPin, Calendar, Clock, Compass, Car, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../_components/Navbar";
import { AddToCalendar } from "../_components/AddToCalendar";
import { useAppSettings } from "@/hooks/useAppSettings";

export default function VenuePage() {
  // Direct link + embed for Diamond Lounge, West Ealing, London
  const googleMapsEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.433230419363!2d-0.3236353233777478!3d51.50524587181344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48760df768f8bfab%3A0x633eeb6d2d4157bc!2s142%20The%20Broadway%2C%20West%20Ealing%2C%20London%20W13%200TL!5e0!3m2!1sen!2suk!4v1719912345678!5m2!1sen!2suk";
  const googleMapsExternalUrl =
    "https://maps.google.com/?q=Diamond+Lounge,+142+The+Broadway,+West+Ealing,+London,+W13+0TL";

  const { settings } = useAppSettings();
  const start = new Date(settings.wedding_date);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const tz = "Europe/London";
  const dateLine = start.toLocaleDateString("en-GB", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-GB", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });

  const details = [
    { icon: MapPin, label: "Address", lines: ["Diamond Lounge", "142 The Broadway, West Ealing", "London, W13 0TL, UK"] },
    { icon: Calendar, label: "Date", lines: [dateLine] },
    { icon: Clock, label: "Time", lines: [`${fmtTime(start)} – ${fmtTime(end)}`] },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen w-full max-w-5xl space-y-12 px-5 py-14 sm:px-8">
        <header className="space-y-3 text-center">
          <span className="eyebrow">Wedding Venue</span>
          <h1 className="font-serif text-3xl tracking-tight text-brand sm:text-4xl">The Location</h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Find all the details regarding the celebration venue, timing, and directions below.
          </p>
        </header>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Info */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex-1 space-y-5 rounded-3xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand">
                <Compass className="h-4 w-4" /> Diamond Lounge
              </h3>
              <div className="space-y-4 pt-1">
                {details.map(({ icon: Icon, label, lines }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-accent p-2 text-brand">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h4>
                      {lines.map((l, idx) => (
                        <p key={l} className={idx === 0 ? "mt-0.5 text-sm font-medium text-foreground" : "text-xs text-muted-foreground"}>
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <Car className="h-4 w-4 text-muted-foreground" /> Guest Parking Info
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Free secure underground parking is available for all registered guests. Please
                display your Digital Entry Pass upon arrival.
              </p>
              <div className="pt-2">
                <Button
                  nativeButton={false}
                  render={<a href={googleMapsExternalUrl} target="_blank" rel="noopener noreferrer" />}
                  className="h-10 w-full gap-1.5 rounded-xl bg-brand text-xs font-medium text-white transition-all hover:bg-brand-hover"
                >
                  Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <AddToCalendar />
          </div>

          {/* Map */}
          <div className="flex min-h-[350px] rounded-[32px] border border-border bg-card p-3 lg:col-span-7">
            <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-border bg-muted">
              <iframe
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[380px] w-full"
              />
              <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-1.5 text-[10px] font-semibold text-brand backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" /> Venue Location Map
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
