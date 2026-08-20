-- Add Small Business Package SKU (safe to run once in production).
-- Title must stay exactly "Small Business Package" for the landing page lookup.

insert into public.products (title, description, price, image_url, category, is_active)
select
  'Small Business Package',
  '100 medium poly mailer bags, 100 A6 thank you cards, and 2 customized tees in any colors of your choice.',
  55000,
  '/assets/Image/Customized nylon.jpeg',
  'Brand Packaging',
  true
where not exists (
  select 1 from public.products
  where lower(trim(title)) = lower('Small Business Package')
);
