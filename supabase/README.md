# Supabase setup for Printiful

## 1. Create project
1. Go to https://supabase.com and create a free project
2. Wait until the database is ready

## 2. Run the schema
1. Open **SQL Editor** → New query
2. Paste everything from `schema.sql` in this folder
3. Click **Run**

This creates tables, RLS policies, default settings, a `product-images` storage bucket, and a few sample products.

## 3. Copy API keys
Project **Settings → API**:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose in the browser)

## 4. Local env
Create `.env.local` in the project root:

```env
ADMIN_PASSWORD=Printiful123
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

Restart `npm run dev`.

## Notes
- API routes use the **service role** key after admin password checks
- Product uploads go to the `product-images` Storage bucket
- Static assets under `/public/assets` still work as image URLs
