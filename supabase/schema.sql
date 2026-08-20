-- Printiful Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- Products
create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  price double precision not null,
  image_url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Color / image variants
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  image_url text not null,
  color_code text not null default '#000000',
  is_primary boolean not null default false
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id);

-- Size variants
create table if not exists public.product_sizes (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  size_name text not null,
  price double precision not null
);

create index if not exists product_sizes_product_id_idx
  on public.product_sizes (product_id);

-- Site settings (key/value)
create table if not exists public.settings (
  key text primary key,
  value text not null
);

-- Soft-deleted storage paths (cleanup job)
create table if not exists public.deleted_images (
  id bigint generated always as identity primary key,
  image_path text not null,
  deleted_at timestamptz not null default now()
);

-- Live customer reviews per product
create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  author_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews (product_id);

create index if not exists product_reviews_visible_created_idx
  on public.product_reviews (is_visible, created_at desc);

-- Orders (Paystack)
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  reference text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  amount double precision not null,
  currency text not null default 'NGN',
  status text not null default 'pending',
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Default settings
insert into public.settings (key, value) values
  ('site_title', 'Printiful | Premium Custom wear & High-Fidelity Printing'),
  ('site_description', 'Printiful crafts premium customized merch on heavyweight luxury blanks.'),
  ('hero_headline', 'Be Bold! Be Seen!! Be Known!!!'),
  ('hero_subtext', 'Heavyweight luxury blanks. High-fidelity Direct-to-Merch prints, industrial embroidery, and curated wear designed to endure.'),
  ('primary_color', '#53009B'),
  ('secondary_color', '#0D0015'),
  ('accent_color', '#FFFF00'),
  ('contact_email', 'shopprintiful@gmail.com'),
  ('contact_phone', '+234 000 000 0000'),
  ('footer_text', '© 2026 Printiful Custom Printing. All rights reserved. Beautifully printed.'),
  ('paystack_public_key', '')
on conflict (key) do nothing;

-- RLS: public can read active catalog + non-secret settings.
-- All writes go through Next.js API using the service role key (bypasses RLS).
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_reviews enable row level security;
alter table public.settings enable row level security;
alter table public.deleted_images enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

drop policy if exists "Public read product sizes" on public.product_sizes;
create policy "Public read product sizes"
  on public.product_sizes for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

drop policy if exists "Public read visible reviews" on public.product_reviews;
create policy "Public read visible reviews"
  on public.product_reviews for select
  using (
    is_visible = true
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

drop policy if exists "Public read safe settings" on public.settings;
create policy "Public read safe settings"
  on public.settings for select
  using (key <> 'paystack_secret_key');

-- Storage bucket for product images (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images bucket" on storage.objects;
create policy "Public read product images bucket"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Optional sample products (skip if you will import your own)
insert into public.products (title, description, price, image_url, category, is_active)
select * from (values
  (
    'Premium Heavyweight Tee',
    'Heavyweight streetwear tee featuring premium cotton with a minimalist brand chest print.',
    29.99,
    '/assets/Image/Branded Teeshirts.jpeg',
    'Apparels',
    true
  ),
  (
    'Branded Hardcover Journal',
    'Sleek embossed leather notebook with grid pages, standard ribbons, and pen loops.',
    15.99,
    '/assets/Image/Branded Journals.jpeg',
    'Stationery',
    true
  ),
  (
    'Heat-Activated Magic Mug',
    'Ceramic color-reveal mug with high-fidelity wrap print.',
    18.99,
    '/assets/Image/Magic mug.jpeg',
    'Gadgets',
    true
  )
) as v(title, description, price, image_url, category, is_active)
where not exists (select 1 from public.products limit 1);
