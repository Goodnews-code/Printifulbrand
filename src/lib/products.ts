import type { Product, ProductImage, ProductSize } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ProductRow = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at?: string;
  product_images?: Array<{
    id: number;
    image_url: string;
    color_code: string;
    is_primary: boolean;
  }>;
  product_sizes?: Array<{
    id: number;
    size_name: string;
    price: number;
  }>;
};

function mapProduct(row: ProductRow): Product {
  const images: ProductImage[] = (row.product_images ?? []).map((img) => ({
    id: img.id,
    image_url: img.image_url,
    color_code: img.color_code,
    is_primary: img.is_primary ? 1 : 0,
  }));
  const sizes: ProductSize[] = (row.product_sizes ?? []).map((size) => ({
    id: size.id,
    size_name: size.size_name,
    price: size.price,
  }));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    category: row.category,
    is_active: row.is_active ? 1 : 0,
    created_at: row.created_at,
    images,
    sizes,
  };
}

const productSelect = `
  id, title, description, price, image_url, category, is_active, created_at,
  product_images ( id, image_url, color_code, is_primary ),
  product_sizes ( id, size_name, price )
`;

export async function listProducts(includeInactive = false): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("products")
    .select(productSelect)
    .order("id", { ascending: false });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getProduct(id: number): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as ProductRow);
}

type ProductInput = {
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_active?: boolean;
  images?: ProductImage[];
  sizes?: ProductSize[];
};

export async function createProduct(input: ProductInput) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .insert({
      title: input.title,
      description: input.description ?? "",
      price: input.price,
      image_url: input.image_url ?? input.images?.[0]?.image_url ?? "",
      category: input.category ?? "Apparels",
      is_active: input.is_active !== false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  const productId = data.id as number;
  await replaceVariants(productId, input.images ?? [], input.sizes ?? []);
  return getProduct(productId);
}

export async function updateProduct(id: number, input: ProductInput) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("products")
    .update({
      title: input.title,
      description: input.description ?? "",
      price: input.price,
      image_url: input.image_url ?? input.images?.[0]?.image_url ?? "",
      category: input.category ?? "Apparels",
      is_active: input.is_active !== false,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await replaceVariants(id, input.images ?? [], input.sizes ?? []);
  return getProduct(id);
}

export async function deleteProduct(id: number) {
  const supabase = getSupabaseAdmin();
  const product = await getProduct(id);
  if (!product) return null;

  if (
    product.image_url?.includes("/product-images/") ||
    product.image_url?.startsWith("/uploads/")
  ) {
    await supabase.from("deleted_images").insert({
      image_path: product.image_url,
    });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return product;
}

async function replaceVariants(
  productId: number,
  images: ProductImage[],
  sizes: ProductSize[],
) {
  const supabase = getSupabaseAdmin();

  await supabase.from("product_images").delete().eq("product_id", productId);
  await supabase.from("product_sizes").delete().eq("product_id", productId);

  if (images.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      images.map((img, index) => ({
        product_id: productId,
        image_url: img.image_url,
        color_code: img.color_code || "#000000",
        is_primary: Boolean(img.is_primary) || index === 0,
      })),
    );
    if (error) throw new Error(error.message);
  }

  if (sizes.length > 0) {
    const { error } = await supabase.from("product_sizes").insert(
      sizes.map((size) => ({
        product_id: productId,
        size_name: size.size_name,
        price: size.price,
      })),
    );
    if (error) throw new Error(error.message);
  }
}
