-- Product reviews (live customer feedback per product)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

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

alter table public.product_reviews enable row level security;

-- Public can read visible reviews for active products
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

-- Inserts go through Next.js API with service role (bypasses RLS).
-- No public insert policy — keeps spam control in the app layer.
