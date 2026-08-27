"use client";

import { PenTool, Printer, Search, Truck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";

const STEPS = [
  {
    icon: PenTool,
    step: "01 // Submit Design",
    title: "Submit Specifications",
    body: "Send detailed design layouts, embroidery vectors, or custom printing requirements using our wholesale inquiry dashboard.",
  },
  {
    icon: Search,
    step: "02 // Pre-Flight Check",
    title: "Technical Verification",
    body: "Our production specialists check vector scaling, stitch density, and DPI configurations to ensure optimal print saturation.",
  },
  {
    icon: Printer,
    step: "03 // Precision Production",
    title: "High-Fidelity Curation",
    body: "Items are customized using Direct-to-Merch printing or dense, multi-thread industrial embroidery machine setups.",
  },
  {
    icon: Truck,
    step: "04 // Quality Assurance",
    title: "Curated & Dispatched",
    body: "Each merch is steam-curated, custom folded, tag-verified, and shipped with express tracked courier service.",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Timeline() {
  const reduce = useReducedMotion();

  return (
    <section id="timeline" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block bg-brand-yellow px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-brand-black">
            How We Print
          </span>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Step-By-Step Print Journey
          </h2>
          <p className="mt-4 text-muted">
            From vector alignment to dense embroidery stitch — here is how we
            bring your vision to life.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="absolute bottom-4 left-[27px] top-4 w-px bg-border sm:left-[31px]" />
          <ol className="space-y-8">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.step}
                  className="relative flex gap-5"
                  initial={reduce ? false : { opacity: 0, x: -28 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                    delay: index * 0.12,
                  }}
                >
                  <div className="relative z-10 flex size-14 shrink-0 items-center justify-center border border-border bg-surface text-brand-purple transition-colors duration-300 hover:border-brand-purple hover:bg-brand-purple hover:text-white dark:text-brand-yellow dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-black sm:size-16">
                    <Icon size={22} />
                  </div>
                  <div className="pt-1">
                    <p className="font-ui text-xs font-bold uppercase tracking-wider text-muted">
                      {item.step}
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
