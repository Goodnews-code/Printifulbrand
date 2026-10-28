"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import type { Product, ProductReviewSummary } from "@/types";
import { Hero } from "@/components/home/Hero";
import { BrandValues } from "@/components/home/BrandValues";
import { Testimonials } from "@/components/home/Testimonials";
import { Timeline } from "@/components/home/Timeline";
import { CareGuide } from "@/components/home/CareGuide";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { PastProjectsGallery } from "@/components/gallery/PastProjectsGallery";
import { Reveal } from "@/components/motion/Reveal";
import { MobileHandHint } from "@/components/motion/MobileHandHint";
import { PackagePromoStrip } from "@/components/home/PackagePromoStrip";

function ShowcaseCatalog({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  return (
    <section id="catalog" className="scroll-mt-20 border-t border-border bg-surface-alt py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-brand-purple px-3 py-1 text-white">
            <Sparkles size={13} className="text-brand-yellow" />
            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.16em]">
              Pre-Designed Collection
            </span>
          </div>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Brand Merch Showcase
          </h2>
          <p className="mt-4 text-muted">
            Curated pieces and signature styles designed by our studio. Click any product to
            inquire about custom production for your brand.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-border bg-surface"
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
            products={products}
            mode="showcase"
            limit={4}
            mobileLimit={2}
            tabletLimit={3}
          />
        )}

        <Reveal className="mt-10 text-center" delay={0.1}>
          <p className="text-xs text-muted">
            Want to produce your brand&apos;s custom design or logo on any item?{" "}
            <Link
              href="/store?tab=custom"
              className="font-semibold text-brand-purple underline underline-offset-4 hover:text-brand-yellow dark:text-brand-yellow dark:hover:text-white"
            >
              Visit our Custom Design Studio →
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ReadyToOrderSection({
  products,
  totalCount,
  loading,
  reviewSummaries,
  onReviewSummaryChange,
}: {
  products: Product[];
  totalCount: number;
  loading: boolean;
  reviewSummaries: Record<number, ProductReviewSummary>;
  onReviewSummaryChange: (summary: ProductReviewSummary) => void;
}) {
  return (
    <section id="ready-to-order" className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag size={13} />
            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.16em]">
              Instant Checkout · In-Stock
            </span>
          </div>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Ready-to-Order Catalogue
          </h2>
          <p className="mt-4 text-muted">
            In-stock merchandise available for direct purchase. Select your
            size and color, add to cart, and checkout in seconds.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-border bg-surface-alt"
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
            products={products}
            mode="shop"
            limit={4}
            mobileLimit={2}
            tabletLimit={3}
            reviewSummaries={reviewSummaries}
            onReviewSummaryChange={onReviewSummaryChange}
          />
        )}

        <Reveal className="mt-12 text-center" delay={0.1}>
          <p className="text-sm text-muted">
            Looking for more sizes, colors, and the full inventory?
          </p>
          <Link
            href="/store?tab=ready"
            className="mt-4 inline-flex items-center gap-2 bg-brand-purple px-6 py-3.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-yellow hover:text-brand-black dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white"
          >
            Explore Complete Ready-to-Order Store ({totalCount} items) <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function PastProjectsSection() {
  return (
    <section
      id="past-projects"
      className="scroll-mt-20 border-t border-border bg-surface py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-block bg-brand-purple/10 px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-brand-purple dark:bg-brand-yellow/10 dark:text-brand-yellow">
            Portfolio Proof
          </span>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Past Projects
          </h2>
          <p className="mt-4 text-muted">
            A visual showcase of finished client branding, corporate merchandise packages,
            event apparel, and customized products delivered across Nigeria.
          </p>
        </Reveal>

        <PastProjectsGallery />
      </div>
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSummaries, setReviewSummaries] = useState<
    Record<number, ProductReviewSummary>
  >({});

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

  const showcaseProducts = products.filter(
    (p) => (p.section || "showcase") === "showcase",
  );
  const readyProducts = products.filter((p) => p.section === "ready");
  const displayReadyProducts = readyProducts.length > 0 ? readyProducts : products;

  return (
    <>
      <MobileHandHint />
      <Hero />
      <BrandValues />
      <ReadyToOrderSection
        products={displayReadyProducts}
        totalCount={displayReadyProducts.length}
        loading={loading}
        reviewSummaries={reviewSummaries}
        onReviewSummaryChange={(summary) =>
          setReviewSummaries((prev) => ({
            ...prev,
            [summary.product_id]: summary,
          }))
        }
      />
      <ShowcaseCatalog
        products={showcaseProducts.length > 0 ? showcaseProducts : products}
        loading={loading}
      />
      <PastProjectsSection />
      <Testimonials />
      <Timeline />
      <CareGuide />
      <PackagePromoStrip />
    </>
  );
}
