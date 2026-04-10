-- ==================================================================
-- 009: Add last_login_at to org_summary view
-- Exposes auth.users.last_sign_in_at via a SECURITY DEFINER helper
-- so the super admin dashboard can display it under RLS.
-- ==================================================================

DROP VIEW IF EXISTS public.org_summary;

-- Helper: fetch the most recent auth.users.last_sign_in_at for an org
-- Runs as definer (postgres) because the authenticated role cannot
-- SELECT directly from auth.users.
CREATE OR REPLACE FUNCTION public.org_last_login(org_uuid uuid)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT MAX(au.last_sign_in_at)
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE p.org_id = org_uuid;
$$;

REVOKE ALL ON FUNCTION public.org_last_login(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.org_last_login(uuid) TO authenticated;

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
  public.org_last_login(o.id) AS last_login_at
FROM public.organizations o
LEFT JOIN public.profiles p ON p.org_id = o.id
GROUP BY o.id;

GRANT SELECT ON public.org_summary TO authenticated;
