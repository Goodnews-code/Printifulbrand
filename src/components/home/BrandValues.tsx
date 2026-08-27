"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

const VALUES = [
  {
    num: "01 //",
    title: "Quality Without Compromise",
    body: "Clean high-density prints, heavyweight organic materials, and durable finishes that withstand time and elements.",
  },
  {
    num: "02 //",
    title: "Curation Without Limits",
    body: "Collaborate with our studio experts to design bespoke, premium prints and embroideries tailored to your brand.",
  },
  {
    num: "03 //",
    title: "Reliability You Can Trust",
    body: "When we commit to a production timeline, your orders are finalized and shipped without delay.",
  },
];

export function BrandValues() {
  return (
    <section className="bg-surface-alt py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Beautiful designs, always.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            If it is not beautiful, it is not Printiful. We believe your ideas
            deserve pure, refined expression — clean aesthetics, precision, and
            confidence.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.16}>
          {VALUES.map((value) => (
            <StaggerItem
              key={value.num}
              className="group border border-border bg-surface p-6 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand-purple hover:shadow-[0_12px_40px_-20px_rgba(83,0,155,0.35)] dark:hover:border-brand-yellow dark:hover:shadow-[0_12px_40px_-20px_rgba(255,255,0,0.2)]"
            >
              <p className="font-ui text-xs font-bold tracking-widest text-brand-purple dark:text-brand-yellow">
                {value.num}
              </p>
              <h3 className="mt-3 font-heading text-2xl font-semibold">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {value.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
