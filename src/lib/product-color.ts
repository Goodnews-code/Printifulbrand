/** Encode display name + hex into product_images.color_code (no DB migration). */
export function encodeProductColor(name: string, hex: string): string {
  const cleanName = name.trim() || "Default";
  const cleanHex = normalizeHex(hex);
  return `${cleanName}|${cleanHex}`;
}

export function normalizeHex(raw: string): string {
  const value = raw.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return value;
  if (/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) return `#${value}`;
  return "#888888";
}

/** Common color names → hex (for admin typing + swatch sync). */
export const NAMED_COLOR_HEX: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#E11D48",
  crimson: "#DC143C",
  maroon: "#800000",
  pink: "#EC4899",
  hotpink: "#FF69B4",
  rose: "#F43F5E",
  orange: "#F97316",
  coral: "#FF7F50",
  amber: "#F59E0B",
  yellow: "#FFFF00",
  gold: "#FFD700",
  lime: "#84CC16",
  green: "#22C55E",
  emerald: "#10B981",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  sky: "#0EA5E9",
  blue: "#3B82F6",
  navy: "#1E3A8A",
  indigo: "#6366F1",
  purple: "#53009B",
  violet: "#8B5CF6",
  lavender: "#C4B5FD",
  magenta: "#D946EF",
  brown: "#92400E",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  ivory: "#FFFFF0",
  gray: "#6B7280",
  grey: "#6B7280",
  silver: "#C0C0C0",
  charcoal: "#36454F",
  olive: "#808000",
  khaki: "#C3B091",
  turquoise: "#40E0D0",
  burgundy: "#800020",
  wine: "#722F37",
  mustard: "#FFDB58",
  peach: "#FFCBA4",
  mint: "#98FF98",
};

export function hexFromColorName(name: string): string | null {
  const key = name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!key) return null;
  if (NAMED_COLOR_HEX[key]) return NAMED_COLOR_HEX[key];
  // allow "light blue", "dark green"
  const compact = key;
  if (NAMED_COLOR_HEX[compact]) return NAMED_COLOR_HEX[compact];
  return null;
}

export function parseProductColor(raw?: string | null): {
  name: string;
  hex: string;
} {
  const value = (raw || "").trim();
  if (!value) return { name: "Default", hex: "#888888" };

  const pipe = value.indexOf("|");
  if (pipe > 0) {
    const name = value.slice(0, pipe).trim() || "Default";
    const storedHex = value.slice(pipe + 1).trim();
    const fromName = hexFromColorName(name);
    const hex = normalizeHex(storedHex || fromName || "#888888");
    return { name, hex: fromName && storedHex === "#53009B" ? fromName : hex };
  }

  if (value.startsWith("#")) {
    return { name: value, hex: normalizeHex(value) };
  }

  const fromName = hexFromColorName(value);
  return { name: value, hex: fromName || "#888888" };
}

export function productColorLabel(raw?: string | null): string {
  return parseProductColor(raw).name;
}

/** True when the product has real customer-facing color choices. */
export function productHasColorOptions(
  images?: Array<{ color_code: string }> | null,
): boolean {
  if (!images?.length) return false;
  if (images.length > 1) return true;
  const name = parseProductColor(images[0]?.color_code).name;
  return Boolean(name && name !== "Default");
}
