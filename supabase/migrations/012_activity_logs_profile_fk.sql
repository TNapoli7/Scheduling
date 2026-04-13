-- Migration 012: Add FK from activity_logs.user_id to profiles.id
-- Reason: The ActivityLog UI component joins via profiles!activity_logs_user_id_fkey
-- but the original FK points to auth.users(id), not profiles(id).
-- PostgREST can't resolve the join → query returns empty results.

-- Add the FK constraint so PostgREST can resolve the join to profiles
ALTER TABLE activity_logs
  ADD CONSTRAINT activity_logs_user_id_profile_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
