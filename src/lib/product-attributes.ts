import { productHasColorOptions } from "@/lib/product-color";
import type { Product } from "@/types";

/** Store catalog categories (admin + filters). */
export const PRODUCT_CATEGORIES = [
  "Apparels",
  "Stationery",
  "Brand Packaging",
  "Gadgets",
  "Corporate Gift",
  "Lifestyle",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface CategoryAttributeConfig {
  /** Section heading shown after category is chosen. */
  attributesTitle: string;
  colorHelp: string;
  /** Prefer offering colors for this category (admin toggle default). */
  colorsDefaultOn: boolean;
  sizeLabel: string;
  sizeHelp: string;
  sizesDefaultOn: boolean;
  /** Chips offered in admin for this category. */
  sizePresets: string[];
  /** Pre-selected when creating a new product in this category. */
  defaultSelectedSizes: string[];
}

const APPAREL_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "One Size",
  "Free Size",
] as const;

export const CATEGORY_ATTRIBUTES: Record<
  ProductCategory,
  CategoryAttributeConfig
> = {
  Apparels: {
    attributesTitle: "Apparel attributes",
    colorHelp:
      "Tees, hoodies, and caps often come in colors. Upload a photo per color so shoppers see the right product.",
    colorsDefaultOn: true,
    sizeLabel: "Sizes",
    sizeHelp:
      "Clothing sizes for tees/hoodies. Use One Size / Free Size for caps, totes, and bags.",
    sizesDefaultOn: true,
    sizePresets: [...APPAREL_SIZES],
    defaultSelectedSizes: ["S", "M", "L", "XL"],
  },
  Stationery: {
    attributesTitle: "Stationery attributes",
    colorHelp:
      "Optional. Add colors only if this notebook, pen, or sticker pack has color choices.",
    colorsDefaultOn: false,
    sizeLabel: "Formats / packs",
    sizeHelp:
      "Page format or pack quantity. Leave off if the item is a single standard piece.",
    sizesDefaultOn: false,
    sizePresets: [
      "One Size",
      "A4",
      "A5",
      "A6",
      "Pack of 3",
      "Pack of 5",
      "Pack of 10",
    ],
    defaultSelectedSizes: [],
  },
  "Brand Packaging": {
    attributesTitle: "Packaging attributes",
    colorHelp:
      "Optional. Add colors if mailers or seals come in more than one finish.",
    colorsDefaultOn: false,
    sizeLabel: "Sizes / packs",
    sizeHelp: "Bag or pack size for mailers, seals, and packaging supplies.",
    sizesDefaultOn: false,
    sizePresets: ["One Size", "Small", "Medium", "Large", "Pack"],
    defaultSelectedSizes: [],
  },
  Gadgets: {
    attributesTitle: "Gadget attributes",
    colorHelp:
      "Optional. Add colors if the mouse, pad, or headset has color variants.",
    colorsDefaultOn: false,
    sizeLabel: "Sizes",
    sizeHelp: "Most gadgets are One Size. Add more only if you sell variants.",
    sizesDefaultOn: false,
    sizePresets: ["One Size", "Standard", "Compact", "Extended"],
    defaultSelectedSizes: [],
  },
  "Corporate Gift": {
    attributesTitle: "Gift attributes",
    colorHelp:
      "Mugs and bottles often have color options. Upload a photo for each color.",
    colorsDefaultOn: false,
    sizeLabel: "Sizes / capacity",
    sizeHelp:
      "Mug capacity (oz), bottle volume (ml), or gift-box size. Pick only what applies.",
    sizesDefaultOn: true,
    sizePresets: [
      "11 oz",
      "15 oz",
      "20 oz",
      "350 ml",
      "500 ml",
      "750 ml",
      "1 L",
      "One Size",
      "Small",
      "Medium",
      "Large",
    ],
    defaultSelectedSizes: ["11 oz", "15 oz"],
  },
  Lifestyle: {
    attributesTitle: "Lifestyle attributes",
    colorHelp: "Optional. Add colors when the item has real color choices.",
    colorsDefaultOn: false,
    sizeLabel: "Sizes",
    sizeHelp: "Use apparel sizes or One Size depending on the product.",
    sizesDefaultOn: false,
    sizePresets: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "One Size",
      "Free Size",
    ],
    defaultSelectedSizes: [],
  },
};

export function getCategoryAttributes(
  category?: string | null,
): CategoryAttributeConfig {
  const key = (category || "Apparels") as ProductCategory;
  return CATEGORY_ATTRIBUTES[key] ?? CATEGORY_ATTRIBUTES.Apparels;
}

/** Size chips for admin: category presets + any custom sizes already on the product. */
export function sizeOptionsForProduct(
  category: string | null | undefined,
  existingSizes: string[] = [],
): string[] {
  const presets = getCategoryAttributes(category).sizePresets;
  const extras = existingSizes.filter((s) => !presets.includes(s));
  return [...presets, ...extras];
}

export function productUsesColors(product: Product): boolean {
  return productHasColorOptions(product.images);
}

export function productUsesSizes(product: Product): boolean {
  return Boolean(product.sizes?.length);
}
