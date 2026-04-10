-- ============================================================
-- 008: Super Admin flag + organization billing metadata
-- ============================================================

-- 1. Add super admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- 2. Add billing fields to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_name text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS base_price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS per_user_price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS billing_notes text,
  ADD COLUMN IF NOT EXISTS max_users integer,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 3. Create a view for super admin: org summary with user counts
CREATE OR REPLACE VIEW public.org_summary AS
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
  COUNT(p.id) FILTER (WHERE p.is_active = true) AS active_users,
  COUNT(p.id) AS total_users
FROM public.organizations o
LEFT JOIN public.profiles p ON p.org_id = o.id
GROUP BY o.id;

-- 4. RLS: super admins can read all organizations
CREATE POLICY "Super admins can view all organizations"
  ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- 5. RLS: super admins can update all organizations
CREATE POLICY "Super admins can update all organizations"
  ON public.organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- 6. RLS: super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles sa
      WHERE sa.id = auth.uid()
      AND sa.is_super_admin = true
    )
  );
