-- ============================================================
-- 016: Fix RLS leak on organizations SELECT policy
-- ============================================================
-- PROBLEM: The "Members can view own org" policy has:
--   (id = get_my_org_id()) OR (get_my_org_id() IS NULL)
-- This means any authenticated user whose get_my_org_id() returns
-- NULL (e.g. during onboarding, before org assignment) can SELECT
-- every row in organizations — including billing data.
--
-- FIX: Remove the OR branch. Onboarding users who haven't created
-- an org yet don't need to read organizations at all — they INSERT
-- a new one. After INSERT, their profile gets linked and
-- get_my_org_id() returns the new org id, so the normal branch works.
-- ============================================================

-- 1. Drop the leaky SELECT policy
DROP POLICY IF EXISTS "Members can view own org" ON public.organizations;

-- 2. Re-create it without the OR (get_my_org_id() IS NULL) branch
CREATE POLICY "Members can view own org"
  ON public.organizations
  FOR SELECT
  USING (id = public.get_my_org_id());

-- The INSERT policy ("Authenticated users can create org") stays as-is:
--   WITH CHECK (auth.uid() IS NOT NULL)
-- That lets onboarding users create their org without reading others.

-- The super-admin SELECT policy also stays, giving full visibility
-- only to super admins.
