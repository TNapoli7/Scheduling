-- ============================================================
-- MAPA DE HORARIO - Database Schema
-- Run this in Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── ORGANIZATIONS ──────────────────────────────────────────
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sector text not null default 'pharmacy', -- pharmacy, clinic, dental, lab, physio
  address text,
  municipal_holiday date, -- feriado municipal
  operating_hours jsonb not null default '{
    "monday":    {"open": "09:00", "close": "19:00", "closed": false},
    "tuesday":   {"open": "09:00", "close": "19:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "19:00", "closed": false},
    "thursday":  {"open": "09:00", "close": "19:00", "closed": false},
    "friday":    {"open": "09:00", "close": "19:00", "closed": false},
    "saturday":  {"open": "09:00", "close": "13:00", "closed": false},
    "sunday":    {"open": "00:00", "close": "00:00", "closed": true}
  }'::jsonb,
  subscription_tier text not null default 'trial', -- trial, starter, professional, business
  subscription_status text not null default 'trialing', -- trialing, active, past_due, canceled
  trial_ends_at timestamptz default (now() + interval '14 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── PROFILES (extends Supabase Auth users) ─────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null default 'employee', -- admin, manager, employee
  credential text, -- farmaceutico, tecnico, auxiliar, enfermeiro, medico, etc.
  contract_type text not null default 'full_time', -- full_time, part_time
  weekly_hours integer not null default 40,
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── SHIFT TEMPLATES ────────────────────────────────────────
create table public.shift_templates (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, -- 'Manha', 'Tarde', 'Noite', 'Partido'
  start_time time not null,
  end_time time not null,
  min_staff integer not null default 1,
  required_roles jsonb default '[]'::jsonb, -- e.g. [{"role": "farmaceutico", "min": 1}]
  color text not null default '#3B82F6', -- hex color for calendar display
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- ─── SCHEDULES (monthly container) ──────────────────────────
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  month integer not null, -- 1-12
  year integer not null,
  status text not null default 'draft', -- draft, published, archived
  fairness_score numeric(5,2),
  created_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id, month, year)
);

