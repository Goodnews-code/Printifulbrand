"use client";

import { FadeIn, Reveal } from "@/components/motion/Reveal";

interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  afterParagraphs?: string[];
}

interface PolicyPageProps {
  title: string;
  intro?: string;
  sections: PolicySection[];
}

export function PolicyPage({ title, intro, sections }: PolicyPageProps) {
  return (
    <article>
      <header className="border-b border-border bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Legal
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
              {title}
            </h1>
          </FadeIn>
          {intro && (
            <FadeIn delay={0.24}>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
                {intro}
              </p>
            </FadeIn>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
        {sections.map((section, index) => (
          <Reveal key={section.heading} delay={Math.min(index * 0.04, 0.2)}>
            <section>
              <h2 className="font-heading text-2xl font-bold">
                {section.heading}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {section.afterParagraphs?.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          </Reveal>
        ))}
      </div>
    </article>
  );
}
