-- Migration 003: Ensure schedule and schedule_entries RLS policies use helper functions
-- This is idempotent — drops existing policies first

-- Schedules
drop policy if exists "Members can view schedules" on public.schedules;
drop policy if exists "Managers can manage schedules" on public.schedules;
drop policy if exists "schedules_select" on public.schedules;
drop policy if exists "schedules_all" on public.schedules;

create policy "schedules_select"
  on public.schedules for select
  using (org_id = public.get_my_org_id());

create policy "schedules_insert"
  on public.schedules for insert
  with check (
    org_id = public.get_my_org_id()
    and public.get_my_role() in ('admin', 'manager')
  );

create policy "schedules_update"
  on public.schedules for update
  using (
    org_id = public.get_my_org_id()
    and public.get_my_role() in ('admin', 'manager')
  );

create policy "schedules_delete"
  on public.schedules for delete
  using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
  );

-- Schedule entries
drop policy if exists "Members can view schedule entries" on public.schedule_entries;
drop policy if exists "Managers can manage schedule entries" on public.schedule_entries;
drop policy if exists "schedule_entries_select" on public.schedule_entries;
drop policy if exists "schedule_entries_all" on public.schedule_entries;
drop policy if exists "schedule_entries_insert" on public.schedule_entries;
drop policy if exists "schedule_entries_update" on public.schedule_entries;
drop policy if exists "schedule_entries_delete" on public.schedule_entries;

create policy "schedule_entries_select"
  on public.schedule_entries for select
  using (
    exists (
      select 1 from public.schedules s
      where s.id = schedule_id
      and s.org_id = public.get_my_org_id()
    )
  );

create policy "schedule_entries_insert"
  on public.schedule_entries for insert
  with check (
    public.get_my_role() in ('admin', 'manager')
    and exists (
      select 1 from public.schedules s
      where s.id = schedule_id
      and s.org_id = public.get_my_org_id()
    )
  );

create policy "schedule_entries_update"
  on public.schedule_entries for update
  using (
    public.get_my_role() in ('admin', 'manager')
    and exists (
      select 1 from public.schedules s
      where s.id = schedule_id
      and s.org_id = public.get_my_org_id()
    )
  );

create policy "schedule_entries_delete"
  on public.schedule_entries for delete
  using (
    public.get_my_role() in ('admin', 'manager')
    and exists (
      select 1 from public.schedules s
      where s.id = schedule_id
      and s.org_id = public.get_my_org_id()
    )
  );
