"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Bell } from "lucide-react";
import { GoogleIcon } from "./GoogleIcon";

// The ceremony: 11 Sept 2026, 6:00 PM London time (BST = UTC+1) → 17:00 UTC,
// ending 11:59 PM BST → 22:59 UTC. Using UTC ("Z") keeps it unambiguous.
const EVENT = {
  title: "Abdirahim & Creezel's Wedding",
  details:
    "We can't wait to celebrate with you! Please bring your digital entry pass to the gate.",
  location: "Diamond Lounge, 142 The Broadway, West Ealing, London W13 0TL",
  startUtc: "20260911T170000Z",
  endUtc: "20260911T225900Z",
};

function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${EVENT.startUtc}/${EVENT.endUtc}`,
    details: EVENT.details,
    location: EVENT.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcs() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:abdirahim-creezel-wedding@wedding",
    `DTSTAMP:${EVENT.startUtc}`,
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${EVENT.title}`,
    `DESCRIPTION:${EVENT.details}`,
    `LOCATION:${EVENT.location}`,
    // Remind the guest 1 day before, and again 2 hours before.
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Abdirahim & Creezel's Wedding is tomorrow!",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Abdirahim & Creezel's Wedding starts soon!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "abdirahim-and-creezel-wedding.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function AddToCalendar({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-brand transition hover:bg-accent"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to Calendar
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5 text-brand" />
            Get a reminder for the big day
          </div>
          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm text-foreground transition hover:bg-accent"
          >
            <GoogleIcon className="h-4 w-4" />
            Google Calendar
          </a>
          <button
            type="button"
            onClick={() => {
              downloadIcs();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm text-foreground transition hover:bg-accent"
          >
            <CalendarPlus className="h-4 w-4 text-brand" />
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
