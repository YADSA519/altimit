-- =====================================================================
--  CENIZAS 0.9 · reglas duras
--  · al morir se puede volver a elegir bando (game_reset_faction)
--  · estado compartido del mundo: el suero único que rota (game_state)
--  Pegar en Supabase → SQL Editor → Run (después del 04).
-- =====================================================================
create or replace function public.game_reset_faction() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_approved() then raise exception 'cuenta no habilitada'; end if;
  update public.profiles set faction = null where id = auth.uid();
  update public.game_chars set xp = 0 where user_id = auth.uid();
end;
$$;
revoke all on function public.game_reset_faction() from public;
grant execute on function public.game_reset_faction() to authenticated;

create table if not exists public.game_state (
  k text primary key,
  v jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.game_state enable row level security;
drop policy if exists "ver estado del mundo" on public.game_state;
create policy "ver estado del mundo" on public.game_state for select to authenticated using (public.is_approved());
drop policy if exists "crear estado del mundo" on public.game_state;
create policy "crear estado del mundo" on public.game_state for insert to authenticated with check (public.is_approved());
drop policy if exists "cambiar estado del mundo" on public.game_state;
create policy "cambiar estado del mundo" on public.game_state for update to authenticated using (public.is_approved()) with check (public.is_approved());
grant select, insert, update on public.game_state to authenticated;
