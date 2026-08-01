/** Standard apparel sizes for Printiful merch. */
export const STANDARD_APPAREL_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export const EXTRA_PRODUCT_SIZES = ["One Size", "Free Size"] as const;

export const ALL_STANDARD_SIZES = [
  ...STANDARD_APPAREL_SIZES,
  ...EXTRA_PRODUCT_SIZES,
] as const;

export type StandardSize = (typeof ALL_STANDARD_SIZES)[number];

export const DEFAULT_SELECTED_SIZES: string[] = ["S", "M", "L", "XL"];
