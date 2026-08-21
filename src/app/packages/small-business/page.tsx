import type { Metadata } from "next";
import Link from "next/link";
import { SmallBusinessPackageHero } from "@/components/packages/SmallBusinessPackageHero";
import { SmallBusinessPackageOffer } from "@/components/packages/SmallBusinessPackageOffer";
import { Reveal } from "@/components/motion/Reveal";
import { SMALL_BUSINESS_PACKAGE_INCLUDES } from "@/lib/packages";

export const metadata: Metadata = {
  title: "Small Business Package | Printiful",
  description:
    "100 medium poly mailers, 100 A6 thank you cards, and 2 customized tees. Built for growing small businesses.",
  openGraph: {
    title: "Small Business Package | Printiful",
    description:
      "Starter brand packaging for small businesses — mailers, thank you cards, and 2 custom tees.",
    url: "/packages/small-business",
    siteName: "Printiful",
    type: "website",
  },
};

export default function SmallBusinessPackagePage() {
  return (
    <main className="bg-surface text-foreground">
      <SmallBusinessPackageHero />

      <section className="border-b border-border bg-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              What&apos;s included
            </h2>
            <p className="mt-3 text-muted">
              One fixed package so you can start packaging and branding without piecing it together.
            </p>
          </Reveal>
          <ul className="mt-10 space-y-8">
            {SMALL_BUSINESS_PACKAGE_INCLUDES.map((item, i) => (
              <Reveal key={item.label} delay={0.06 * i}>
                <li className="flex flex-col gap-0 overflow-hidden border border-border sm:flex-row sm:items-stretch">
                  <div className="relative aspect-[4/3] w-full bg-surface sm:aspect-auto sm:w-44 sm:shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center gap-4 bg-brand-purple/10 px-5 py-5 sm:px-6 dark:bg-brand-purple/25">
                    <span className="font-display text-sm font-bold text-brand-purple dark:text-brand-yellow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {item.label}
                    </span>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Who it&apos;s for
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Built for budget-conscious small businesses that need branded packaging and a couple of
              custom tees without a large production run. Ideal if you&apos;re shipping orders and want
              your unboxing to feel intentional.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="order" className="scroll-mt-24 bg-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Customize your package
            </h2>
            <p className="mt-3 text-muted">
              Tell us bag artwork vs wording, thank you card content, and each tee&apos;s
              color plus design — then add the package to your cart.
            </p>
          </Reveal>
          <div className="mt-10">
            <SmallBusinessPackageOffer />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Looking for single pieces?
            </h2>
            <p className="mt-3 text-muted">
              Browse the full Printiful catalog for tees, packaging, and more —
              separate from this package.
            </p>
            <Link
              href="/store"
              className="mt-6 inline-flex rounded-full border border-brand-purple px-7 py-3.5 text-sm font-semibold text-brand-purple transition hover:bg-brand-purple hover:text-white dark:border-brand-yellow dark:text-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-black"
            >
              Browse store
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
