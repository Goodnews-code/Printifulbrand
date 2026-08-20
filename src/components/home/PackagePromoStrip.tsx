"use client";

import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { SMALL_BUSINESS_PACKAGE_PRICE } from "@/lib/packages";

/** Soft home promo — sits below BrandValues so it never crowds the hero. */
export function PackagePromoStrip() {
  return (
    <section className="border-y border-border bg-surface-alt">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="text-sm text-foreground sm:text-base">
          <span className="font-semibold text-brand-purple">Small Business Package</span>
          {" — "}
          mailers, thank you cards &amp; 2 custom tees for{" "}
          <span className="font-semibold">{formatNaira(SMALL_BUSINESS_PACKAGE_PRICE)}</span>
        </p>
        <Link
          href="/packages/small-business"
          className="shrink-0 text-sm font-semibold text-brand-purple underline-offset-4 hover:underline dark:text-brand-yellow"
        >
          View package
        </Link>
      </div>
    </section>
  );
}