-- ─── SCHEDULE ENTRIES (individual shift assignments) ─────────
create table public.schedule_entries (
  id uuid default uuid_generate_v4() primary key,
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  shift_template_id uuid not null references public.shift_templates(id),
  is_holiday boolean not null default false,
  overtime_hours numeric(4,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- Index for fast calendar queries
create index idx_entries_schedule_date on public.schedule_entries(schedule_id, date);
create index idx_entries_user_date on public.schedule_entries(user_id, date);

-- ─── AVAILABILITY ───────────────────────────────────────────
create table public.availability (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  available boolean not null default true,
  preference text not null default 'neutral', -- preferred, neutral, avoid
  reason text,
  is_recurring boolean not null default false, -- weekly recurring
  recurring_day integer, -- 0=Sunday, 1=Monday, ... 6=Saturday
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ─── SWAP REQUESTS ──────────────────────────────────────────
create table public.swap_requests (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid not null references public.profiles(id),
  target_id uuid not null references public.profiles(id),
  entry_id uuid not null references public.schedule_entries(id) on delete cascade,
  target_entry_id uuid references public.schedule_entries(id), -- the shift being offered in return
  status text not null default 'pending', -- pending, approved, rejected
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ─── COMPLIANCE LOG ─────────────────────────────────────────
create table public.compliance_logs (
  id uuid default uuid_generate_v4() primary key,
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  user_id uuid references public.profiles(id),
  rule_code text not null, -- e.g. 'REST_11H', 'MAX_WEEKLY_40H', 'OVERTIME_150H'
  severity text not null default 'warning', -- warning, block
  details text not null,
  date date,
  created_at timestamptz default now()
);

-- ─── FAIRNESS METRICS ───────────────────────────────────────
create table public.fairness_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  month integer not null,
  year integer not null,
  nights_count integer not null default 0,
  weekends_count integer not null default 0,
  holidays_count integer not null default 0,
  total_hours numeric(6,2) not null default 0,
  overtime_hours numeric(6,2) not null default 0,
  fairness_score numeric(5,2),
  created_at timestamptz default now(),
  unique(user_id, month, year)
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- schedule_published, swap_request, swap_approved, swap_rejected, reminder
  title text not null,
  body text,
  is_read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

-- ─── PORTUGUESE HOLIDAYS (pre-loaded) ───────────────────────
create table public.national_holidays (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  name text not null,
  year integer not null
);

-- 2026 Portuguese national holidays
insert into public.national_holidays (date, name, year) values
  ('2026-01-01', 'Ano Novo', 2026),
  ('2026-04-03', 'Sexta-feira Santa', 2026),
  ('2026-04-05', 'Domingo de Pascoa', 2026),
  ('2026-04-25', 'Dia da Liberdade', 2026),
  ('2026-05-01', 'Dia do Trabalhador', 2026),
  ('2026-06-04', 'Corpo de Deus', 2026),
  ('2026-06-10', 'Dia de Portugal', 2026),
  ('2026-08-15', 'Assuncao de Nossa Senhora', 2026),
  ('2026-10-05', 'Implantacao da Republica', 2026),
  ('2026-11-01', 'Dia de Todos os Santos', 2026),
  ('2026-12-01', 'Restauracao da Independencia', 2026),
  ('2026-12-08', 'Imaculada Conceicao', 2026),
  ('2026-12-25', 'Natal', 2026);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.shift_templates enable row level security;
alter table public.schedules enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.availability enable row level security;
alter table public.swap_requests enable row level security;
alter table public.compliance_logs enable row level security;
alter table public.fairness_metrics enable row level security;
alter table public.notifications enable row level security;
alter table public.national_holidays enable row level security;

-- Profiles: users can read org members, update own profile
create policy "Users can view own org profiles"
  on public.profiles for select
  using (org_id = (select org_id from public.profiles where id = auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Admins can manage profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
      and org_id = profiles.org_id
    )
  );

-- Organizations: members can read, admins can update
create policy "Members can view own org"
  on public.organizations for select
  using (
    id in (select org_id from public.profiles where id = auth.uid())
  );

create policy "Admins can update own org"
  on public.organizations for update
  using (
    id in (select org_id from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Shift templates: org members read, admins/managers write
create policy "Members can view shift templates"
  on public.shift_templates for select
  using (org_id in (select org_id from public.profiles where id = auth.uid()));

create policy "Managers can manage shift templates"
  on public.shift_templates for all
  using (
    org_id in (
      select org_id from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Schedules: org members read, admins/managers write
create policy "Members can view schedules"
  on public.schedules for select
  using (org_id in (select org_id from public.profiles where id = auth.uid()));

create policy "Managers can manage schedules"
  on public.schedules for all
  using (
    org_id in (
      select org_id from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Schedule entries: org members read, managers write
create policy "Members can view schedule entries"
  on public.schedule_entries for select
  using (
    schedule_id in (
      select s.id from public.schedules s
      join public.profiles p on p.org_id = s.org_id
      where p.id = auth.uid()
    )
  );

create policy "Managers can manage schedule entries"
  on public.schedule_entries for all
  using (
    schedule_id in (
      select s.id from public.schedules s
      join public.profiles p on p.org_id = s.org_id
      where p.id = auth.uid() and p.role in ('admin', 'manager')
    )
  );

-- Availability: users manage own, managers can view all in org
create policy "Users can manage own availability"
  on public.availability for all
  using (user_id = auth.uid());

create policy "Managers can view org availability"
  on public.availability for select
  using (
    user_id in (
      select p2.id from public.profiles p1
      join public.profiles p2 on p1.org_id = p2.org_id
      where p1.id = auth.uid() and p1.role in ('admin', 'manager')
    )
  );

-- Swap requests: involved users + managers
create policy "Users can view own swap requests"
  on public.swap_requests for select
  using (requester_id = auth.uid() or target_id = auth.uid());

create policy "Users can create swap requests"
  on public.swap_requests for insert
  with check (requester_id = auth.uid());

create policy "Managers can manage swap requests"
  on public.swap_requests for all
  using (
    exists (
      select 1 from public.profiles p1
      join public.profiles p2 on p1.org_id = p2.org_id
      where p1.id = auth.uid() and p1.role in ('admin', 'manager')
      and p2.id = swap_requests.requester_id
    )
  );

-- Compliance logs: managers can view
create policy "Managers can view compliance logs"
  on public.compliance_logs for select
  using (
    schedule_id in (
      select s.id from public.schedules s
      join public.profiles p on p.org_id = s.org_id
      where p.id = auth.uid() and p.role in ('admin', 'manager')
    )
  );

-- Fairness metrics: own metrics + managers see all
create policy "Users can view own fairness"
  on public.fairness_metrics for select
  using (user_id = auth.uid());

create policy "Managers can view org fairness"
  on public.fairness_metrics for select
  using (
    org_id in (
      select org_id from public.profiles
      where id = auth.uid() and role in ('admin', 'manager')
    )
  );

-- Notifications: users see own
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- National holidays: public read
create policy "Anyone can view holidays"
  on public.national_holidays for select
  using (true);

-- ─── FUNCTIONS ──────────────────────────────────────────────

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_org_updated
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_schedule_updated
  before update on public.schedules
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
