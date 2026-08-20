"use client";

import { useState } from "react";
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
];

function Portrait({ name, image }: { name: string; image: string }) {
  const [failed, setFailed] = useState(false);
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
    <SmartImage
      src={image}
      alt={name}
      fillCover
      unoptimized
      sizes="(max-width: 640px) 40vw, 220px"
      className="object-cover object-top"
      onError={() => setFailed(true)}
    />
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
            Real words from founders and brands we print for.
          </p>
        </Reveal>

        <Stagger
          className={cn(
            "mt-14 grid gap-6",
            TESTIMONIALS.length === 1
              ? "mx-auto max-w-3xl"
              : "md:grid-cols-2 lg:grid-cols-3",
          )}
          stagger={0.14}
        >
          {TESTIMONIALS.map((item) => (
            <StaggerItem
              key={item.name}
              className="border border-border bg-surface p-6 sm:p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="relative mx-auto aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-lg sm:mx-0 sm:w-44">
                  <Portrait name={item.name} image={item.image} />
                </div>
                <div className="min-w-0 flex-1 text-center sm:pt-1 sm:text-left">
                  <p className="font-heading text-xl font-semibold leading-tight sm:text-2xl">
                    {item.name}
                  </p>
                  <p className="mt-1 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-brand-purple dark:text-brand-yellow">
                    {item.role}
                  </p>
                  <blockquote className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">
                    <p className="whitespace-pre-line">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </blockquote>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
