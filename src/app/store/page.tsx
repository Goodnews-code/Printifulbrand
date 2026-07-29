"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { FadeIn } from "@/components/motion/Reveal";

export default function StorePage() {
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
    <>
      <section className="relative overflow-hidden bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-50 animate-pulse-soft"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 0%, rgba(83,0,155,0.45), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <FadeIn>
            <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Catalog Store
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Shop Printiful
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-4 max-w-xl text-white/70">
              Search, filter, and add premium custom merch to your cart — priced
              in ₦ NGN.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
            products={products}
            mode="shop"
            showSearch
            showSort
            emptyMessage="No products in this category yet."
          />
        )}
      </section>
    </>
  );
}
