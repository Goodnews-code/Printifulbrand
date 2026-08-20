import type { Metadata } from "next";
import Link from "next/link";
import { SmallBusinessPackageOffer } from "@/components/packages/SmallBusinessPackageOffer";
import { Reveal } from "@/components/motion/Reveal";
import {
  SMALL_BUSINESS_PACKAGE_INCLUDES,
  SMALL_BUSINESS_PACKAGE_PRICE,
  SMALL_BUSINESS_PACKAGE_TITLE,
} from "@/lib/packages";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Small Business Package | Printiful",
  description:
    "100 medium poly mailers, 100 A6 thank you cards, and 2 customized tees for ₦55,000. Built for growing small businesses.",
  openGraph: {
    title: "Small Business Package | Printiful",
    description:
      "Starter brand packaging for small businesses — mailers, thank you cards, and 2 custom tees for ₦55,000.",
    url: "/packages/small-business",
    siteName: "Printiful",
    type: "website",
  },
};

export default function SmallBusinessPackagePage() {
  return (
    <main className="bg-surface text-foreground">
      {/* Hero — brand first, full-bleed visual plane */}
      <section className="relative isolate min-h-[min(88vh,760px)] overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-cover bg-center motion-safe:animate-float-slow"
          style={{
            backgroundImage: "url('/assets/Image/Customized nylon.jpeg')",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(26,0,51,0.92) 0%, rgba(83,0,155,0.78) 48%, rgba(26,0,51,0.55) 100%)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-20 bottom-10 size-64 rounded-full bg-brand-yellow/10 blur-3xl motion-safe:animate-float-slow" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[min(88vh,760px)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <Reveal direction="up">
            <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-brand-yellow">
              Printiful
            </p>
            <h1 className="mt-3 max-w-2xl font-heading text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {SMALL_BUSINESS_PACKAGE_TITLE}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/85 sm:text-xl">
              Everything you need to ship and show up as a brand —{" "}
              <span className="font-semibold text-brand-yellow">
                {formatNaira(SMALL_BUSINESS_PACKAGE_PRICE)}
              </span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Poly mailers, thank you cards, and two customized tees. One package, one checkout.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#order"
                className="inline-flex rounded-full bg-brand-yellow px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-black transition hover:bg-white"
              >
                Get the package
              </a>
              <Link
                href="/store"
                className="inline-flex rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse store
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* What’s included */}
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
          <ul className="mt-10 space-y-5">
            {SMALL_BUSINESS_PACKAGE_INCLUDES.map((item, i) => (
              <Reveal key={item} delay={0.06 * i}>
                <li className="flex gap-4 border-b border-border pb-5 last:border-0 last:pb-0">
                  <span className="font-display text-sm font-bold text-brand-purple">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base text-foreground sm:text-lg">{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it’s for */}
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

      {/* Order */}
      <section id="order" className="scroll-mt-24 bg-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Choose your tee colors
            </h2>
            <p className="mt-3 text-muted">
              Tell us the two tee colors you want, then add the package to your cart and checkout as usual.
            </p>
          </Reveal>
          <div className="mt-10">
            <SmallBusinessPackageOffer />
          </div>
        </div>
      </section>
    </main>
  );
}
