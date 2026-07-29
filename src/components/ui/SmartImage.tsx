"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  className?: string;
  /** Fill parent with object-cover (default for product cards) */
  fillCover?: boolean;
};

/**
 * Optimized image: WebP/AVIF via Next.js, lazy by default, sensible sizes.
 * Local `/…` paths and Supabase public URLs both work.
 */
export function SmartImage({
  src,
  alt,
  className,
  fillCover = false,
  sizes,
  priority,
  ...rest
}: SmartImageProps) {
  const isSvg = src.toLowerCase().endsWith(".svg");
  const common = {
    alt,
    className: cn(fillCover ? "object-cover" : "", className),
    sizes:
      sizes ??
      (fillCover
        ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        : undefined),
    priority,
    loading: (priority ? undefined : "lazy") as "lazy" | undefined,
    unoptimized: isSvg || undefined,
  };

  if (fillCover) {
    return <Image src={src} fill {...common} {...rest} />;
  }

  return <Image src={src} {...common} {...rest} />;
}
