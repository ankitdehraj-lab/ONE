-- ONE WORLD initial Supabase schema
-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create type public.network_id as enum ('human','action','knowledge','opportunity','experience','collective');
create type public.visibility_level as enum ('public','members','private');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or username ~ '^[a-zA-Z0-9_]{3,24}$'),
  display_name text,
  bio text check (bio is null or char_length(bio) <= 500),
  avatar_url text,
  location_label text,
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  body text check (body is null or char_length(body) <= 4000),
  network public.network_id not null,
  post_type text not null default 'post',
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists posts_network_idx on public.posts(network, created_at desc);
create index if not exists posts_user_idx on public.posts(user_id, created_at desc);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments(post_id, created_at);

create table if not exists public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'appreciate',
  created_at timestamptz not null default now(),
  primary key(post_id,user_id,reaction)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  description text,
  status text not null default 'open' check(status in ('open','active','completed','archived')),
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key(project_id,user_id)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  opportunity_type text not null default 'collaboration',
  location_label text,
  remote boolean not null default true,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  location_label text,
  is_online boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text,
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key(community_id,user_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(conversation_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at);

-- Automatically create a profile for each newly registered auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, display_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable RLS on all user-facing tables.
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.opportunities enable row level security;
alter table public.events enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- Profiles: public read; owner can edit.
create policy "Profiles are viewable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid()=id);

-- Posts: public posts readable; members/private visibility is restricted to author for this MVP.
create policy "Read public or own posts" on public.posts for select using (visibility='public' or user_id=auth.uid());
create policy "Create own posts" on public.posts for insert with check (user_id=auth.uid());
create policy "Update own posts" on public.posts for update using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "Delete own posts" on public.posts for delete using (user_id=auth.uid());

create policy "Read follows" on public.follows for select using (true);
create policy "Follow as self" on public.follows for insert with check (follower_id=auth.uid());
create policy "Unfollow as self" on public.follows for delete using (follower_id=auth.uid());

create policy "Read comments on readable posts" on public.comments for select using (
 exists(select 1 from public.posts p where p.id=post_id and (p.visibility='public' or p.user_id=auth.uid()))
);
create policy "Write own comments" on public.comments for insert with check(user_id=auth.uid());
create policy "Delete own comments" on public.comments for delete using(user_id=auth.uid());

create policy "Read reactions" on public.reactions for select using(true);
create policy "React as self" on public.reactions for insert with check(user_id=auth.uid());
create policy "Remove own reaction" on public.reactions for delete using(user_id=auth.uid());

create policy "Read public or own projects" on public.projects for select using(visibility='public' or owner_id=auth.uid());
create policy "Create own projects" on public.projects for insert with check(owner_id=auth.uid());
create policy "Update own projects" on public.projects for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "Read project memberships" on public.project_members for select using(user_id=auth.uid() or exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "Join project as self" on public.project_members for insert with check(user_id=auth.uid());
create policy "Leave project as self" on public.project_members for delete using(user_id=auth.uid());

create policy "Read opportunities" on public.opportunities for select using(status='open' or owner_id=auth.uid());
create policy "Create own opportunities" on public.opportunities for insert with check(owner_id=auth.uid());
create policy "Update own opportunities" on public.opportunities for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "Read events" on public.events for select using(true);
create policy "Create own events" on public.events for insert with check(owner_id=auth.uid());
create policy "Update own events" on public.events for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "Read communities" on public.communities for select using(visibility='public' or owner_id=auth.uid());
create policy "Create own communities" on public.communities for insert with check(owner_id=auth.uid());
create policy "Update own communities" on public.communities for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "Read community members" on public.community_members for select using(true);
create policy "Join community as self" on public.community_members for insert with check(user_id=auth.uid());
create policy "Leave community as self" on public.community_members for delete using(user_id=auth.uid());

-- Conversations/messages: security-definer helper avoids recursive RLS evaluation.
create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation and cm.user_id = auth.uid()
  );
$$;

create policy "Read own conversations" on public.conversations for select using(
 public.is_conversation_member(id)
);
create policy "Create conversation" on public.conversations for insert with check(auth.uid() is not null);
create policy "Read own conversation members" on public.conversation_members for select using(
 public.is_conversation_member(conversation_id)
);
create policy "Add self to conversation" on public.conversation_members for insert with check(user_id=auth.uid());
create policy "Read messages in own conversations" on public.messages for select using(
 exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid())
);
create policy "Send messages in own conversations" on public.messages for insert with check(
 sender_id=auth.uid() and exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid())
);

-- Storage bucket for user media. Create bucket in Dashboard or uncomment the insert below.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('user-media','user-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
create policy "Public media read" on storage.objects for select using(bucket_id='user-media');
create policy "Upload to own folder" on storage.objects for insert with check(bucket_id='user-media' and auth.uid()::text=(storage.foldername(name))[1]);
create policy "Update own media" on storage.objects for update using(bucket_id='user-media' and auth.uid()::text=(storage.foldername(name))[1]);
create policy "Delete own media" on storage.objects for delete using(bucket_id='user-media' and auth.uid()::text=(storage.foldername(name))[1]);

-- Enable Realtime for messages (safe to run if already added).
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
