-- =====================================================================
--  CENIZAS 0.1 · personaje, posición y progreso
--  Pegar en Supabase → SQL Editor → Run (después del 01 y el 02).
-- =====================================================================
create table if not exists public.game_chars (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  look        jsonb not null default '{}'::jsonb,
  zone        text not null default 'parque',
  x           real not null default 0,
  y           real not null default 0,
  hp          integer not null default 100,
  xp          integer not null default 0,
  kills       integer not null default 0,
  updated_at  timestamptz not null default now()
);
alter table public.game_chars enable row level security;

drop policy if exists "ver personajes" on public.game_chars;
create policy "ver personajes" on public.game_chars for select to authenticated using (public.is_approved());

drop policy if exists "crear mi personaje" on public.game_chars;
create policy "crear mi personaje" on public.game_chars for insert to authenticated
  with check (user_id = auth.uid() and public.is_approved());

drop policy if exists "guardar mi personaje" on public.game_chars;
create policy "guardar mi personaje" on public.game_chars for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "admin borra personajes" on public.game_chars;
create policy "admin borra personajes" on public.game_chars for delete to authenticated using (public.is_admin() or user_id = auth.uid());

grant select, insert, update, delete on public.game_chars to authenticated;
