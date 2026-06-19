create table child_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  avatar text not null,
  age int,
  total_points int not null default 0,
  created_at timestamptz not null default now()
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_url text not null,
  youtube_id text not null,
  title text,
  status text not null default 'processing' check (status in ('processing','ready','rejected')),
  reject_reason text,
  transcript text,
  created_at timestamptz not null default now(),
  unique (user_id, youtube_id)
);

create table video_assignments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (video_id, child_profile_id)
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_index int not null check (correct_index between 0 and 3),
  source_quote text not null,
  position int not null default 0
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  base_points int not null,
  bonus_points int not null,
  answers jsonb not null,
  completed_at timestamptz not null default now()
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (child_profile_id, video_id)
);

create table vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  points_cost int not null,
  is_active boolean not null default true
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  voucher_id uuid not null references vouchers(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

create table parent_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text
);
