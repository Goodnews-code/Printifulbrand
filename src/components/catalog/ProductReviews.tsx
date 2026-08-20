"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ProductReview, ProductReviewSummary } from "@/types";
import { StarRating } from "@/components/catalog/StarRating";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: number;
  productTitle: string;
  open: boolean;
  onClose: () => void;
  onSummaryChange?: (summary: ProductReviewSummary) => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProductReviews({
  productId,
  productTitle,
  open,
  onClose,
  onSummaryChange,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const onSummaryChangeRef = useRef(onSummaryChange);
  onSummaryChangeRef.current = onSummaryChange;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load reviews");
      const list = Array.isArray(data) ? (data as ProductReview[]) : [];
      setReviews(list);
      const count = list.length;
      const average =
        count === 0
          ? 0
          : Math.round((list.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;
      onSummaryChangeRef.current?.({ product_id: productId, average, count });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName,
          rating,
          comment,
          website: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setAuthorName("");
      setRating(5);
      setComment("");
      setSuccess("Thanks — your review is live.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close reviews"
        className="absolute inset-0 bg-brand-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`reviews-title-${productId}`}
        className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col border border-border bg-surface shadow-xl sm:mx-4"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Customer reviews
            </p>
            <h2
              id={`reviews-title-${productId}`}
              className="mt-1 font-heading text-2xl font-semibold leading-tight"
            >
              {productTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 border border-border p-2 text-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <form
            onSubmit={handleSubmit}
            className="space-y-3 border border-border bg-surface-alt p-4"
          >
            <p className="font-ui text-sm font-semibold text-foreground">
              Leave a review
            </p>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Your name
              </span>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
                placeholder="e.g. Ada"
              />
            </label>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Rating
              </span>
              <StarRating
                value={rating}
                size="md"
                interactive
                onChange={setRating}
                label="Your rating"
              />
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Review
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
                maxLength={1000}
                rows={3}
                className="w-full resize-y border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-purple dark:focus:border-brand-yellow"
                placeholder="How was the quality, fit, or print?"
              />
            </label>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden
            />
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
            {success ? (
              <p className="text-sm text-brand-purple dark:text-brand-yellow">
                {success}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-purple py-2.5 text-sm font-semibold text-white transition hover:bg-brand-purple-deep disabled:opacity-60 dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-white"
            >
              {submitting ? "Posting…" : "Post review"}
            </button>
          </form>

          <div className="space-y-3">
            <p className="font-ui text-xs font-bold uppercase tracking-[0.14em] text-muted">
              {loading
                ? "Loading…"
                : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
            </p>
            {!loading && reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet — be the first.</p>
            ) : null}
            {reviews.map((review) => (
              <article
                key={review.id}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-ui text-sm font-semibold">
                    {review.author_name}
                  </p>
                  <StarRating value={review.rating} />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {review.comment}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(review.created_at)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
