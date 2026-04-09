-- ============================================================
-- Migration 006: Add period column to time_off_requests
-- Supports half-day requests (morning/afternoon)
-- ============================================================

ALTER TABLE public.time_off_requests
  ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'full_day';
-- Values: full_day, morning, afternoon
