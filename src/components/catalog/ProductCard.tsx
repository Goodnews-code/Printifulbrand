"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  parseProductColor,
  productHasColorOptions,
} from "@/lib/product-color";
import { formatNaira, normalizeCategory, cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";

interface ProductCardProps {
  product: Product;
  mode: "showcase" | "shop";
}

export function ProductCard({ product, mode }: ProductCardProps) {
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const showColors = productHasColorOptions(product.images);
  const configuredSizes = product.sizes?.length ? product.sizes : [];
  const showSizes = configuredSizes.length > 0;

  const images = showColors
    ? product.images!
    : product.image_url
      ? [{ image_url: product.image_url, color_code: "Default|#111111" }]
      : product.images?.length
        ? product.images
        : [{ image_url: "/assets/tshirt_base.svg", color_code: "Default|#111111" }];

  const sizes = showSizes
    ? configuredSizes
    : [{ size_name: "One Size", price: product.price }];

  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const activeImage = images[Math.min(colorIdx, images.length - 1)];
  const activeSize = sizes[Math.min(sizeIdx, sizes.length - 1)];
  const price = activeSize?.price ?? product.price;
  const activeColor = parseProductColor(activeImage.color_code);

  const categoryLabel = useMemo(() => {
    const slug = normalizeCategory(product.category);
    return slug === "all" ? product.category || "Merch" : slug;
  }, [product.category]);

  const handleAdd = () => {
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

  if (mode === "showcase") {
    return (
      <motion.div
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/store"
          className="group block overflow-hidden border border-border bg-card transition-colors hover:border-brand-purple dark:hover:border-brand-yellow"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-surface-alt">
            <SmartImage
              src={activeImage.image_url}
              alt={product.title}
              fillCover
              className="transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            />
          </div>
          <div className="space-y-1 p-4">
            <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {categoryLabel}
            </p>
            <h3 className="font-heading text-xl font-semibold leading-tight">
              {product.title}
            </h3>
            <p className="font-ui text-sm font-semibold text-brand-purple dark:text-brand-yellow">
              {formatNaira(product.price)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article
      className="flex flex-col overflow-hidden border border-border bg-card"
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-alt">
        <SmartImage
          src={activeImage.image_url}
          alt={product.title}
          fillCover
          className="transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {categoryLabel}
          </p>
          <h3 className="mt-1 font-heading text-xl font-semibold leading-tight">
            {product.title}
          </h3>
          <p className="mt-1 font-ui text-sm font-semibold">
            {formatNaira(price)}
          </p>
        </div>

        {showColors && (
          <label className="block space-y-1.5">
            <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
              Color
            </span>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: activeColor.hex }}
              />
              <select
                value={String(colorIdx)}
                onChange={(e) => setColorIdx(Number(e.target.value))}
                className="w-full border border-border bg-surface px-3 py-2 font-ui text-sm text-foreground outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
                aria-label="Select color"
              >
                {images.map((img, i) => {
                  const color = parseProductColor(img.color_code);
                  return (
                    <option key={`${img.image_url}-${i}`} value={i}>
                      {color.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </label>
        )}

        {showSizes && (
          <label className="block space-y-1.5">
            <span className="font-ui text-[11px] font-semibold uppercase tracking-wider text-muted">
              Size
            </span>
            <select
              value={String(sizeIdx)}
              onChange={(e) => setSizeIdx(Number(e.target.value))}
              className="w-full border border-border bg-surface px-3 py-2 font-ui text-sm text-foreground outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
              aria-label="Select size"
            >
              {sizes.map((size, i) => (
                <option key={size.size_name} value={i}>
                  {size.size_name}
                </option>
              ))}
            </select>
          </label>
        )}

        <motion.button
          type="button"
          onClick={handleAdd}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className={cn(
            "mt-auto inline-flex w-full items-center justify-center gap-2 py-3 font-ui text-sm font-semibold text-white transition-colors",
            added
              ? "no-hover bg-brand-purple dark:bg-brand-yellow dark:text-brand-black"
              : "bg-brand-black hover:bg-brand-purple dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white",
          )}
        >
          <ShoppingBag size={16} />
          {added ? "Added!" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.article>
  );
}
