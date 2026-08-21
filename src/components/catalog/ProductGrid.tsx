"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Product, ProductReviewSummary } from "@/types";
import { CATEGORY_FILTERS, normalizeCategory, cn } from "@/lib/utils";
import { isPackageOnlyProduct } from "@/lib/packages";
import { ProductCard } from "@/components/catalog/ProductCard";

interface ProductGridProps {
  products: Product[];
  mode: "showcase" | "shop";
  showSearch?: boolean;
  showSort?: boolean;
  emptyMessage?: string;
  /** Hide items beyond this count below the `md` breakpoint */
  mobileLimit?: number;
  reviewSummaries?: Record<number, ProductReviewSummary>;
  onReviewSummaryChange?: (summary: ProductReviewSummary) => void;
}

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductGrid({
  products,
  mode,
  showSearch = false,
  showSort = false,
  emptyMessage = "No products found.",
  mobileLimit,
  reviewSummaries,
  onReviewSummaryChange,
}: ProductGridProps) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<(typeof CATEGORY_FILTERS)[number]["id"]>(
    "all",
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (isPackageOnlyProduct(p.title)) return false;
      const cat = normalizeCategory(p.category);
      const matchesFilter = filter === "all" || cat === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [products, filter, query, sort]);

  return (
    <div>
      <motion.div
        className="mb-8 flex flex-wrap items-center justify-center gap-2"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {CATEGORY_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "px-3.5 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-transform active:scale-95",
              filter === item.id
                ? "no-hover bg-brand-purple text-white dark:bg-brand-yellow dark:text-brand-black"
                : "border border-border text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      {(showSearch || showSort) && (
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {showSearch && (
            <label className="relative w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-border bg-surface py-2.5 pl-10 pr-3 font-sans text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
              />
            </label>
          )}
          {showSort && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-border bg-surface px-3 py-2.5 font-ui text-sm text-foreground outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center font-ui text-muted">{emptyMessage}</p>
      ) : (
        <motion.div
          key={`${filter}-${query}-${sort}`}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: reduce ? 0 : 0.1 },
            },
          }}
        >
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              className={cn(
                mobileLimit != null &&
                  index >= mobileLimit &&
                  "max-md:hidden",
              )}
              variants={{
                hidden: reduce
                  ? { opacity: 1 }
                  : { opacity: 0, y: 24, scale: 0.98 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.55, ease: EASE },
                },
              }}
            >
              <ProductCard
                product={product}
                mode={mode}
                reviewSummary={reviewSummaries?.[product.id]}
                onReviewSummaryChange={onReviewSummaryChange}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
