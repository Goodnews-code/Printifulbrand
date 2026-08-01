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

export function parseProductColor(raw?: string | null): {
  name: string;
  hex: string;
} {
  const value = (raw || "").trim();
  if (!value) return { name: "Default", hex: "#888888" };

  const pipe = value.indexOf("|");
  if (pipe > 0) {
    const name = value.slice(0, pipe).trim() || "Default";
    const hex = normalizeHex(value.slice(pipe + 1));
    return { name, hex };
  }

  if (value.startsWith("#")) {
    return { name: value, hex: normalizeHex(value) };
  }

  return { name: value, hex: "#888888" };
}

export function productColorLabel(raw?: string | null): string {
  return parseProductColor(raw).name;
}
