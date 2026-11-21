-- =====================================================================
--  CLONES: cuando un jugador muere deja un clon Oscuro con sus cosas.
--  Queda guardado en el mapa (lo ven todos) hasta que alguien lo mata.
--  El que lo mata se queda con todo (también puede ser el dueño).
--  Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- =====================================================================
create table if not exists public.game_clones (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  nick text,
  mode text not null default 'h',
  map text not null,
  x int not null,
  y int not null,
  lvl int default 1,
  look jsonb,
  items jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists game_clones_map on public.game_clones (mode, map, created_at desc);
alter table public.game_clones enable row level security;
drop policy if exists "clones_ver" on public.game_clones;
create policy "clones_ver" on public.game_clones for select to authenticated using (true);
drop policy if exists "clones_crear" on public.game_clones;
create policy "clones_crear" on public.game_clones for insert to authenticated with check (owner = auth.uid());

-- Reclamar el botín: lo borra y devuelve las cosas en un solo paso (solo uno se lo puede llevar)
create or replace function public.claim_clone(cid uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare it jsonb;
begin
  delete from public.game_clones where id = cid returning items into it;
  return it;
end $$;
revoke all on function public.claim_clone(uuid) from public;
grant execute on function public.claim_clone(uuid) to authenticated;

-- Limpieza: los clones de más de 7 días se borran solos cuando se crea uno nuevo
create or replace function public.clones_limpiar() returns trigger language plpgsql security definer set search_path = public as $$
begin delete from public.game_clones where created_at < now() - interval '7 days'; return new; end $$;
drop trigger if exists clones_limpiar on public.game_clones;
create trigger clones_limpiar after insert on public.game_clones for each statement execute function public.clones_limpiar();
