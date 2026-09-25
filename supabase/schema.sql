create table if not exists public.spots (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  position int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.spots enable row level security;

drop policy if exists "spots_select_own" on public.spots;
drop policy if exists "spots_insert_own" on public.spots;
drop policy if exists "spots_update_own" on public.spots;
drop policy if exists "spots_delete_own" on public.spots;

create policy "spots_select_own" on public.spots
  for select to authenticated using (auth.uid() = user_id);

create policy "spots_insert_own" on public.spots
  for insert to authenticated with check (auth.uid() = user_id);

create policy "spots_update_own" on public.spots
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "spots_delete_own" on public.spots
  for delete to authenticated using (auth.uid() = user_id);
