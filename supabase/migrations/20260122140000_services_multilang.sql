-- Add multi-language support and dual currency pricing to services table
-- Migration: 20260122140000_services_multilang.sql

-- Add multi-language name columns
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_pt text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_de text;

-- Add multi-language description columns (markdown supported)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_pt text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description_de text;

-- Add EUR pricing column (keeping existing price as CHF)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price_eur decimal(10, 2) DEFAULT 0.00;

-- Migrate existing data: copy name to name_en, description to description_en
UPDATE public.services 
SET 
    name_en = COALESCE(name_en, name),
    description_en = COALESCE(description_en, description)
WHERE name_en IS NULL OR description_en IS NULL;

-- Note: We keep the original 'name', 'description', and 'price' columns for backwards compatibility
-- The 'price' column now represents price_chf
