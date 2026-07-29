import { getDb } from "@/lib/db";
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

export function getSettings(): SiteSettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as Array<{
    key: string;
    value: string;
  }>;

  const settings: SiteSettings = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  // Prefer env secrets over DB (never expose secret key to public client later)
  if (process.env.PAYSTACK_PUBLIC_KEY) {
    settings.paystack_public_key = process.env.PAYSTACK_PUBLIC_KEY;
  }
  if (process.env.PAYSTACK_SECRET_KEY) {
    settings.paystack_secret_key = process.env.PAYSTACK_SECRET_KEY;
  }

  return settings;
}

export function updateSettings(payload: Record<string, string>) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === "string") stmt.run(key, value);
    }
  });
  tx();
  return getSettings();
}
