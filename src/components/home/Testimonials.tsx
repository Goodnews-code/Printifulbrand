"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Olaide",
    role: "Founder, Olaktreats",
    quote:
      "We have been working with Printiful for some years even before she rebranded, we have had nothing short of excellent experience. She is definitely worth every penny spent.\n\nWelldone Printiful",
    image: "/assets/Image/Olaide - Founder.jpg",
  },
  {
    name: "Folake Akinwale",
    role: "Lead Singer & Director, Ogo Oluwa Voices and Songs Ministry Int'l",
    quote:
      "Our ministry has worked with Printiful for her annual concert in 2024 for the design, customisation, and printing of the t-shirt every band member wore on that day.\n\nShe gave us a swift and excellent delivery of the tees even with the short notice. We will trust the brand a million times again if there's a need for her services.",
    image: "/assets/Image/Folake-Akinwale.jpg",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const CHAR_MS = 22;
const PAUSE_AFTER_MS = 450;

function useTypewriter(text: string, enabled: boolean, reduce: boolean) {
  const [displayed, setDisplayed] = useState(reduce ? text : "");
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    if (!enabled) {
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, CHAR_MS);

    return () => window.clearInterval(id);
  }, [text, enabled, reduce]);

  return { displayed, done };
}

function Portrait({ name, image }: { name: string; image: string }) {
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (failed) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-brand-purple font-heading text-4xl text-white dark:bg-brand-yellow dark:text-brand-black"
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <motion.div
      className="relative h-full w-full"
      initial={reduce ? false : { opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={reduce ? undefined : { scale: 1.04 }}
    >
      <SmartImage
        src={image}
        alt={name}
        fillCover
        unoptimized
        sizes="(max-width: 640px) 40vw, 220px"
        className="object-cover object-center transition-transform duration-500"
        onError={() => setFailed(true)}
      />
    </motion.div>
  );
}

function TestimonialCard({
  item,
  active,
  onTyped,
}: {
  item: Testimonial;
  active: boolean;
  onTyped: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const { displayed, done } = useTypewriter(item.quote, active, reduce);

  useEffect(() => {
    if (!done || !active) return;
    const id = window.setTimeout(onTyped, reduce ? 0 : PAUSE_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [done, active, onTyped, reduce]);

  return (
    <motion.article
      className="h-full bg-surface p-6 shadow-[0_8px_28px_rgba(13,0,21,0.12)] sm:p-8 dark:shadow-[0_10px_32px_rgba(0,0,0,0.45)]"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.35, ease: EASE },
            }
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-purple/15 sm:w-44 dark:ring-brand-yellow/20">
          <Portrait name={item.name} image={item.image} />
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="font-heading text-xl font-semibold leading-tight sm:text-2xl">
            {item.name}
          </p>
          <p className="mt-1 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-brand-purple dark:text-brand-yellow">
            {item.role}
          </p>
          <blockquote className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">
            <p className="whitespace-pre-line" aria-label={item.quote}>
              &ldquo;{displayed}
              {active && !done && !reduce ? (
                <span
                  className="ml-0.5 inline-block h-[1.05em] w-[0.08em] translate-y-[0.12em] animate-pulse bg-brand-purple align-baseline dark:bg-brand-yellow"
                  aria-hidden
                />
              ) : null}
              &rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    </motion.article>
  );
}

export function Testimonials() {
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.28 });
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingIndex, setTypingIndex] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVisibleCount(TESTIMONIALS.length);
      setTypingIndex(TESTIMONIALS.length);
      return;
    }
    setVisibleCount(1);
    setTypingIndex(0);
  }, [inView, reduce]);

  const handleTyped = useCallback((index: number) => {
    if (index >= TESTIMONIALS.length - 1) return;
    setVisibleCount((count) => Math.max(count, index + 2));
    setTypingIndex(index + 1);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="scroll-mt-20 bg-surface-alt py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block bg-brand-purple px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Client Voices
          </span>
          <h2 className="mt-4 font-heading text-4xl italic sm:text-5xl">
            What they say
          </h2>
          <p className="mt-4 text-muted">
            Real words from founders, ministries, and brands we print for.
          </p>
        </Reveal>

        <div
          className={cn(
            "mt-14 grid gap-6",
            TESTIMONIALS.length === 1
              ? "mx-auto max-w-3xl"
              : "md:grid-cols-2",
          )}
        >
          {TESTIMONIALS.slice(0, visibleCount).map((item, index) => (
            <TestimonialCard
              key={item.name}
              item={item}
              active={typingIndex === index}
              onTyped={() => handleTyped(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
