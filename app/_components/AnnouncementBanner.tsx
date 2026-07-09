"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

/**
 * Site-wide announcement banner. Shows the admin's live message from
 * app_settings when it's active; guests can dismiss it (per message, per device).
 */
export function AnnouncementBanner() {
  const { settings } = useAppSettings();
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem("dismissed_announcement"));
  }, []);

  const message = settings.announcement?.trim();
  const active = settings.announcement_active && !!message;
  if (!active || dismissed === message) return null;

  return (
    <div className="relative z-40 flex items-start gap-2.5 bg-brand px-4 py-2.5 text-center text-sm text-white">
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 leading-snug">
        {message}
        {settings.announcement_link && (
          <a
            href={settings.announcement_link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 whitespace-nowrap font-semibold underline underline-offset-2"
          >
            Learn more →
          </a>
        )}
      </p>
      <button
        onClick={() => {
          localStorage.setItem("dismissed_announcement", message ?? "");
          setDismissed(message ?? "");
        }}
        className="shrink-0 rounded p-0.5 text-white/80 transition hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
