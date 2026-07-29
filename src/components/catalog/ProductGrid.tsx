"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/types";
import { CATEGORY_FILTERS, normalizeCategory, cn } from "@/lib/utils";
import { ProductCard } from "@/components/catalog/ProductCard";

interface ProductGridProps {
  products: Product[];
  mode: "showcase" | "shop";
  showSearch?: boolean;
  showSort?: boolean;
  emptyMessage?: string;
}

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export function ProductGrid({
  products,
  mode,
  showSearch = false,
  showSort = false,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  const [filter, setFilter] = useState<(typeof CATEGORY_FILTERS)[number]["id"]>(
    "all",
  );
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
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
      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {CATEGORY_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "px-3.5 py-2 font-ui text-xs font-semibold uppercase tracking-wide transition-colors",
              filter === item.id
                ? "bg-brand-purple text-white dark:bg-brand-yellow dark:text-brand-black"
                : "border border-border text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

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
              className="border border-border bg-surface px-3 py-2.5 font-ui text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} mode={mode} />
          ))}
        </div>
      )}
    </div>
  );
}
