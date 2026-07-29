"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export function Hero() {
  const { settings } = useSettings();

  return (
    <section
      id="hero"
      className="relative isolate min-h-[88vh] overflow-hidden bg-brand-black text-white"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(83,0,155,0.55), transparent 60%), linear-gradient(160deg, #111111 0%, #1a0033 45%, #0d0015 100%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 w-[42vw] max-w-xl -translate-y-1/2 opacity-[0.08]"
      />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:justify-center lg:px-8 lg:pb-24 lg:pt-20">
        <p className="mb-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-yellow">
          00 / Curated wear & high-fidelity printing
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {settings.hero_headline || "Be Bold! Be Seen!! Be Known!!!"}
        </h1>
        <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">
          {settings.hero_subtext ||
            "Printiful helps announce you and your brand even when you don't say a word — premium personalized items and branded merchandise."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#catalog"
            className="bg-brand-yellow px-6 py-3.5 font-ui text-sm font-bold uppercase tracking-wide text-brand-black transition-colors hover:bg-white"
          >
            Explore Collection
          </Link>
          <Link
            href="#inquiry"
            className="border border-white/40 px-6 py-3.5 font-ui text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
          >
            Custom Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
