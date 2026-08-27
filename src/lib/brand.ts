/** Official Printiful brand assets — see brand guidelines PDF. */

export const BRAND_LOGO_LOCKUP = "/assets/logo%20with%20printiful.svg";
export const BRAND_LOGO_MARK = "/assets/logo.svg";

export type LogoSurface = "light" | "dark";

/** White logo on dark backgrounds; black logo on light backgrounds. */
export function brandLogoClassName(
  surface: LogoSurface,
  className?: string,
): string {
  const tone =
    surface === "dark"
      ? "brightness-0 invert"
      : "brightness-0";
  return [tone, className].filter(Boolean).join(" ");
}
