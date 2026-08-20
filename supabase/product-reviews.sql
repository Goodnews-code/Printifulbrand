-- Product reviews (run in Supabase SQL Editor if not applied yet)

create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  author_name text not null,
  comment text not null,
  rating smallint not null default 5 check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_id_idx
  on public.product_reviews (product_id);

create index if not exists product_reviews_created_at_idx
  on public.product_reviews (created_at desc);

alter table public.product_reviews enable row level security;

drop policy if exists "Public read product reviews" on public.product_reviews;
create policy "Public read product reviews"
  on public.product_reviews for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

-- Writes go through Next.js API with the service role key (bypasses RLS).
