"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "so" | "ar" | "hi";

export const LANGS: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "so", label: "Soomaali", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "hi", label: "हिन्दी", dir: "ltr" },
];

type Dict = Record<string, string>;

// English is the source of truth. Other languages fall back to English for any
// key that hasn't been translated yet — fill these dictionaries in as the
// wording is provided (so/ar/hi).
const en: Dict = {
  "nav.home": "Home",
  "nav.rsvp": "RSVP & Pass",
  "nav.venue": "Venue",
  "nav.wishes": "Wishes",
  "nav.signIn": "Sign In",
  "nav.register": "Register",
  "nav.dashboard": "Dashboard",
  "nav.logout": "Log Out",

  "landing.eyebrow": "Together with their families",
  "landing.subtitle":
    "We joyfully invite you to celebrate our wedding at the Diamond Lounge, London. Sign in to RSVP and receive your digital entry pass.",
  "landing.rsvpCta": "RSVP & Get Your Pass",
  "landing.signIn": "Sign In",
};

const so: Dict = {};
const ar: Dict = {};
const hi: Dict = {};

const translations: Record<Lang, Dict> = { en, so, ar, hi };

interface I18nValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "en",
  dir: "ltr",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  const dir = LANGS.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string) => translations[lang]?.[key] ?? en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
