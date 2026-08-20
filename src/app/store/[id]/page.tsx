"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  parseProductColor,
  productHasColorOptions,
} from "@/lib/product-color";
import { getCategoryAttributes } from "@/lib/product-attributes";
import { formatNaira, normalizeCategory, cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import { FadeIn } from "@/components/motion/Reveal";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const showColors = product ? productHasColorOptions(product.images) : false;
  const configuredSizes = product?.sizes?.length ? product.sizes : [];
  const showSizes = configuredSizes.length > 0;
  const sizeLabel = getCategoryAttributes(product?.category).sizeLabel;

  const images = useMemo(() => {
    if (!product) return [];
    if (showColors && product.images?.length) return product.images;
    if (product.image_url) {
      return [{ image_url: product.image_url, color_code: "Default|#111111" }];
    }
    if (product.images?.length) return product.images;
    return [{ image_url: "/assets/tshirt_base.svg", color_code: "Default|#111111" }];
  }, [product, showColors]);

  const sizes = useMemo(() => {
    if (!product) return [];
    if (showSizes) return configuredSizes;
    return [{ size_name: "One Size", price: product.price }];
  }, [product, showSizes, configuredSizes]);

  const activeImage = images[Math.min(colorIdx, Math.max(images.length - 1, 0))];
  const activeSize = sizes[Math.min(sizeIdx, Math.max(sizes.length - 1, 0))];
  const price = activeSize?.price ?? product?.price ?? 0;
  const activeColor = parseProductColor(activeImage?.color_code);

  const categoryLabel = useMemo(() => {
    if (!product) return "";
    const slug = normalizeCategory(product.category);
    return slug === "all" ? product.category || "Merch" : slug;
  }, [product]);

  const handleAdd = () => {
    if (!product || !activeImage || !activeSize) return;
    addItem({
      productId: product.id,
      name: product.title,
      category: product.category || "Merch",
      color: showColors ? activeColor.name : "—",
      size: showSizes ? activeSize.size_name : "One Size",
      image: activeImage.image_url,
      price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 bg-border" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] bg-border/60" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-border" />
              <div className="h-4 w-full bg-border" />
              <div className="h-4 w-5/6 bg-border" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !(product.is_active === 1 || product.is_active === true)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl">Product not found</h1>
        <Link
          href="/store"
          className="mt-6 inline-flex border border-brand-purple px-5 py-2.5 font-ui text-sm font-semibold text-brand-purple dark:border-brand-yellow dark:text-brand-yellow"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <FadeIn>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 font-ui text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>
      </FadeIn>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <FadeIn>
          <div className="relative aspect-[4/5] overflow-hidden border border-border bg-surface-alt">
            <SmartImage
              key={`${activeImage?.image_url}-${colorIdx}`}
              src={activeImage?.image_url || "/assets/tshirt_base.svg"}
              alt={product.title}
              fillCover
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {categoryLabel}
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            {product.title}
          </h1>
          <p className="mt-3 font-ui text-lg font-semibold text-brand-purple dark:text-brand-yellow">
            {formatNaira(price)}
          </p>
          {product.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
              {product.description}
            </p>
          )}

          <div className="mt-8 space-y-5">
            {showColors && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Color
                  </span>
                  <span className="font-ui text-xs">{activeColor.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => {
                    const color = parseProductColor(img.color_code);
                    const selected = colorIdx === i;
                    return (
                      <button
                        key={`${img.image_url}-${i}`}
                        type="button"
                        aria-label={color.name}
                        title={color.name}
                        onClick={() => setColorIdx(i)}
                        className={cn(
                          "size-9 shrink-0 rounded-full border-2 transition-transform",
                          selected
                            ? "scale-110 border-brand-purple ring-2 ring-brand-purple/30 dark:border-brand-yellow dark:ring-brand-yellow/30"
                            : "border-border hover:scale-105",
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {showSizes && (
              <label className="block space-y-2">
                <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {sizeLabel}
                </span>
                <select
                  value={String(sizeIdx)}
                  onChange={(e) => setSizeIdx(Number(e.target.value))}
                  className="w-full border border-border bg-surface px-3 py-2.5 font-ui text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
                >
                  {sizes.map((size, i) => (
                    <option key={size.size_name} value={i}>
                      {size.size_name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 py-3.5 font-ui text-sm font-semibold text-white transition-colors sm:w-auto sm:px-8",
                added
                  ? "bg-brand-purple dark:bg-brand-yellow dark:text-brand-black"
                  : "bg-brand-black hover:bg-brand-purple dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white",
              )}
            >
              <ShoppingBag size={16} />
              {added ? "Added!" : "Add to Cart"}
            </button>
          </div>
        </FadeIn>
      </div>

      <div className="mt-16">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
