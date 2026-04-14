-- ============================================================
-- Migration 014: Legal profile per organisation
-- ============================================================
-- Adds a `country_code` column so each organisation is bound to a legal
-- profile (currently supported: 'PT'; 'EU' baseline is the fallback used
-- by the compliance engine when a code is unknown). Default 'PT' preserves
-- existing behaviour for all current organisations.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'PT';

-- Soft validation — kept as CHECK so the admin UI can constrain choices
-- later without us locking in every EU country here.
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_country_code_format CHECK (
    country_code ~ '^[A-Z]{2}$'
  );

COMMENT ON COLUMN public.organizations.country_code IS
  'ISO-like 2-letter code used to resolve the labour-law profile (see src/lib/compliance/profiles). Defaults to PT.';
