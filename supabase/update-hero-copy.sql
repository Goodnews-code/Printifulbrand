-- Update home hero copy (run in Supabase SQL Editor)
update public.settings
set value = 'Be Bold! Be Seen!! Be Known!!!'
where key = 'hero_headline';

update public.settings
set value = 'Printiful help announce you and your brand even when you don''t say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.'
where key = 'hero_subtext';

insert into public.settings (key, value)
values
  ('hero_headline', 'Be Bold! Be Seen!! Be Known!!!'),
  ('hero_subtext', 'Printiful help announce you and your brand even when you don''t say a word with our quality and premium products, from personalized items to brand merchandise, we do it all.')
on conflict (key) do update set value = excluded.value;
