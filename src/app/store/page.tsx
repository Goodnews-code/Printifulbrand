"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductGrid } from "@/components/catalog/ProductGrid";

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
    <SiteShell>
      <section className="relative overflow-hidden bg-brand-black px-4 py-16 text-white sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 0%, rgba(83,0,155,0.45), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-yellow">
            Catalog Store
          </p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Shop Printiful
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Search, filter, and add premium custom merch to your cart — priced
            in ₦ NGN.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {loading ? (
          <p className="py-16 text-center font-ui text-muted">
            Loading catalog…
          </p>
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
    </SiteShell>
  );
}
