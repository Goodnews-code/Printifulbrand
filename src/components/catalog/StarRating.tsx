"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  interactive?: boolean;
  onChange?: (value: number) => void;
  label?: string;
}

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
  interactive = false,
  onChange,
  label = "Rating",
}: StarRatingProps) {
  const dim = size === "md" ? "text-xl" : "text-sm";

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? label : `${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= Math.round(value);
        if (!interactive) {
          return (
            <span
              key={star}
              className={cn(dim, filled ? "text-brand-purple dark:text-brand-yellow" : "text-border")}
              aria-hidden
            >
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            className={cn(
              dim,
              "px-0.5 transition-transform hover:scale-110",
              star <= value
                ? "text-brand-purple dark:text-brand-yellow"
                : "text-border hover:text-muted",
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
