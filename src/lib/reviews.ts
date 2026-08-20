import type { ProductReview } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReviewRow = {
  id: number;
  product_id: number;
  author_name: string;
  comment: string;
  rating: number;
  created_at: string;
};

function mapReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    product_id: row.product_id,
    author_name: row.author_name,
    comment: row.comment,
    rating: row.rating,
    created_at: row.created_at,
  };
}

export async function listReviewsForProduct(
  productId: number,
): Promise<ProductReview[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, author_name, comment, rating, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ReviewRow[]).map(mapReview);
}

export async function listAllReviews(): Promise<
  Array<ProductReview & { product_title?: string }>
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      "id, product_id, author_name, comment, rating, created_at, products ( title )",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Array<
    ReviewRow & {
      products?: { title: string } | { title: string }[] | null;
    }
  >).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      ...mapReview(row),
      product_title: product?.title,
    };
  });
}

export async function createReview(input: {
  productId: number;
  authorName: string;
  comment: string;
  rating: number;
}): Promise<ProductReview> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: input.productId,
      author_name: input.authorName.trim(),
      comment: input.comment.trim(),
      rating: input.rating,
    })
    .select("id, product_id, author_name, comment, rating, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapReview(data as ReviewRow);
}

export async function deleteReview(id: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}
