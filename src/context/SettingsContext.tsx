"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SiteSettings } from "@/types";

const DEFAULTS: SiteSettings = {
  site_title: "Printiful | Premium Custom wear & High-Fidelity Printing",
  site_description:
    "Printiful crafts premium customized merch on heavyweight luxury blanks.",
  hero_headline: "Be Bold! Be Seen!! Be Known!!!",
  hero_subtext:
    "Heavyweight luxury blanks. High-fidelity Direct-to-Merch prints, industrial embroidery, and curated wear designed to endure.",
  primary_color: "#53009B",
  secondary_color: "#0D0015",
  accent_color: "#FFFF00",
  contact_email: "shopprintiful@gmail.com",
  contact_phone: "+234 000 000 0000",
  footer_text:
    "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed.",
  paystack_public_key: "",
  paystack_secret_key: "",
};

interface SettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = (await res.json()) as SiteSettings;
        setSettings({ ...DEFAULTS, ...data });
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
