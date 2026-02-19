-- Create disputes table
create table if not exists disputes (
  id uuid default gen_random_uuid() primary key,
  deal_id uuid references deals(id) on delete cascade not null,
  initiator_address text not null,
  reason text not null,
  evidence_links text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add simple RLS policies
alter table disputes enable row level security;

-- Allow anyone to read disputes (public)
create policy "Disputes are viewable by everyone"
  on disputes for select
  using ( true );

-- Allow anyone to insert (authenticated or anon) - for now to match current flow
-- Ideally should check if user is participant, but for MVP/Hackathon open is fine or authenticated
create policy "Anyone can create disputes"
  on disputes for insert
  with check ( true );
