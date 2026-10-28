"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MessageSquare,
  Flame,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";
import { resolveSmallBusinessPackage } from "@/lib/packages";
import { Reveal } from "@/components/motion/Reveal";
import { SmartImage } from "@/components/ui/SmartImage";

export function PackagePromoStrip() {
  const { settings } = useSettings();
  const pkg = resolveSmallBusinessPackage(settings);

  if (!pkg.enabled) return null;

  const rawPhone = settings?.whatsapp_number || settings?.contact_phone || "";
  const digits = rawPhone.replace(/\D/g, "");
  const waPhone =
    digits.startsWith("0") && digits.length === 11
      ? `234${digits.slice(1)}`
      : digits;

  const waHref = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(
        "Hi Printiful, I'm interested in the Small Business Special Offer Package (Poly mailers + Thank you cards + 2 custom tees for ₦55,000). Please share more details!",
      )}`
    : `mailto:${settings?.contact_email || "hello@printifulbrand.com"}?subject=${encodeURIComponent(
        "Small Business Package Inquiry",
      )}`;

  const bundleItems = [
    {
      title: "100× Branded Poly Mailers",
      qty: "100 pcs",
      desc: "Waterproof, self-sealing courier bags custom printed with your logo & contact details.",
      image: "/assets/Image/poly-bag.jpg",
      tag: "Packaging Ready",
    },
    {
      title: "100× A6 Thank You Cards",
      qty: "100 pcs",
      desc: "Thick 350 GSM luxury unboxing cards to wow your customers and drive repeat orders.",
      image: "/assets/Image/thank-you-cards.jpg",
      tag: "Unboxing Magic",
    },
    {
      title: "2× Custom Printed Tees",
      qty: "2 tees",
      desc: "Heavyweight 100% cotton in your choice of colors, custom branded for you and your team.",
      image: "/assets/Image/tee-shirt.jpg",
      tag: "Brand Apparel",
    },
  ];

  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-to-b from-surface via-surface-alt/60 to-surface py-20 sm:py-24">
      {/* Background glow ambiance */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 40%, rgba(83,0,155,0.2), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(245,197,24,0.12), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          {/* Special Offer Pill */}
          <div className="inline-flex items-center gap-2 border border-brand-yellow/40 bg-brand-yellow/15 px-3.5 py-1.5 backdrop-blur-sm text-brand-black dark:text-brand-yellow">
            <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span className="font-ui text-[11px] font-black uppercase tracking-[0.2em]">
              Special Offer · Small Business Starter Kit
            </span>
          </div>

          <h2 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl">
            Starting a Brand? Scale with Confidence
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg leading-relaxed">
            Stop overpaying for separate packaging, print runs, and apparel. We curated
            the ultimate all-in-one starter bundle specifically for small business owners,
            fashion brands, and online store founders.
          </p>
        </Reveal>

        {/* ── BUNDLE CARDS GRID ── */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {bundleItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <div className="group relative flex h-full flex-col overflow-hidden border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-purple/60 hover:shadow-xl dark:hover:border-brand-yellow/60">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    fillCover
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-brand-black/85 backdrop-blur-sm px-2.5 py-1 text-white text-[10px] font-ui font-bold uppercase tracking-wider">
                    {item.tag}
                  </div>
                  <div className="absolute top-3 right-3 bg-brand-purple px-2.5 py-1 text-white text-[10px] font-ui font-black uppercase tracking-wider dark:bg-brand-yellow dark:text-brand-black">
                    {item.qty}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-purple dark:text-brand-yellow">
                    <CheckCircle2 size={14} />
                    <span>Included in Bundle</span>
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-bold">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-ui text-xs text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── SPECIAL OFFER CALLOUT & PRICING BOX ── */}
        <Reveal delay={0.2} className="mt-10">
          <div className="relative overflow-hidden border-2 border-brand-purple/40 bg-gradient-to-r from-brand-purple/10 via-surface to-brand-yellow/10 p-6 sm:p-8 dark:border-brand-yellow/30">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-yellow">
                  <Sparkles size={16} /> Complete Founder Bundle
                </div>
                <h3 className="font-heading text-2xl font-black uppercase sm:text-3xl">
                  {pkg.title}
                </h3>
                <p className="max-w-xl text-sm text-muted">
                  Everything included in one seamless order: 100 custom poly mailers, 100 thank
                  you cards, and 2 customized tees with your logo. No setup fees, zero hidden costs.
                </p>

                {/* Micro reassurance badges */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-foreground lg:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-brand-purple dark:text-brand-yellow" />
                    Free 3D Digital Mockup
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Truck size={14} className="text-brand-purple dark:text-brand-yellow" />
                    Nationwide Delivery
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HeartHandshake size={14} className="text-brand-purple dark:text-brand-yellow" />
                    Dedicated Small Business Support
                  </span>
                </div>
              </div>

              {/* Price & Action button */}
              <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row lg:flex-col lg:items-end">
                <div className="text-center lg:text-right">
                  <span className="font-ui text-xs font-bold uppercase tracking-wider text-muted line-through">
                    Est. Value: ₦75,000.00
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-center gap-1 lg:justify-end">
                    <span className="font-heading text-3xl sm:text-4xl font-black text-brand-purple dark:text-brand-yellow">
                      {formatNaira(pkg.price)}
                    </span>
                    <span className="font-ui text-xs font-bold text-muted uppercase">
                      / package
                    </span>
                  </div>
                  <span className="inline-block rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-ui text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Special Offer · Save ₦20,000+
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <Link
                    href="/packages/small-business"
                    className="inline-flex items-center gap-2 bg-brand-purple px-7 py-3.5 font-ui text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-yellow hover:text-brand-black dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white shadow-lg"
                  >
                    Claim Special Offer <ArrowRight size={16} />
                  </Link>

                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-border bg-surface px-4 py-3.5 font-ui text-xs font-semibold text-foreground transition hover:border-brand-purple hover:text-brand-purple dark:hover:border-brand-yellow dark:hover:text-brand-yellow"
                  >
                    <MessageSquare size={14} /> WhatsApp Inquiry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
