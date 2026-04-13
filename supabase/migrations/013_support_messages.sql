-- Create support_messages table
create table if not exists public.support_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  language text default 'en' check (language in ('pt', 'en', 'es')),
  status text default 'open' check (status in ('open', 'resolved', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  -- Indexes for performance
  constraint valid_email check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Create index on created_at for recent messages
create index if not exists support_messages_created_at_idx on public.support_messages(created_at desc);

-- Create index on status
create index if not exists support_messages_status_idx on public.support_messages(status);

-- Create index on email for lookup
create index if not exists support_messages_email_idx on public.support_messages(email);

-- Enable RLS
alter table public.support_messages enable row level security;

-- RLS Policies
-- Allow anyone to insert (to submit support messages)
create policy "anyone_can_insert_support_messages"
  on public.support_messages
  for insert
  with check (true);

-- Allow admins to read all support messages
create policy "admins_can_read_all_support_messages"
  on public.support_messages
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.role = 'super_admin' or profiles.role = 'admin')
    )
  );

-- Update trigger for updated_at
create or replace function update_support_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists support_messages_updated_at_trigger on public.support_messages;
create trigger support_messages_updated_at_trigger
  before update on public.support_messages
  for each row
  execute function update_support_messages_updated_at();
