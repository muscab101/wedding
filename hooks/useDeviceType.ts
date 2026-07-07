"use client";

import { useEffect, useState } from "react";

export type DeviceType = "android" | "ios" | "other" | "unknown";

/**
 * Detects the user's device from the user-agent, client-side only.
 *
 * Returns "unknown" on the first (server + pre-hydration) render so nothing
 * device-specific is rendered until we're safely on the client — this avoids
 * hydration mismatches. Read the real value after mount.
 */
export function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || "";

    const isAndroid = /android/i.test(ua);

    // iPhone/iPod/iPad — plus iPadOS 13+, which reports as "Macintosh" but has
    // a touch screen, so we disambiguate with maxTouchPoints.
    const isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);

    setDevice(isAndroid ? "android" : isIOS ? "ios" : "other");
  }, []);

  return device;
}
