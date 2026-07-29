"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatNaira, normalizeCategory, cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";

interface ProductCardProps {
  product: Product;
  mode: "showcase" | "shop";
}

export function ProductCard({ product, mode }: ProductCardProps) {
  const { addItem } = useCart();
  const images = product.images?.length
    ? product.images
    : product.image_url
      ? [{ image_url: product.image_url, color_code: "#111111" }]
      : [{ image_url: "/assets/tshirt_base.svg", color_code: "#111111" }];

  const sizes = product.sizes?.length
    ? product.sizes
    : [{ size_name: "One Size", price: product.price }];

  const [colorIdx, setColorIdx] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);

  const activeImage = images[Math.min(colorIdx, images.length - 1)];
  const activeSize = sizes[Math.min(sizeIdx, sizes.length - 1)];
  const price = activeSize?.price ?? product.price;

  const categoryLabel = useMemo(() => {
    const slug = normalizeCategory(product.category);
    return slug === "all" ? product.category || "Merch" : slug;
  }, [product.category]);

  if (mode === "showcase") {
    return (
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
    );
  }

  return (
    <article className="flex flex-col overflow-hidden border border-border bg-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-alt">
        <SmartImage
          src={activeImage.image_url}
          alt={product.title}
          fillCover
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

        {images.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <button
                key={`${img.image_url}-${i}`}
                type="button"
                onClick={() => setColorIdx(i)}
                className={cn(
                  "size-6 rounded-full border-2",
                  colorIdx === i
                    ? "border-brand-purple dark:border-brand-yellow"
                    : "border-transparent ring-1 ring-border",
                )}
                style={{ backgroundColor: img.color_code || "#ccc" }}
                aria-label={`Color ${img.color_code}`}
              />
            ))}
          </div>
        )}

        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, i) => (
              <button
                key={size.size_name}
                type="button"
                onClick={() => setSizeIdx(i)}
                className={cn(
                  "min-w-10 border px-2.5 py-1 font-ui text-xs font-medium transition-colors",
                  sizeIdx === i
                    ? "border-brand-purple bg-brand-purple text-white dark:border-brand-yellow dark:bg-brand-yellow dark:text-brand-black"
                    : "border-border text-foreground hover:border-brand-purple dark:hover:border-brand-yellow",
                )}
              >
                {size.size_name}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.title,
              category: product.category || "Merch",
              color: activeImage.color_code || "Default",
              size: activeSize.size_name,
              image: activeImage.image_url,
              price,
            })
          }
          className="mt-auto inline-flex w-full items-center justify-center gap-2 bg-brand-black py-3 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-purple dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
