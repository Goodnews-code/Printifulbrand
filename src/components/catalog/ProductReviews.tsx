"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { ProductReview } from "@/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

function Stars({
  value,
  onChange,
  size = 16,
  interactive = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const Comp = interactive ? "button" : "span";
        return (
          <Comp
            key={n}
            type={interactive ? "button" : undefined}
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? active && n === value : undefined}
            aria-label={interactive ? `${n} star${n === 1 ? "" : "s"}` : undefined}
            onClick={interactive ? () => onChange?.(n) : undefined}
            className={cn(
              interactive && "rounded p-0.5 transition-transform hover:scale-110",
            )}
          >
            <Star
              size={size}
              className={cn(
                active
                  ? "fill-brand-purple text-brand-purple dark:fill-brand-yellow dark:text-brand-yellow"
                  : "text-border",
              )}
            />
          </Comp>
        );
      })}
    </div>
  );
}

function formatReviewDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    );
  }, [reviews]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const author_name = name.trim();
    const body = comment.trim();
    if (!author_name || body.length < 3) {
      setError("Please enter your name and a short comment.");
      return;
    }

    setSubmitting(true);
    const optimistic: ProductReview = {
      id: -Date.now(),
      product_id: productId,
      author_name,
      comment: body,
      rating,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [optimistic, ...prev]);
    setName("");
    setComment("");
    setRating(5);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name, comment: body, rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== optimistic.id));
        setError(data.error || "Could not post review.");
        return;
      }
      setReviews((prev) =>
        prev.map((r) => (r.id === optimistic.id ? (data as ProductReview) : r)),
      );
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== optimistic.id));
      setError("Could not post review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="scroll-mt-24 border-t border-border pt-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-brand-purple dark:text-brand-yellow">
              Customer Reviews
            </p>
            <h2 className="mt-2 font-heading text-3xl italic sm:text-4xl">
              How this product helped you
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Stars value={Math.round(average)} size={18} />
              <span className="font-ui text-sm text-muted">
                {average.toFixed(1)} · {reviews.length} review
                {reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      </Reveal>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 border border-border bg-surface p-5 sm:p-6"
      >
        <p className="font-ui text-sm font-semibold">Leave a review</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">
            Rating
          </span>
          <Stars value={rating} onChange={setRating} interactive size={20} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-1">
            <span className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">
              Your name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              placeholder="e.g. Ada"
              className="w-full border border-border bg-surface-alt px-3 py-2.5 font-ui text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="font-ui text-xs font-semibold uppercase tracking-wider text-muted">
            Your comment
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            required
            rows={4}
            placeholder="How has this product benefited you?"
            className="w-full resize-y border border-border bg-surface-alt px-3 py-2.5 font-ui text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
          />
        </label>
        {error && <p className="font-ui text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-black px-5 py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-purple disabled:opacity-60 dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-brand-purple dark:hover:text-white"
        >
          {submitting ? "Posting…" : "Post review"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-muted">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted">
            No reviews yet. Be the first to share how this product helped you.
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-heading text-lg font-semibold">
                    {review.author_name}
                  </p>
                  <p className="font-ui text-xs text-muted">
                    {formatReviewDate(review.created_at)}
                  </p>
                </div>
                <Stars value={review.rating} size={14} />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {review.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
