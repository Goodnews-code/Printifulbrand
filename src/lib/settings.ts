import type { SiteSettings } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

export async function getSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw new Error(error.message);

  const settings: SiteSettings = { ...DEFAULTS };
  for (const row of data ?? []) {
    settings[row.key as string] = row.value as string;
  }

  if (process.env.PAYSTACK_PUBLIC_KEY) {
    settings.paystack_public_key = process.env.PAYSTACK_PUBLIC_KEY;
  }
  if (process.env.PAYSTACK_SECRET_KEY) {
    settings.paystack_secret_key = process.env.PAYSTACK_SECRET_KEY;
  }

  return settings;
}

export async function updateSettings(payload: Record<string, string>) {
  const supabase = getSupabaseAdmin();
  const rows = Object.entries(payload)
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => ({ key, value }));

  if (rows.length > 0) {
    const { error } = await supabase.from("settings").upsert(rows);
    if (error) throw new Error(error.message);
  }

  return getSettings();
}
