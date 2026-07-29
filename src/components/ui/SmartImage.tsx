"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  className?: string;
  fillCover?: boolean;
};

/** Encode local path segments so spaces in filenames work with next/image */
function normalizeSrc(src: string) {
  if (!src) return "/assets/tshirt_base.svg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const withSlash = src.startsWith("/") ? src : `/${src}`;
  return withSlash
    .split("/")
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join("/");
}

export function SmartImage({
  src,
  alt,
  className,
  fillCover = false,
  sizes,
  priority,
  ...rest
}: SmartImageProps) {
  const resolved = normalizeSrc(src);
  const isSvg = resolved.toLowerCase().includes(".svg");
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
    return <Image src={resolved} fill {...common} {...rest} />;
  }

  return <Image src={resolved} {...common} {...rest} />;
}
