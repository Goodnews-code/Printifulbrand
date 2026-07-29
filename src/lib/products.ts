import { getDb } from "@/lib/db";
import type { Product, ProductImage, ProductSize } from "@/types";

function attachRelations(product: Product): Product {
  const db = getDb();
  const images = db
    .prepare(
      "SELECT id, image_url, color_code, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC",
    )
    .all(product.id) as ProductImage[];
  const sizes = db
    .prepare(
      "SELECT id, size_name, price FROM product_sizes WHERE product_id = ? ORDER BY id ASC",
    )
    .all(product.id) as ProductSize[];
  return { ...product, images, sizes };
}

export function listProducts(includeInactive = false): Product[] {
  const db = getDb();
  const rows = (
    includeInactive
      ? db.prepare("SELECT * FROM products ORDER BY id DESC").all()
      : db
          .prepare(
            "SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC",
          )
          .all()
  ) as Product[];
  return rows.map(attachRelations);
}

export function getProduct(id: number): Product | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | Product
    | undefined;
  return row ? attachRelations(row) : null;
}

export function createProduct(input: {
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_active?: boolean;
  images?: ProductImage[];
  sizes?: ProductSize[];
}) {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO products (title, description, price, image_url, category, is_active) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.title,
      input.description ?? "",
      input.price,
      input.image_url ?? input.images?.[0]?.image_url ?? "",
      input.category ?? "Apparels",
      input.is_active === false ? 0 : 1,
    );

  const productId = Number(result.lastInsertRowid);
  replaceVariants(productId, input.images ?? [], input.sizes ?? []);
  return getProduct(productId);
}

export function updateProduct(
  id: number,
  input: {
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    category?: string;
    is_active?: boolean;
    images?: ProductImage[];
    sizes?: ProductSize[];
  },
) {
  const db = getDb();
  db.prepare(
    "UPDATE products SET title = ?, description = ?, price = ?, image_url = ?, category = ?, is_active = ? WHERE id = ?",
  ).run(
    input.title,
    input.description ?? "",
    input.price,
    input.image_url ?? input.images?.[0]?.image_url ?? "",
    input.category ?? "Apparels",
    input.is_active === false ? 0 : 1,
    id,
  );
  replaceVariants(id, input.images ?? [], input.sizes ?? []);
  return getProduct(id);
}

export function deleteProduct(id: number) {
  const db = getDb();
  const product = getProduct(id);
  if (!product) return null;
  if (product.image_url?.startsWith("/uploads/")) {
    db.prepare(
      "INSERT INTO deleted_images (image_path, deleted_at) VALUES (?, datetime('now'))",
    ).run(product.image_url);
  }
  db.prepare("DELETE FROM product_images WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM product_sizes WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return product;
}

function replaceVariants(
  productId: number,
  images: ProductImage[],
  sizes: ProductSize[],
) {
  const db = getDb();
  db.prepare("DELETE FROM product_images WHERE product_id = ?").run(productId);
  db.prepare("DELETE FROM product_sizes WHERE product_id = ?").run(productId);

  const imgStmt = db.prepare(
    "INSERT INTO product_images (product_id, image_url, color_code, is_primary) VALUES (?, ?, ?, ?)",
  );
  images.forEach((img, index) => {
    imgStmt.run(
      productId,
      img.image_url,
      img.color_code || "#000000",
      img.is_primary || index === 0 ? 1 : 0,
    );
  });

  const sizeStmt = db.prepare(
    "INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)",
  );
  sizes.forEach((size) => {
    sizeStmt.run(productId, size.size_name, size.price);
  });
}
