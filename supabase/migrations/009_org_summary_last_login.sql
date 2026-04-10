-- ================================================================
-- 009: Add last_login_at to org_summary view
-- Exposes auth.users.last_sign_in_at via the super admin dashboard
-- ================================================================

DROP VIEW IF EXISTS public.org_summary;

CREATE OR REPLACE VIEW public.org_summary
WITH (security_invoker = true) AS
SELECT
  o.id,
  o.name,
  o.sector,
  o.plan_name,
  o.base_price,
  o.per_user_price,
  o.billing_cycle,
  o.billing_notes,
  o.max_users,
  o.is_active,
  o.subscription_tier,
  o.subscription_status,
  o.trial_ends_at,
  o.created_at,
  o.updated_at,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) AS active_users,
  COUNT(DISTINCT p.id) AS total_users,
  MAX(au.last_sign_in_at) AS last_login_at
FROM public.organizations o
LEFT JOIN public.profiles p ON p.org_id = o.id
LEFT JOIN auth.users au ON au.id = p.id
GROUP BY o.id;

GRANT SELECT ON public.org_summary TO authenticated;
