"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
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
      "Our ministry has worked with Printiful for her annual concert in 2024 for the design, customisation, and printing of the t-shirt every band member wore on that day.\n\nShe gave us a swift and excellent delivery of the tees even with the short notice.\n\nWe will trust the brand a million times again if there's a need for her services.",
    image: "/assets/Image/Folake-Akinwale.jpg",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

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
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
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
  index,
}: {
  item: Testimonial;
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <StaggerItem className="h-full">
      <motion.article
        className="h-full border border-border bg-surface p-6 sm:p-8"
        whileHover={
          reduce
            ? undefined
            : {
                y: -6,
                borderColor: "rgba(83, 0, 155, 0.45)",
                transition: { duration: 0.35, ease: EASE },
              }
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <motion.div
            className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-purple/15 sm:mx-0 sm:w-44 dark:ring-brand-yellow/20"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: reduce ? 0 : 0.08 + index * 0.1,
            }}
            whileHover={reduce ? undefined : { scale: 1.03 }}
          >
            <Portrait name={item.name} image={item.image} />
          </motion.div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <motion.p
              className="font-heading text-xl font-semibold leading-tight sm:text-2xl"
              initial={reduce ? false : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.16 + index * 0.1,
              }}
            >
              {item.name}
            </motion.p>
            <motion.p
              className="mt-1 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-brand-purple dark:text-brand-yellow"
              initial={reduce ? false : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: reduce ? 0 : 0.24 + index * 0.1,
              }}
            >
              {item.role}
            </motion.p>
            <motion.blockquote
              className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.65,
                ease: EASE,
                delay: reduce ? 0 : 0.32 + index * 0.1,
              }}
            >
              <p className="whitespace-pre-line">
                &ldquo;{item.quote}&rdquo;
              </p>
            </motion.blockquote>
          </div>
        </div>
      </motion.article>
    </StaggerItem>
  );
}

export function Testimonials() {
  return (
    <section
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

        <Stagger
          className={cn(
            "mt-14 grid gap-6",
            TESTIMONIALS.length === 1
              ? "mx-auto max-w-3xl"
              : "md:grid-cols-2",
          )}
          stagger={0.18}
        >
          {TESTIMONIALS.map((item, index) => (
            <TestimonialCard key={item.name} item={item} index={index} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}
