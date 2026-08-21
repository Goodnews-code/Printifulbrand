"use client";

import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";
import { resolveSmallBusinessPackage } from "@/lib/packages";
import { Reveal } from "@/components/motion/Reveal";

/** Closing home link into the Small Business Package — mirrors package → store. */
export function PackagePromoStrip() {
  const { settings } = useSettings();
  const pkg = resolveSmallBusinessPackage(settings);

  if (!pkg.enabled) return null;

  return (
    <section className="border-t border-border py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Starting a brand from scratch?
          </h2>
          <p className="mt-3 text-muted">
            The {pkg.title} bundles poly mailers, thank you cards, and 2 custom
            tees in one checkout at {formatNaira(pkg.price)}.
          </p>
          <Link
            href="/packages/small-business"
            className="mt-6 inline-flex rounded-full border border-brand-purple px-7 py-3.5 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple hover:text-white dark:border-brand-yellow dark:text-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-black"
          >
            View package
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
