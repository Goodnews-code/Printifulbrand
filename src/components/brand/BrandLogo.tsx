import {
  BRAND_LOGO_LOCKUP,
  BRAND_LOGO_MARK,
  brandLogoClassName,
  type LogoSurface,
} from "@/lib/brand";

type BrandLogoProps = {
  surface: LogoSurface;
  className?: string;
  /** Full wordmark vs icon-only mark */
  variant?: "lockup" | "mark";
  alt?: string;
  "aria-hidden"?: boolean;
};

export function BrandLogo({
  surface,
  className,
  variant = "lockup",
  alt = "Printiful",
  "aria-hidden": ariaHidden,
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === "lockup" ? BRAND_LOGO_LOCKUP : BRAND_LOGO_MARK}
      alt={alt}
      aria-hidden={ariaHidden}
      className={brandLogoClassName(surface, className)}
    />
  );
}
