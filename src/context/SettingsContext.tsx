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
    "Printiful help announce you and your brand even when you don't say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.",
  primary_color: "#53009B",
  secondary_color: "#0D0015",
  accent_color: "#FFFF00",
  contact_email: "shopprintiful@gmail.com",
  contact_phone: "+234 000 000 0000",
  whatsapp_number: "",
  footer_text:
    "© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed.",
  paystack_public_key: "",
  paystack_secret_key: "",
  package_sb_enabled: "true",
  package_sb_title: "Small Business Package",
  package_sb_price: "55000",
  package_sb_tagline:
    "Poly mailers, thank you cards, and two customized tees. One package, one checkout.",
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

  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
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
