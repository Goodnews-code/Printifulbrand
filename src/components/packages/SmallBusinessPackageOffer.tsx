"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils";
import {
  SMALL_BUSINESS_PACKAGE_PRICE,
  SMALL_BUSINESS_PACKAGE_TITLE,
  isSmallBusinessPackageTitle,
} from "@/lib/packages";
import type { Product } from "@/types";

export function SmallBusinessPackageOffer() {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tee1Color, setTee1Color] = useState("");
  const [tee2Color, setTee2Color] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products");
        const data = (await res.json()) as Product[];
        if (cancelled) return;
        const match = Array.isArray(data)
          ? data.find((p) => isSmallBusinessPackageTitle(p.title) && Boolean(p.is_active))
          : null;
        setProduct(match || null);
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setAdded(false);

    const c1 = tee1Color.trim();
    const c2 = tee2Color.trim();
    if (!c1 || !c2) {
      setError("Please choose a color for both tees.");
      return;
    }
    if (!product) {
      setError("Package unavailable — contact shopprintiful@gmail.com");
      return;
    }

    const image =
      product.images?.find((img) => img.is_primary)?.image_url ||
      product.images?.[0]?.image_url ||
      product.image_url ||
      "/assets/Image/Customized nylon.jpeg";

    addItem({
      productId: product.id,
      name: product.title || SMALL_BUSINESS_PACKAGE_TITLE,
      category: product.category || "Brand Packaging",
      price: Number(product.price) || SMALL_BUSINESS_PACKAGE_PRICE,
      image,
      color: `Tee1: ${c1} · Tee2: ${c2}`,
      size: "Package",
    });
    setAdded(true);
  }

  const price = product ? Number(product.price) || SMALL_BUSINESS_PACKAGE_PRICE : SMALL_BUSINESS_PACKAGE_PRICE;

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Tee 1 color
            </span>
            <input
              type="text"
              value={tee1Color}
              onChange={(e) => setTee1Color(e.target.value)}
              placeholder="e.g. Black"
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none ring-brand-purple/30 focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Tee 2 color
            </span>
            <input
              type="text"
              value={tee2Color}
              onChange={(e) => setTee2Color(e.target.value)}
              placeholder="e.g. White"
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none ring-brand-purple/30 focus:ring-2"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {added ? (
          <p className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 px-4 py-3 text-sm text-foreground">
            Package added to your cart.{" "}
            <Link href="/store" className="font-semibold text-brand-purple underline-offset-2 hover:underline">
              Continue to store
            </Link>{" "}
            or checkout from the cart.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !product}
          className="w-full rounded-full bg-brand-yellow px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-black transition hover:bg-[color:var(--hover-on-white)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Loading package…"
            : !product
              ? "Package unavailable"
              : `Get the package — ${formatNaira(price)}`}
        </button>

        {!loading && !product ? (
          <p className="text-center text-sm text-muted">
            Package unavailable — contact{" "}
            <a href="mailto:shopprintiful@gmail.com" className="text-brand-purple underline-offset-2 hover:underline">
              shopprintiful@gmail.com
            </a>
          </p>
        ) : null}
      </form>
    </div>
  );
}
