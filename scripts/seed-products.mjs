/**
 * Seed Supabase products from the local catalog image set.
 * Usage: node --env-file=.env scripts/seed-products.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const products = [
  ["Premium Heavyweight Tee", "Heavyweight streetwear tee featuring premium cotton with a minimalist brand chest print.", 29.99, "/assets/Image/Branded Teeshirts.jpeg", "Apparels"],
  ["Signature Oversized Hoodie", "Premium heavy cotton fleece hoodie with double-lined hood and relaxed drop-shoulder fit.", 59.99, "/assets/Image/Stand Still Black.jpeg", "Apparels"],
  ["Minimalist Streetwear Cap", "Unstructured 6-panel strapback cap with premium embroidered brand icon.", 24.99, "/assets/Image/Face-cap.jpeg", "Apparels"],
  ["Classic Canvas Tote Bag", "Durable heavyweight cotton canvas tote bag with reinforced handles and interior pocket.", 19.99, "/assets/Image/Tote bag.jpeg", "Apparels"],
  ["Streetwear School Backpack", "Water-resistant tactical backpack with multi-compartment layouts and utility straps.", 49.99, "/assets/Image/School bag.jpeg", "Apparels"],
  ["Children Brand Tee", "Soft pre-shrunk children tee featuring custom brand artwork and non-toxic cured inks.", 19.99, "/assets/Image/Affirmation Tees.jpeg", "Apparels"],
  ["Branded Hardcover Journal", "Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.", 15.99, "/assets/Image/Branded Journals.jpeg", "Stationery"],
  ["Matte Custom Bookmark Set", "Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.", 5.99, "/assets/Image/Book marks.jpeg", "Stationery"],
  ["Premium Die-Cut Sticker Pack", "Weatherproof vinyl brand sticker pack featuring unique high-fidelity graphic designs.", 4.99, "/assets/Image/Stickers.jpeg", "Stationery"],
  ["Sleek Aluminium Pen", "Brushed aluminium ballpoint pen with engraved brand mark and smooth gel refill.", 9.99, "/assets/Image/Pen.jpeg", "Stationery"],
  ["Custom Polymailer Nylon Bag", "Durable branded polymailer for shipping and packaging with custom print.", 3.99, "/assets/Image/Customized nylon.jpeg", "Brand Packaging"],
  ["Branded Packaging Sticker Reel", "Custom packaging sticker reel for sealing and brand moments.", 8.99, "/assets/Image/Stickers.jpeg", "Brand Packaging"],
  ["Heavyweight Desk Mouse Pad", "Extended desk mouse pad with high-fidelity edge-to-edge print.", 14.99, "/assets/Image/Mouse pad.PNG", "Gadgets"],
  ["Ergonomic Wireless Mouse", "Comfort wireless mouse with custom brand inlay options.", 29.99, "/assets/Image/Mouse.jpeg", "Gadgets"],
  ["Premium Studio Headset", "Over-ear studio headset with branded ear-cup plate options.", 79.99, "/assets/Image/Headset.jpeg", "Gadgets"],
  ["Heat-Activated Magic Mug", "Ceramic color-reveal mug with high-fidelity wrap print.", 18.99, "/assets/Image/Magic mug.jpeg", "Corporate Gift"],
];

async function main() {
  // Clear existing catalog so images match the asset set again
  await supabase.from("product_images").delete().neq("id", 0);
  await supabase.from("product_sizes").delete().neq("id", 0);
  await supabase.from("products").delete().neq("id", 0);

  const rows = products.map(([title, description, price, image_url, category]) => ({
    title,
    description,
    price,
    image_url,
    category,
    is_active: true,
  }));

  const { data, error } = await supabase.from("products").insert(rows).select("id, title, image_url");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const images = (data ?? []).map((p) => ({
    product_id: p.id,
    image_url: p.image_url,
    color_code: "#53009B",
    is_primary: true,
  }));

  const { error: imgError } = await supabase.from("product_images").insert(images);
  if (imgError) {
    console.error(imgError.message);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} products with images.`);
}

main();
