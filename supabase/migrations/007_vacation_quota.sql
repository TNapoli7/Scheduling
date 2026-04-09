-- Migration 007: Add vacation quota to profiles
-- Default 22 working days per year (Portuguese labor law standard)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS vacation_quota integer NOT NULL DEFAULT 22;
