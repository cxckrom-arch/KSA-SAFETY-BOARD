"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy, localeMeta, type Copy, type Locale } from "@/lib/i18n";

type LocaleContextValue = { locale: Locale; copy: Copy; toggleLocale: () => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("ksa-locale");
    const next: Locale = saved === "en" ? "en" : "ar";
    setLocale(next);
    document.documentElement.lang = next;
    document.documentElement.dir = localeMeta[next].dir;
  }, []);

  const value = useMemo(
    () => ({
      locale,
      copy: copy[locale],
      toggleLocale: () => {
        setLocale((current) => {
          const next: Locale = current === "ar" ? "en" : "ar";
          window.localStorage.setItem("ksa-locale", next);
          document.documentElement.lang = next;
          document.documentElement.dir = localeMeta[next].dir;
          return next;
        });
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
