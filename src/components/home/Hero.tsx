"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useSettings } from "@/context/SettingsContext";
import { SmartImage } from "@/components/ui/SmartImage";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/Reveal";

const HERO_IMAGES = [
  {
    src: "/assets/Image/Mouse.webp",
    alt: "Branded Mouse",
    label: "[ PRINTIFUL ARCHIVE // BRANDED MOUSE ]",
    className: "h-[280px] sm:h-[360px] lg:h-[480px]",
  },
  {
    src: "/assets/Image/Love won tee.jpeg",
    alt: "Love Won Tee",
    label: "[ PRINTIFUL ARCHIVE // LOVE WON PREMIUM TEE ]",
    className: "mt-8 h-[240px] sm:h-[320px] lg:mt-10 lg:h-[400px]",
  },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { settings } = useSettings();
  const reduce = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-border bg-surface pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pb-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 50% 55% at 22% 40%, rgba(83,0,155,0.12), transparent 65%), linear-gradient(180deg, var(--surface-alt) 0%, var(--surface) 55%)",
        }}
      />
      {/* Brand mark in the hero background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(92vw,520px)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.08] animate-float-slow dark:invert sm:w-[min(70vw,640px)] lg:left-[22%] lg:w-[42%] lg:max-w-xl lg:translate-x-0"
      />
      {!reduce && (
        <div
          className="pointer-events-none absolute -right-24 top-16 size-72 rounded-full bg-brand-purple/10 blur-3xl animate-float-slow dark:bg-brand-yellow/10"
          aria-hidden
        />
      )}

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-6">
        <div className="relative order-2 lg:order-1">
          <Stagger
            className="relative z-10 mx-auto grid max-w-xl grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6 lg:mx-0 lg:max-w-none"
            stagger={0.2}
            delay={0.2}
          >
            {HERO_IMAGES.map((image) => (
              <StaggerItem key={image.src}>
                <motion.figure
                  className={`group relative overflow-hidden bg-surface-alt ${image.className}`}
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    fillCover
                    priority
                    sizes="(max-width: 1024px) 45vw, 320px"
                    className="grayscale-[15%] transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <figcaption className="pointer-events-none absolute bottom-3 left-3 bg-black/75 px-2 py-1 font-ui text-[0.6rem] tracking-wide text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {image.label}
                  </figcaption>
                </motion.figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="order-1 flex flex-col items-start text-left lg:order-2">
          <FadeIn delay={0.08}>
            <p className="mb-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-purple dark:text-brand-yellow">
              00 / Curated wear & high-fidelity printing
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="max-w-xl font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {settings.hero_headline || "Be Bold! Be Seen!! Be Known!!!"}
            </h1>
          </FadeIn>
          <FadeIn delay={0.34}>
            <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-muted sm:text-lg">
              {settings.hero_subtext ||
                "Printiful help announce you and your brand even when you don't say a word with our quality and premium products, from personalized items to brand merchandise, we do it all."}
            </p>
          </FadeIn>
          <FadeIn delay={0.48} className="mt-8 flex flex-wrap gap-3">
            <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#catalog"
                className="inline-block bg-brand-purple px-6 py-3.5 font-ui text-sm font-bold uppercase tracking-wide text-white"
              >
                Explore Collection
              </Link>
            </motion.div>
            <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#inquiry"
                className="inline-block border border-border px-6 py-3.5 font-ui text-sm font-semibold uppercase tracking-wide text-foreground"
              >
                Custom Quote
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
