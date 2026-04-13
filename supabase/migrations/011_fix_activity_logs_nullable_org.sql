-- Migration 011: Fix activity_logs org_id NOT NULL constraint
-- Applied manually on 2026-04-12 via SQL Editor, now tracked as migration
-- Issue: log_activity() failed with "null value in column org_id" when user had no org yet

-- 1. Make org_id nullable
ALTER TABLE activity_logs ALTER COLUMN org_id DROP NOT NULL;

-- 2. Recreate log_activity function (unchanged logic, now works with NULL org_id)
CREATE OR REPLACE FUNCTION log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT org_id INTO v_org_id FROM profiles WHERE id = v_user_id;

  INSERT INTO activity_logs (user_id, org_id, action, entity_type, entity_id, details)
  VALUES (v_user_id, v_org_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- 3. Update RLS policy to handle NULL org_id rows
DROP POLICY IF EXISTS activity_logs_select ON activity_logs;
CREATE POLICY activity_logs_select ON activity_logs
  FOR SELECT USING (
    org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    OR org_id IS NULL
  );
