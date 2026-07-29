"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { Hero } from "@/components/home/Hero";
import { BrandValues } from "@/components/home/BrandValues";
import { Timeline } from "@/components/home/Timeline";
import { InquiryForm } from "@/components/home/InquiryForm";
import { CareGuide } from "@/components/home/CareGuide";
import { ProductGrid } from "@/components/catalog/ProductGrid";

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
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-block bg-brand-purple px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Pre-Designed Collection
          </span>
          <h2 className="mt-4 font-heading text-4xl italic sm:text-5xl">
            Work Showcase
          </h2>
          <p className="mt-4 text-muted">
            Curated pieces designed by our studio.
          </p>
        </div>

        {loading ? (
          <p className="py-16 text-center font-ui text-muted">Loading…</p>
        ) : (
          <ProductGrid products={products} mode="showcase" />
        )}

        <div className="mt-12 text-center">
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
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandValues />
      <ShowcaseCatalog />
      <Timeline />
      <InquiryForm />
      <CareGuide />
    </>
  );
}
