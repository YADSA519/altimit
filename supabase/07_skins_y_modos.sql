-- =====================================================================
--  CENIZAS 1.3 · skins, cambio de nombre y modo EXPERIMENTAL
--  · game_skins: qué personajes de la historia puede usar cada cuenta.
--    Pablo → la cuenta que HOY se llama Xhiang. Pol → la cuenta Untalpol.
--    (Correr ESTE archivo ANTES de cambiarte el nombre a Pablo: la skin
--     queda atada a la cuenta, no al nombre.)
--  · game_grant_boss_skins(): Renzo y Sam para quien pegó a Mercedes.
--  · set_nick(): cambiar el nombre desde DESKTOP.
--  · game_exp: nivel, mochila y lugar del modo EXPERIMENTAL (aparte).
--  Pegar en Supabase → SQL Editor → Run (después del 06).
-- =====================================================================

-- ---------- skins ----------
create table if not exists public.game_skins (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  skin        text not null check (skin in ('pablo', 'pol', 'renzo', 'sam')),
  granted_at  timestamptz not null default now(),
  primary key (user_id, skin)
);
alter table public.game_skins enable row level security;
drop policy if exists "ver mis skins" on public.game_skins;
create policy "ver mis skins" on public.game_skins for select to authenticated using (user_id = auth.uid() or public.is_admin());
grant select on public.game_skins to authenticated;

insert into public.game_skins (user_id, skin)
  select id, 'pablo' from public.profiles where lower(nick) = 'xhiang'
  on conflict do nothing;
insert into public.game_skins (user_id, skin)
  select id, 'pol' from public.profiles where lower(nick) = 'untalpol'
  on conflict do nothing;

-- Renzo y Sam: solo si Mercedes ya está desbloqueada en el mundo
create or replace function public.game_grant_boss_skins() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_approved() then return; end if;
  if not exists (select 1 from public.game_state where k = 'unlocks' and v ? 'jefe') then return; end if;
  insert into public.game_skins (user_id, skin) values (auth.uid(), 'renzo'), (auth.uid(), 'sam') on conflict do nothing;
end;
$$;
revoke all on function public.game_grant_boss_skins() from public;
grant execute on function public.game_grant_boss_skins() to authenticated;

-- ---------- cambiar el nombre ----------
create or replace function public.set_nick(new_nick text) returns text
language plpgsql security definer set search_path = public as $$
declare n text := trim(new_nick);
begin
  if auth.uid() is null or not public.is_approved() then raise exception 'Tu cuenta no está habilitada'; end if;
  if n !~ '^[A-Za-z0-9_.\-]{3,20}$' then raise exception 'El nombre va de 3 a 20 letras o números, sin espacios'; end if;
  if exists (select 1 from public.profiles where lower(nick) = lower(n) and id <> auth.uid()) then
    raise exception 'Ese nombre ya está usado';
  end if;
  update public.profiles set nick = n where id = auth.uid();
  return n;
end;
$$;
revoke all on function public.set_nick(text) from public;
grant execute on function public.set_nick(text) to authenticated;

-- ---------- modo EXPERIMENTAL: progreso aparte ----------
create table if not exists public.game_exp (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  zone        text,
  x           real not null default 0,
  y           real not null default 0,
  hp          integer not null default 100,
  xp          integer not null default 0,
  kills       integer not null default 0,
  inv         jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.game_exp enable row level security;
drop policy if exists "ver exp" on public.game_exp;
create policy "ver exp" on public.game_exp for select to authenticated using (public.is_approved());
drop policy if exists "crear mi exp" on public.game_exp;
create policy "crear mi exp" on public.game_exp for insert to authenticated with check (user_id = auth.uid() and public.is_approved());
drop policy if exists "guardar mi exp" on public.game_exp;
create policy "guardar mi exp" on public.game_exp for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.game_exp to authenticated;

-- ---------- la jefa ahora se llama solo MERCEDES ----------
update public.news set title = 'SE DESBLOQUEÓ EL TERCER JEFE: MERCEDES'
  where title = 'SE DESBLOQUEÓ EL TERCER JEFE: MERCEDES, EL OSCURO NEGRO';
