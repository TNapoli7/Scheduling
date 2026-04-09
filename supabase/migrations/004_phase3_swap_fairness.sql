-- Migration 004: Phase 3 — swap_requests reason column + RLS fixes

-- Add reason column to swap_requests
alter table public.swap_requests add column if not exists reason text;

-- Fix swap_requests RLS to use helper functions
drop policy if exists "Users can view own swap requests" on public.swap_requests;
drop policy if exists "Users can create swap requests" on public.swap_requests;
drop policy if exists "Managers can manage swap requests" on public.swap_requests;
drop policy if exists "swap_requests_select" on public.swap_requests;
drop policy if exists "swap_requests_insert" on public.swap_requests;
drop policy if exists "swap_requests_update" on public.swap_requests;

-- Users can see their own swap requests
create policy "swap_requests_select"
  on public.swap_requests for select
  using (
    requester_id = auth.uid()
    or target_id = auth.uid()
    or public.get_my_role() in ('admin', 'manager')
  );

-- Users can create swap requests for themselves
create policy "swap_requests_insert"
  on public.swap_requests for insert
  with check (requester_id = auth.uid());

-- Managers can update (approve/reject)
create policy "swap_requests_update"
  on public.swap_requests for update
  using (
    public.get_my_role() in ('admin', 'manager')
  );
