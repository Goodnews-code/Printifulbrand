"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: ProductImage[];
  alt: string;
  sizes?: string;
  index?: number;
  onIndexChange?: (i: number) => void;
  className?: string;
}

const SWIPE_THRESHOLD = 40;

export function ImageCarousel({
  images,
  alt,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",
  index: controlledIndex,
  onIndexChange,
  className,
}: ImageCarouselProps) {
  const [internalIdx, setInternalIdx] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const idx = isControlled ? controlledIndex : internalIdx;

  const setIdx = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(images.length - 1, next));
      if (isControlled) {
        onIndexChange?.(clamped);
      } else {
        setInternalIdx(clamped);
      }
    },
    [isControlled, images.length, onIndexChange],
  );

  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) setIdx(idx + 1);
      else setIdx(idx - 1);
    }
  };

  if (!images.length) return null;

  const showControls = images.length > 1;
  const active = images[Math.min(idx, images.length - 1)];

  return (
    <div
      className={cn("group relative select-none overflow-hidden", className)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <SmartImage
        key={active.image_url}
        src={active.image_url}
        alt={`${alt} — slide ${idx + 1}`}
        fillCover
        sizes={sizes}
        className="transition-opacity duration-300"
        draggable={false}
      />
      {showControls && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              setIdx(idx - 1);
            }}
            disabled={idx === 0}
            className={cn(
              "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity",
              "group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0",
            )}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              setIdx(idx + 1);
            }}
            disabled={idx === images.length - 1}
            className={cn(
              "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity",
              "group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0",
            )}
          >
            <ChevronRight size={18} />
          </button>
          <div
            className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5"
            role="tablist"
            aria-label="Gallery slides"
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === idx
                    ? "h-2 w-4 bg-white shadow"
                    : "size-2 bg-white/50 hover:bg-white/75",
                )}
              />
            ))}
          </div>
          <span className="absolute right-2 top-2 z-10 rounded-full bg-black/50 px-2 py-0.5 font-ui text-[10px] font-semibold text-white backdrop-blur-sm">
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}
