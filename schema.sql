
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user',
  xp integer default 0,
  onboarding_completed boolean default false,
  unlocked_achievements text[] default '{}'
);
alter table public.profiles enable row level security;
-- Drop policies if they exist to avoid errors on re-run
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 2. PROJECTS
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  vision text,
  category text,
  status text,
  created_at timestamptz default now()
);
alter table public.projects enable row level security;
drop policy if exists "Users can all own projects" on projects;
create policy "Users can all own projects" on projects for all using (auth.uid() = user_id);

-- 3. TASKS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text,
  priority text,
  estimated_hours numeric,
  deadline timestamptz,
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
drop policy if exists "Users can all own tasks" on tasks;
create policy "Users can all own tasks" on tasks for all using (auth.uid() = user_id);

-- 4. SUBTASKS
create table if not exists public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  is_completed boolean default false
);
alter table public.subtasks enable row level security;
drop policy if exists "Users can all own subtasks" on subtasks;
create policy "Users can all own subtasks" on subtasks for all using (auth.uid() = user_id);

-- 5. GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects(id) on delete cascade,
  description text not null
);
alter table public.goals enable row level security;
drop policy if exists "Users can all own goals" on goals;
create policy "Users can all own goals" on goals for all using (auth.uid() = user_id);

-- 6. KPIS
create table if not exists public.kpis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  current_value numeric default 0,
  target_value numeric default 100,
  unit text,
  update_frequency text
);
alter table public.kpis enable row level security;
drop policy if exists "Users can all own kpis" on kpis;
create policy "Users can all own kpis" on kpis for all using (auth.uid() = user_id);

-- 7. HABITS
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  time_of_day text,
  last_completed_date text,
  streak integer default 0
);
alter table public.habits enable row level security;
drop policy if exists "Users can all own habits" on habits;
create policy "Users can all own habits" on habits for all using (auth.uid() = user_id);

-- 8. SCHEDULE
create table if not exists public.schedule (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  start_time text,
  end_time text,
  type text,
  date text,
  is_completed boolean default false,
  description text
);
alter table public.schedule enable row level security;
drop policy if exists "Users can all own schedule" on schedule;
create policy "Users can all own schedule" on schedule for all using (auth.uid() = user_id);

-- 9. WEEKLY GOALS
create table if not exists public.weekly_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  week_start_date text,
  title text not null,
  is_completed boolean default false,
  category text
);
alter table public.weekly_goals enable row level security;
drop policy if exists "Users can all own weekly goals" on weekly_goals;
create policy "Users can all own weekly goals" on weekly_goals for all using (auth.uid() = user_id);

-- 10. STRATEGIC PLANS
create table if not exists public.strategic_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  horizon text not null, -- '1 Year', '6 Months', '3 Months', '1 Month', '2 Weeks'
  title text not null,
  description text,
  category text default 'Personal', -- Added category column
  start_date text,
  end_date text,
  progress integer default 0,
  is_achieved boolean default false,
  created_at timestamptz default now()
);
alter table public.strategic_plans enable row level security;
drop policy if exists "Users can all own strategic plans" on strategic_plans;
create policy "Users can all own strategic plans" on strategic_plans for all using (auth.uid() = user_id);

-- 11. PLANS (SaaS)
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  features text[],
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.plans enable row level security;
drop policy if exists "Anyone can read active plans" on plans;
drop policy if exists "Admins can manage plans" on plans;

create policy "Anyone can read active plans" on plans for select using (is_active = true);
create policy "Admins can manage plans" on plans for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 12. SUBSCRIPTIONS (SaaS)
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  plan_id uuid references plans(id),
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists "Users can read own subscription" on subscriptions;
drop policy if exists "Admins can view all subscriptions" on subscriptions;

create policy "Users can read own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Admins can view all subscriptions" on subscriptions for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 13. TRIGGER for User Creation
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role, xp, onboarding_completed, unlocked_achievements)
  values (
    new.id, 
    new.email, 
    case when new.email = 'admin@gmail.com' then 'admin' else 'user' end,
    0,
    false,
    '{}'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists to avoid duplication errors
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 14. SEED DATA (Only insert if not exists)
insert into plans (name, price, features) 
select 'Free Tier', 0, '{"Basic Project Management", "Manual Task Entry", "1 Brain Dump / Day"}'
where not exists (select 1 from plans where name = 'Free Tier');

insert into plans (name, price, features) 
select 'Pro Founder', 29, '{"Unlimited AI Analysis", "Advanced Scheduling", "Priority Support"}'
where not exists (select 1 from plans where name = 'Pro Founder');
