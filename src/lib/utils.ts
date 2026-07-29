import type { CategorySlug } from "@/types";

const CATEGORY_MAP: Record<string, CategorySlug> = {
  apparels: "apparels",
  apparel: "apparels",
  stationery: "stationery",
  "brand packaging": "packaging",
  packaging: "packaging",
  gadgets: "gadgets",
  "corporate gift": "gifts",
  "corporate gifts": "gifts",
  gifts: "gifts",
  lifestyle: "lifestyle",
};

export const CATEGORY_FILTERS: { id: CategorySlug | "all"; label: string }[] = [
  { id: "all", label: "All Items" },
  { id: "apparels", label: "Apparels" },
  { id: "stationery", label: "Stationery" },
  { id: "packaging", label: "Brand Packaging" },
  { id: "gadgets", label: "Gadgets" },
  { id: "gifts", label: "Corporate Gifts" },
  { id: "lifestyle", label: "Lifestyle" },
];

export function normalizeCategory(raw?: string | null): CategorySlug | "all" {
  if (!raw) return "all";
  return CATEGORY_MAP[raw.trim().toLowerCase()] ?? "all";
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
