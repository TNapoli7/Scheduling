-- Activity logs table for tracking all user actions within an organization
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast org-level queries
CREATE INDEX idx_activity_logs_org_created ON activity_logs(org_id, created_at DESC);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- RLS policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins and managers can view logs for their org
CREATE POLICY "Managers can view org activity logs"
  ON activity_logs FOR SELECT
  USING (
    org_id IN (
      SELECT p.org_id FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager')
    )
  );

-- Any authenticated user can insert logs (app writes on their behalf)
CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Function to log activity (callable from app)
CREATE OR REPLACE FUNCTION log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_log_id UUID;
BEGIN
  SELECT org_id INTO v_org_id FROM profiles WHERE id = auth.uid();

  INSERT INTO activity_logs (org_id, user_id, action, entity_type, entity_id, details)
  VALUES (v_org_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
