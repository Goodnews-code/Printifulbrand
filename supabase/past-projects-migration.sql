-- ============================================================
-- MIGRATION: 3-Category Store Revamp (100% NON-DESTRUCTIVE)
-- SAFE TO RUN: Zero products, images, or rows will be deleted.
-- No DROP statements are used.
-- ============================================================

-- ── 1. Add `section` column to products ─────────────────────
-- Defaults to 'showcase' so all existing products and images
-- stay completely intact and visible in the showcase.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'showcase';

-- Safe constraint: only adds if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_section_check'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_section_check CHECK (section IN ('showcase', 'ready'));
  END IF;
END $$;

-- ── 2. Create `past_projects` table ─────────────────────────
-- Creates a separate new table for client gallery photos.
CREATE TABLE IF NOT EXISTS public.past_projects (
  id          BIGSERIAL PRIMARY KEY,
  image_url   TEXT        NOT NULL,
  caption     TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast ordered reads
CREATE INDEX IF NOT EXISTS past_projects_sort_idx
  ON public.past_projects (sort_order ASC, id DESC);

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE public.past_projects ENABLE ROW LEVEL SECURITY;

-- ── 4. Policies (Non-destructive check without DROP) ────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'past_projects' 
      AND policyname = 'past_projects_read_public'
  ) THEN
    CREATE POLICY "past_projects_read_public"
      ON public.past_projects FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'past_projects' 
      AND policyname = 'past_projects_admin_all'
  ) THEN
    CREATE POLICY "past_projects_admin_all"
      ON public.past_projects FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
