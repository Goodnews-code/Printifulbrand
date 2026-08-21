import type { SiteSettings } from "@/types";

/** Standalone package offer — not a regular catalog product. */
export const SMALL_BUSINESS_PACKAGE_TITLE = "Small Business Package";

/** Reserved cart id so the package never collides with store product ids. */
export const SMALL_BUSINESS_PACKAGE_PRODUCT_ID = -55000;

export const SMALL_BUSINESS_PACKAGE_PRICE = 55_000;

export const SMALL_BUSINESS_PACKAGE_IMAGE = "/assets/Image/Customized nylon.jpeg";

export const SMALL_BUSINESS_PACKAGE_CATEGORY = "Packages";

export const SMALL_BUSINESS_PACKAGE_TAGLINE =
  "Poly mailers, thank you cards, and two customized tees. One package, one checkout.";

/** Settings keys editable in Admin → Settings */
export const PACKAGE_SETTING_KEYS = {
  enabled: "package_sb_enabled",
  title: "package_sb_title",
  price: "package_sb_price",
  tagline: "package_sb_tagline",
} as const;

export const SMALL_BUSINESS_PACKAGE_INCLUDES = [
  {
    label: "100 pieces of medium poly mailer bags",
    image: "/assets/Image/Customized nylon.jpeg",
    alt: "Medium poly mailer bags",
  },
  {
    label: "100 pieces of A6 size thank you cards",
    image: "/assets/Image/thank-you-cards.jpg",
    alt: "A6 thank you cards",
  },
  {
    label: "2 customized tees in any colors of your choice",
    image: "/assets/Image/tee-shirt.jpg",
    alt: "Customized tees",
  },
] as const;

export type SmallBusinessPackageConfig = {
  enabled: boolean;
  title: string;
  price: number;
  tagline: string;
};

export function resolveSmallBusinessPackage(
  settings?: Partial<SiteSettings> | null,
): SmallBusinessPackageConfig {
  const enabledRaw = (settings?.[PACKAGE_SETTING_KEYS.enabled] ?? "true")
    .toString()
    .trim()
    .toLowerCase();
  const enabled = enabledRaw !== "false" && enabledRaw !== "0" && enabledRaw !== "off";

  const title =
    (settings?.[PACKAGE_SETTING_KEYS.title] || "").trim() ||
    SMALL_BUSINESS_PACKAGE_TITLE;

  const priceParsed = Number(
    (settings?.[PACKAGE_SETTING_KEYS.price] || "").toString().replace(/,/g, ""),
  );
  const price =
    Number.isFinite(priceParsed) && priceParsed > 0
      ? priceParsed
      : SMALL_BUSINESS_PACKAGE_PRICE;

  const tagline =
    (settings?.[PACKAGE_SETTING_KEYS.tagline] || "").trim() ||
    SMALL_BUSINESS_PACKAGE_TAGLINE;

  return { enabled, title, price, tagline };
}

export function isSmallBusinessPackageTitle(title?: string | null): boolean {
  return (title || "").trim().toLowerCase() === SMALL_BUSINESS_PACKAGE_TITLE.toLowerCase();
}

/** Keep the package off the regular store grid — it lives on its own landing page. */
export function isPackageOnlyProduct(title?: string | null): boolean {
  return isSmallBusinessPackageTitle(title);
}
