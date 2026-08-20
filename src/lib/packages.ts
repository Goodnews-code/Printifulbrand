/** Stable catalog title for the Small Business Package offer. */
export const SMALL_BUSINESS_PACKAGE_TITLE = "Small Business Package";

export const SMALL_BUSINESS_PACKAGE_PRICE = 55_000;

export const SMALL_BUSINESS_PACKAGE_INCLUDES = [
  "100 pieces of medium poly mailer bags",
  "100 pieces of A6 size thank you cards",
  "2 customized tees in any colors of your choice",
] as const;

export function isSmallBusinessPackageTitle(title?: string | null): boolean {
  return (title || "").trim().toLowerCase() === SMALL_BUSINESS_PACKAGE_TITLE.toLowerCase();
}
