"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { Hero } from "@/components/home/Hero";
import { BrandValues } from "@/components/home/BrandValues";
import { Testimonials } from "@/components/home/Testimonials";
import { Timeline } from "@/components/home/Timeline";
import { InquiryForm } from "@/components/home/InquiryForm";
import { CareGuide } from "@/components/home/CareGuide";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Reveal } from "@/components/motion/Reveal";
import { MobileHandHint } from "@/components/motion/MobileHandHint";
import { PackagePromoStrip } from "@/components/home/PackagePromoStrip";

function ShowcaseCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="catalog" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-block bg-brand-purple px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Pre-Designed Collection
          </span>
          <h2 className="mt-4 font-heading text-4xl italic sm:text-5xl">
            Work Showcase
          </h2>
          <p className="mt-4 text-muted">
            Curated pieces designed by our studio.
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
          <ProductGrid products={products} mode="showcase" mobileLimit={6} />
        )}

        <Reveal className="mt-12 text-center" delay={0.1}>
          <p className="text-sm text-muted">
            Want to check sizing, sort pricing, or search the full product
            archive?
          </p>
          <Link
            href="/store"
            className="mt-4 inline-flex border border-brand-purple px-6 py-3 font-ui text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple hover:text-white dark:border-brand-yellow dark:text-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-black"
          >
            Enter Catalog Store
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <MobileHandHint />
      <Hero />
      <BrandValues />
      <ShowcaseCatalog />
      <Testimonials />
      <Timeline />
      <InquiryForm />
      <CareGuide />
      <PackagePromoStrip />
    </>
  );
}
