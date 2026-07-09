"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface AppSettings {
  wedding_date: string; // ISO timestamp
  announcement: string | null;
  announcement_link: string | null;
  announcement_active: boolean;
}

// Used before the row loads (and if the fetch ever fails), so the UI always
// has a sensible date to show.
const FALLBACK: AppSettings = {
  wedding_date: "2026-09-11T18:00:00+01:00",
  announcement: null,
  announcement_link: null,
  announcement_active: false,
};

/**
 * Live site-wide settings (the wedding date + broadcast announcement), stored
 * in the single-row `app_settings` table. Subscribes to realtime so an admin
 * edit updates every open page instantly.
 */
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("wedding_date, announcement, announcement_link, announcement_active")
        .eq("id", 1)
        .maybeSingle();
      if (!active) return;
      if (data) setSettings(data as AppSettings);
      setLoading(false);
    };
    load();

    // Unique channel name per hook instance — several components use this hook
    // on the same page, and same-named channels collide after subscribe().
    const channel = supabase
      .channel(`app-settings-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        load
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading };
}
