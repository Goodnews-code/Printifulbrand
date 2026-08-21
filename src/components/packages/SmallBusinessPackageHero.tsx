"use client";

import { Reveal } from "@/components/motion/Reveal";
import { useSettings } from "@/context/SettingsContext";
import {
  SMALL_BUSINESS_PACKAGE_IMAGE,
  resolveSmallBusinessPackage,
} from "@/lib/packages";
import { formatNaira } from "@/lib/utils";

export function SmallBusinessPackageHero() {
  const { settings } = useSettings();
  const pkg = resolveSmallBusinessPackage(settings);

  return (
    <section className="relative isolate min-h-[min(88vh,760px)] overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 bg-cover bg-center motion-safe:animate-float-slow"
        style={{
          backgroundImage: `url('${SMALL_BUSINESS_PACKAGE_IMAGE}')`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(26,0,51,0.92) 0%, rgba(83,0,155,0.78) 48%, rgba(26,0,51,0.55) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-10 size-64 rounded-full bg-brand-yellow/10 blur-3xl motion-safe:animate-float-slow"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-[min(88vh,760px)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <Reveal direction="up">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-brand-yellow">
            Printiful
          </p>
          <h1 className="mt-3 max-w-2xl font-heading text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {pkg.title}
          </h1>
          {!pkg.enabled ? (
            <p className="mt-4 max-w-lg text-lg text-brand-yellow sm:text-xl">
              This package is currently unavailable. Check back soon or contact
              shopprintiful@gmail.com.
            </p>
          ) : (
            <>
              <p className="mt-4 max-w-lg text-lg text-white/85 sm:text-xl">
                Everything you need to ship and show up as a brand —{" "}
                <span className="font-semibold text-brand-yellow">
                  {formatNaira(pkg.price)}
                </span>
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                {pkg.tagline}
              </p>
              <div className="mt-8">
                <a
                  href="#order"
                  className="inline-flex rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-black transition hover:bg-white"
                >
                  Get the package
                </a>
              </div>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
