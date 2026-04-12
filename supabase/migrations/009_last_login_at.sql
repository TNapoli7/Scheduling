-- Migration 009: Add last_login_at to profiles
-- Tracks when each user last logged in, displayed in Super Admin dashboard

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Update the org_summary view to include last org-wide login
DROP VIEW IF EXISTS org_summary;

CREATE VIEW org_summary AS
SELECT
  o.*,
  COALESCE(counts.active_users, 0) AS active_users,
  COALESCE(counts.total_users, 0) AS total_users,
  counts.last_org_login
FROM organizations o
LEFT JOIN (
  SELECT
    org_id,
    COUNT(*) FILTER (WHERE is_active = true) AS active_users,
    COUNT(*) AS total_users,
    MAX(last_login_at) AS last_org_login
  FROM profiles
  WHERE org_id IS NOT NULL
  GROUP BY org_id
) counts ON counts.org_id = o.id;

-- Grant access to authenticated users (RLS on underlying tables still applies)
GRANT SELECT ON org_summary TO authenticated;
