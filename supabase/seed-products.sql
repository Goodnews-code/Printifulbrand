-- Restore full Printiful product catalog with local asset images
-- Run in Supabase SQL Editor if your products/images are missing

-- Clear existing products (cascades to images/sizes)
truncate table public.product_images restart identity cascade;
truncate table public.product_sizes restart identity cascade;
truncate table public.products restart identity cascade;

insert into public.products (title, description, price, image_url, category, is_active) values
('Premium Heavyweight Tee', 'Heavyweight streetwear tee featuring premium cotton with a minimalist brand chest print.', 29.99, '/assets/Image/Branded Teeshirts.jpeg', 'Apparels', true),
('Signature Oversized Hoodie', 'Premium heavy cotton fleece hoodie with double-lined hood and relaxed drop-shoulder fit.', 59.99, '/assets/Image/Stand Still Black.jpeg', 'Apparels', true),
('Minimalist Streetwear Cap', 'Unstructured 6-panel strapback cap with premium embroidered brand icon.', 24.99, '/assets/Image/Face-cap.jpeg', 'Apparels', true),
('Classic Canvas Tote Bag', 'Durable heavyweight cotton canvas tote bag with reinforced handles and interior pocket.', 19.99, '/assets/Image/Tote bag.jpeg', 'Apparels', true),
('Streetwear School Backpack', 'Water-resistant tactical backpack with multi-compartment layouts and utility straps.', 49.99, '/assets/Image/School bag.jpeg', 'Apparels', true),
('Children Brand Tee', 'Soft pre-shrunk children tee featuring custom brand artwork and non-toxic cured inks.', 19.99, '/assets/Image/Affirmation Tees.jpeg', 'Apparels', true),
('Branded Hardcover Journal', 'Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.', 15.99, '/assets/Image/Branded Journals.jpeg', 'Stationery', true),
('Matte Custom Bookmark Set', 'Set of 3 custom matte-finish heavy cardstock bookmarks with premium brand icons.', 5.99, '/assets/Image/Book marks.jpeg', 'Stationery', true),
('Premium Die-Cut Sticker Pack', 'Weatherproof vinyl brand sticker pack featuring unique high-fidelity graphic designs.', 4.99, '/assets/Image/Stickers.jpeg', 'Stationery', true),
('Sleek Aluminium Pen', 'Brushed aluminium ballpoint pen with engraved brand mark and smooth gel refill.', 9.99, '/assets/Image/Pen.jpeg', 'Stationery', true),
('Custom Polymailer Nylon Bag', 'Durable branded polymailer for shipping and packaging with custom print.', 3.99, '/assets/Image/Customized nylon.jpeg', 'Brand Packaging', true),
('Branded Packaging Sticker Reel', 'Custom packaging sticker reel for sealing and brand moments.', 8.99, '/assets/Image/Stickers.jpeg', 'Brand Packaging', true),
('Heavyweight Desk Mouse Pad', 'Extended desk mouse pad with high-fidelity edge-to-edge print.', 14.99, '/assets/Image/Mouse pad.PNG', 'Gadgets', true),
('Ergonomic Wireless Mouse', 'Comfort wireless mouse with custom brand inlay options.', 29.99, '/assets/Image/Mouse.jpeg', 'Gadgets', true),
('Premium Studio Headset', 'Over-ear studio headset with branded ear-cup plate options.', 79.99, '/assets/Image/Headset.jpeg', 'Gadgets', true),
('Heat-Activated Magic Mug', 'Ceramic color-reveal mug with high-fidelity wrap print.', 18.99, '/assets/Image/Magic mug.jpeg', 'Corporate Gift', true);
