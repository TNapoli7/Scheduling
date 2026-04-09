-- ============================================================
-- Migration 005: Availability approval + Time-off requests
-- ============================================================

-- ─── Add approval_status to availability ────────────────────
ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- ─── TIME OFF REQUESTS (férias, baixa, etc.) ───────────────
CREATE TABLE IF NOT EXISTS public.time_off_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  type text NOT NULL DEFAULT 'ferias', -- ferias, baixa, pessoal, outro
  reason text,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_off_user ON public.time_off_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_time_off_org ON public.time_off_requests(org_id, status);

-- RLS for time_off_requests
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time off requests"
  ON public.time_off_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own time off requests"
  ON public.time_off_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view org time off requests"
  ON public.time_off_requests FOR SELECT
  USING (
    org_id IN (
      SELECT p.org_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update org time off requests"
  ON public.time_off_requests FOR UPDATE
  USING (
    org_id IN (
      SELECT p.org_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ─── Update availability RLS for approval workflow ──────────
-- Managers need to update (approve/reject) availability
DROP POLICY IF EXISTS "Managers can view org availability" ON public.availability;

CREATE POLICY "Managers can view org availability"
  ON public.availability FOR SELECT
  USING (
    user_id IN (
      SELECT p2.id FROM public.profiles p1
      JOIN public.profiles p2 ON p1.org_id = p2.org_id
      WHERE p1.id = auth.uid() AND p1.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update org availability"
  ON public.availability FOR UPDATE
  USING (
    user_id IN (
      SELECT p2.id FROM public.profiles p1
      JOIN public.profiles p2 ON p1.org_id = p2.org_id
      WHERE p1.id = auth.uid() AND p1.role IN ('admin', 'manager')
    )
  );

-- ─── Notifications: allow insert for system/managers ────────
CREATE POLICY "Managers can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Allow users to insert their own notifications (for self-triggered events)
CREATE POLICY "Users can create own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());
