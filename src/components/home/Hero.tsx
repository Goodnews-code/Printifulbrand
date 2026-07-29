"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { SmartImage } from "@/components/ui/SmartImage";

const HERO_IMAGES = [
  {
    src: "/assets/Image/Branded Journals.jpeg",
    alt: "Branded Journals",
    label: "[ PRINTIFUL ARCHIVE // Branded Journals ]",
    className: "h-[280px] sm:h-[360px] lg:h-[480px]",
  },
  {
    src: "/assets/Image/Love won tee.jpeg",
    alt: "Love Won Tee",
    label: "[ PRINTIFUL ARCHIVE // LOVE WON PREMIUM TEE ]",
    className: "mt-8 h-[240px] sm:h-[320px] lg:mt-10 lg:h-[400px]",
  },
] as const;

export function Hero() {
  const { settings } = useSettings();

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-border bg-surface pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pb-24"
    >
      {/* Soft brand atmosphere behind the collage */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 55% at 22% 40%, rgba(83,0,155,0.12), transparent 65%), linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 55%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-6">
        {/* Left: two-image collage */}
        <div className="relative order-2 lg:order-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-6 top-1/2 z-0 w-[55%] max-w-sm -translate-y-1/2 opacity-[0.07] dark:invert"
          />
          <div className="relative z-10 mx-auto grid max-w-xl grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 lg:mx-0 lg:max-w-none">
            {HERO_IMAGES.map((image) => (
              <figure
                key={image.src}
                className={`group relative overflow-hidden bg-surface-alt ${image.className}`}
              >
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  fillCover
                  priority
                  sizes="(max-width: 1024px) 45vw, 320px"
                  className="grayscale-[15%] transition-transform duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <figcaption className="pointer-events-none absolute bottom-3 left-3 bg-black/75 px-2 py-1 font-ui text-[0.6rem] tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Right: copy + CTAs */}
        <div className="order-1 flex flex-col items-start text-left lg:order-2">
          <p className="mb-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-purple dark:text-brand-yellow">
            00 / Curated wear & high-fidelity printing
          </p>
          <h1 className="max-w-xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {settings.hero_headline || "Be Bold! Be Seen!! Be Known!!!"}
          </h1>
          <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-muted sm:text-lg">
            {settings.hero_subtext ||
              "Printiful helps announce you and your brand even when you don't say a word — premium personalized items and branded merchandise."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#catalog"
              className="bg-brand-purple px-6 py-3.5 font-ui text-sm font-bold uppercase tracking-wide text-white"
            >
              Explore Collection
            </Link>
            <Link
              href="#inquiry"
              className="border border-border px-6 py-3.5 font-ui text-sm font-semibold uppercase tracking-wide text-foreground"
            >
              Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
