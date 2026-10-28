"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  MessageSquare,
  CheckCircle2,
  Layers,
  ArrowRight,
  FileCheck,
  PackageCheck,
} from "lucide-react";
import type { Product, ProductReviewSummary } from "@/types";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { FadeIn, Reveal } from "@/components/motion/Reveal";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

function StoreLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse bg-surface-alt" />
      <div className="mt-4 h-5 w-96 animate-pulse bg-surface-alt" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse border border-border bg-surface-alt">
            <div className="aspect-[4/5] bg-border/60" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-16 bg-border" />
              <div className="h-5 w-3/4 bg-border" />
              <div className="h-4 w-20 bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreContent() {
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "custom" ? "custom" : "ready";
  const [activeTab, setActiveTab] = useState<"ready" | "custom">(initialTab);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSummaries, setReviewSummaries] = useState<
    Record<number, ProductReviewSummary>
  >({});

  const rawPhone = settings?.whatsapp_number || settings?.contact_phone || "";
  const digits = rawPhone.replace(/\D/g, "");
  const waPhone =
    digits.startsWith("0") && digits.length === 11
      ? `234${digits.slice(1)}`
      : digits;

  const handleTabChange = (tab: "ready" | "custom") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/reviews").then((r) => r.json()),
    ])
      .then(([productData, summaryData]) => {
        setProducts(Array.isArray(productData) ? productData : []);
        if (Array.isArray(summaryData)) {
          const map: Record<number, ProductReviewSummary> = {};
          for (const item of summaryData as ProductReviewSummary[]) {
            map[item.product_id] = item;
          }
          setReviewSummaries(map);
        }
      })
      .catch(() => {
        setProducts([]);
        setReviewSummaries({});
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter ready-to-order products
  const readyProducts = useMemo(() => {
    const tagged = products.filter((p) => p.section === "ready");
    return tagged.length > 0 ? tagged : products;
  }, [products]);

  const customOrderWhatsAppUrl = useMemo(() => {
    const message = [
      `*CUSTOM BRANDED ORDER INQUIRY — PRINTIFUL STUDIO*`,
      ``,
      `Hello Printiful Studio! 🎨`,
      `I want to get a custom branded order for my brand / project.`,
      ``,
      `I'd like to discuss products, print techniques (DTG / Embroidery / Screen Print), pricing, and share my artwork for a digital mockup.`,
    ].join("\n");

    if (!waPhone) {
      return `mailto:${settings?.contact_email || "hello@printifulbrand.com"}?subject=${encodeURIComponent(
        "Custom Branded Order Inquiry — Printiful Studio",
      )}&body=${encodeURIComponent(message)}`;
    }

    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  }, [waPhone, settings?.contact_email]);

  return (
    <>
      {/* ── TOP SECTION MODE SELECTOR / TABS ─────────────────────── */}
      <section className="border-b border-border bg-surface sticky top-16 z-30 shadow-sm backdrop-blur-md bg-surface/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-ui text-xs font-semibold text-muted uppercase tracking-wider hidden sm:inline">
              Store Mode:
            </span>
            <div className="inline-flex rounded-lg border border-border bg-surface-alt p-1">
              <button
                type="button"
                onClick={() => handleTabChange("ready")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 font-ui text-xs sm:text-sm font-bold transition-all",
                  activeTab === "ready"
                    ? "bg-brand-purple text-white shadow dark:bg-brand-yellow dark:text-brand-black"
                    : "text-muted hover:text-foreground",
                )}
              >
                <ShoppingBag size={15} />
                <span>Ready to Order</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activeTab === "ready"
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-brand-black"
                      : "bg-border text-muted",
                  )}
                >
                  {readyProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("custom")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 font-ui text-xs sm:text-sm font-bold transition-all",
                  activeTab === "custom"
                    ? "bg-brand-purple text-white shadow dark:bg-brand-yellow dark:text-brand-black"
                    : "text-muted hover:text-foreground",
                )}
              >
                <Sparkles size={15} />
                <span>Order with Custom Design</span>
                <span
                  className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    activeTab === "custom"
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-brand-black"
                      : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
                  )}
                >
                  WhatsApp
                </span>
              </button>
            </div>
          </div>

          <div className="text-right">
            {activeTab === "ready" ? (
              <span className="font-ui text-xs text-muted hidden md:inline">
                Instant Add to Cart • No Minimums
              </span>
            ) : (
              <span className="font-ui text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden md:inline-flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Direct WhatsApp Studio Desk
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── MODE 1: READY TO ORDER STORE CATALOG ──────────────────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === "ready" && (
        <>
          {/* ── HEADER BANNER ── */}
          <section className="relative overflow-hidden bg-brand-black px-4 py-14 text-white sm:px-6 lg:px-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-50 animate-pulse-soft"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 0%, rgba(83,0,155,0.45), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(83,0,155,0.25), transparent 55%)",
              }}
            />
            <div className="relative mx-auto max-w-7xl">
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 backdrop-blur-sm">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <p className="font-ui text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                    Ready to Order · In-Stock
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
                  Ready-to-Order Catalogue
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg leading-relaxed">
                  Browse our in-stock, studio-crafted apparel, caps, and lifestyle merchandise ready
                  for direct purchase. Choose your size and color, add to cart, and enjoy fast
                  doorstep delivery across Nigeria.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-brand-yellow" /> Fast Nationwide Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-brand-yellow" /> 100% Studio Quality
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag size={15} className="text-brand-yellow" /> Instant Checkout · Zero MOQ
                  </span>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── READY-TO-ORDER PRODUCT GRID ── */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-heading text-2xl font-black uppercase tracking-tight sm:text-3xl">
                  In-Stock Ready-to-Order Items
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Select sizes and colors to add directly to cart.
                </p>
              </div>
              <p className="font-ui text-xs text-muted">
                Showing {readyProducts.length} items
              </p>
            </Reveal>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse border border-border bg-surface-alt"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="aspect-[4/5] bg-border/60" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-16 bg-border" />
                      <div className="h-5 w-3/4 bg-border" />
                      <div className="h-4 w-20 bg-border" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid
                products={readyProducts}
                mode="shop"
                showSearch
                showSort
                emptyMessage="No ready-to-order products available matching your search."
                reviewSummaries={reviewSummaries}
                onReviewSummaryChange={(summary) =>
                  setReviewSummaries((prev) => ({
                    ...prev,
                    [summary.product_id]: summary,
                  }))
                }
              />
            )}

            {/* ── SEPARATION CALLOUT: JUMP TO CUSTOM DESIGN ── */}
            <div className="mt-16 border border-border bg-gradient-to-r from-brand-purple/10 via-surface to-emerald-500/10 p-6 sm:p-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="space-y-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Sparkles size={16} />
                    <span className="font-ui text-xs font-bold uppercase tracking-wider">
                      Need Bespoke Merchandise?
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase sm:text-2xl">
                    Order with Custom Design for Any Product
                  </h3>
                  <p className="max-w-xl text-sm text-muted">
                    Looking to print your company logo, team crest, or custom artwork on tees,
                    hoodies, caps, mugs, and journals? Chat directly with us on WhatsApp for instant pricing, material advice, and free digital 3D mockups.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={customOrderWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 bg-emerald-600 px-6 py-3.5 font-ui text-xs font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500 shadow-md"
                  >
                    <MessageSquare size={16} /> Get Custom Order on WhatsApp <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ── MODE 2: ORDER WITH CUSTOM DESIGN (DIRECT WHATSAPP) ────── */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === "custom" && (
        <>
          {/* ── CUSTOM DESIGN HEADER BANNER ── */}
          <section className="relative overflow-hidden bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-40 animate-pulse-soft"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 80% 0%, rgba(16,185,129,0.3), transparent 50%), radial-gradient(ellipse at 20% 100%, rgba(83,0,155,0.4), transparent 50%)",
              }}
            />
            <div className="relative mx-auto max-w-7xl text-center sm:text-left">
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 backdrop-blur-sm text-emerald-400">
                  <Sparkles size={13} />
                  <p className="font-ui text-[11px] font-bold uppercase tracking-[0.2em]">
                    Bespoke Branding Studio · Direct WhatsApp Desk
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
                  Order with Custom Design
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg leading-relaxed">
                  Turn ANY product into your brand&apos;s signature merchandise. We print and embroider
                  with studio-grade accuracy using Direct-to-Garment (DTG), 3D high-density embroidery,
                  and silk screen printing. From individual prototypes to thousands of corporate units.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-6 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-400" /> Free 3D Digital Mockup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers size={15} className="text-emerald-400" /> Multi-Placement Printing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PackageCheck size={15} className="text-emerald-400" /> Quality Finishing & Labeling
                  </span>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ── BOLD DIRECT-TO-WHATSAPP CUSTOM ORDER SECTION ── */}
          <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-surface via-surface to-emerald-950/15 p-8 sm:p-12 lg:p-16 shadow-2xl">
              {/* Ambient Glows */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-emerald-500/20 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-brand-purple/20 dark:bg-brand-yellow/15 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 font-ui text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  Studio Production Desk Active on WhatsApp
                </span>

                <h2 className="mt-6 font-heading text-3xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                  Get a Custom Order
                </h2>

                <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed">
                  Connect directly with our head of production on WhatsApp.
                  Share your artwork, tell us what you want to produce, and get instant pricing,
                  material advice, and a free digital 3D mockup before production begins.
                </p>

                {/* 4 Quick Value Highlights */}
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
                  <div className="rounded-xl border border-border bg-surface-alt/80 p-4 backdrop-blur-sm">
                    <span className="text-2xl">👕</span>
                    <p className="mt-2 font-heading text-sm font-bold uppercase">Any Product</p>
                    <p className="mt-1 font-ui text-xs text-muted">Tees, Hoodies, Caps, Bags, Mugs & Kits</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-alt/80 p-4 backdrop-blur-sm">
                    <span className="text-2xl">🎨</span>
                    <p className="mt-2 font-heading text-sm font-bold uppercase">Studio Quality</p>
                    <p className="mt-1 font-ui text-xs text-muted">DTG, 3D Embroidery & Silk Screen</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-alt/80 p-4 backdrop-blur-sm">
                    <span className="text-2xl">👁️</span>
                    <p className="mt-2 font-heading text-sm font-bold uppercase">Free 3D Mockup</p>
                    <p className="mt-1 font-ui text-xs text-muted">Visual preview before printing</p>
                  </div>

                  <div className="rounded-xl border border-border bg-surface-alt/80 p-4 backdrop-blur-sm">
                    <span className="text-2xl">🚚</span>
                    <p className="mt-2 font-heading text-sm font-bold uppercase">Fast Delivery</p>
                    <p className="mt-1 font-ui text-xs text-muted">Insured doorstep shipping nationwide</p>
                  </div>
                </div>

                {/* ── MASSIVE BOLD WHATSAPP ACTION BUTTON ── */}
                <div className="mt-10 flex flex-col items-center justify-center gap-3">
                  <a
                    href={customOrderWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-8 py-5 sm:px-12 sm:py-6 font-ui text-base sm:text-lg font-black uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_35px_rgba(37,211,102,0.45)]"
                  >
                    <MessageSquare size={24} className="transition-transform group-hover:scale-110" />
                    <span>Get a Custom Order on WhatsApp</span>
                    <ArrowRight size={22} className="transition-transform group-hover:translate-x-1.5" />
                  </a>

                  <p className="mt-2 font-ui text-xs text-muted">
                    ⚡ Instant reply • Send your logo or describe your idea • Zero minimum order requirement
                  </p>
                </div>
              </div>
            </div>

            {/* ── HOW CUSTOM ORDERING WORKS (4 STEPS) ── */}
            <div className="mt-20 border-t border-border pt-16">
              <Reveal className="mx-auto max-w-2xl text-center mb-12">
                <span className="inline-block bg-brand-purple/10 px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-brand-purple dark:bg-brand-yellow/10 dark:text-brand-yellow">
                  Simple Workflow
                </span>
                <h3 className="mt-3 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
                  How Custom Ordering Works
                </h3>
                <p className="mt-3 text-sm text-muted">
                  From initial idea to finished branded apparel delivered to your doorstep.
                </p>
              </Reveal>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "01",
                    title: "Connect on WhatsApp",
                    desc: "Click the WhatsApp button above to chat directly with our production studio team about your project.",
                    icon: MessageSquare,
                  },
                  {
                    step: "02",
                    title: "Share Your Artwork",
                    desc: "Send us your brand logo or graphic (PNG, PDF, AI, or SVG). Our graphics team inspects resolution & placement.",
                    icon: FileCheck,
                  },
                  {
                    step: "03",
                    title: "Approve Digital Mockup",
                    desc: "We generate a realistic 3D digital mockup of your product with exact placement and dimensions for your approval.",
                    icon: ShieldCheck,
                  },
                  {
                    step: "04",
                    title: "Production & Delivery",
                    desc: "We print, embroider, iron, package, and dispatch nationwide via insured courier to your location.",
                    icon: Truck,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="border border-border bg-surface p-6 relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-2xl font-black text-brand-purple/30 dark:text-brand-yellow/30">
                            {item.step}
                          </span>
                          <Icon size={20} className="text-brand-purple dark:text-brand-yellow" />
                        </div>
                        <h4 className="mt-4 font-heading text-lg font-bold">
                          {item.title}
                        </h4>
                        <p className="mt-2 font-ui text-xs text-muted leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<StoreLoadingSkeleton />}>
      <StoreContent />
    </Suspense>
  );
}
