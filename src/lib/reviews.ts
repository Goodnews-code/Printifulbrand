import type { ProductReview, ProductReviewSummary } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReviewRow = {
  id: number;
  product_id: number;
  author_name: string;
  rating: number;
  comment: string;
  is_visible: boolean;
  created_at: string;
  products?: { title: string } | { title: string }[] | null;
};

function mapReview(row: ReviewRow): ProductReview {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  return {
    id: row.id,
    product_id: row.product_id,
    author_name: row.author_name,
    rating: row.rating,
    comment: row.comment,
    is_visible: row.is_visible,
    created_at: row.created_at,
    product_title: product?.title,
  };
}

export async function listVisibleReviews(productId: number): Promise<ProductReview[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, author_name, rating, comment, is_visible, created_at")
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapReview);
}

export async function listAllReviews(): Promise<ProductReview[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      "id, product_id, author_name, rating, comment, is_visible, created_at, products(title)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapReview(row as ReviewRow));
}

export async function listReviewSummaries(): Promise<ProductReviewSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("product_id, rating")
    .eq("is_visible", true);

  if (error) throw new Error(error.message);

  const buckets = new Map<number, { sum: number; count: number }>();
  for (const row of data ?? []) {
    const id = Number(row.product_id);
    const rating = Number(row.rating);
    if (!Number.isFinite(id) || !Number.isFinite(rating)) continue;
    const prev = buckets.get(id) ?? { sum: 0, count: 0 };
    buckets.set(id, { sum: prev.sum + rating, count: prev.count + 1 });
  }

  return Array.from(buckets.entries()).map(([product_id, { sum, count }]) => ({
    product_id,
    count,
    average: Math.round((sum / count) * 10) / 10,
  }));
}

export async function createReview(input: {
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<ProductReview> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: input.productId,
      author_name: input.authorName,
      rating: input.rating,
      comment: input.comment,
      is_visible: true,
    })
    .select("id, product_id, author_name, rating, comment, is_visible, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapReview(data as ReviewRow);
}

export async function setReviewVisibility(
  id: number,
  isVisible: boolean,
): Promise<ProductReview | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .update({ is_visible: isVisible })
    .eq("id", id)
    .select(
      "id, product_id, author_name, rating, comment, is_visible, created_at, products(title)",
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapReview(data as ReviewRow);
}

export async function deleteReview(id: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}
