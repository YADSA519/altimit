-- =====================================================================
--  CENIZAS 1.0 · jefes que se desbloquean entre todos
--  · best_xp: el mejor nivel que alcanzó cada uno (aunque después muera)
--  · game_unlocks(): revisa cuántos llegaron a cada nivel, desbloquea
--    para siempre y publica la noticia en NEWS la primera vez.
--  Pegar en Supabase → SQL Editor → Run (después del 05).
-- =====================================================================
alter table public.game_chars add column if not exists best_xp integer not null default 0;
update public.game_chars set best_xp = greatest(best_xp, xp);

create or replace function public.game_unlocks() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  cur jsonb; nxt jsonb; c10 int; c20 int; c30 int; c60 int;
begin
  if not public.is_approved() then return '{}'::jsonb; end if;
  -- nivel = floor(sqrt(xp/50)) + 1  →  10: 4050 · 20: 18050 · 30: 42050 · 60: 174050
  select count(*) filter (where best_xp >= 4050), count(*) filter (where best_xp >= 18050),
         count(*) filter (where best_xp >= 42050), count(*) filter (where best_xp >= 174050)
    into c10, c20, c30, c60 from public.game_chars;
  select v into cur from public.game_state where k = 'unlocks' for update;
  cur := coalesce(cur, '{}'::jsonb); nxt := cur;
  if c10 >= 2 and not (cur ? 'incinerario') then nxt := nxt || '{"incinerario": true}';
    insert into public.news (category, title, body, source) values ('evento', 'SE DESBLOQUEÓ EL PRIMER JEFE: LOS INCINERARIOS',
      'Dos sobrevivientes llegaron al nivel 10. Desde ahora, en el Barrio, el Subte y el Complejo aparecen los Incinerarios: Oscuros que arden por dentro y tiran bolas de fuego desde lejos.', 'Radio de las cenizas'); end if;
  if c20 >= 2 and not (cur ? 'mole') then nxt := nxt || '{"mole": true}';
    insert into public.news (category, title, body, source) values ('evento', 'SE DESBLOQUEÓ EL SEGUNDO JEFE: LA MOLE',
      'Dos sobrevivientes llegaron al nivel 20. La Mole ronda el Subte y el Complejo: pega dos veces y a la tercera te manda lejos. Saca mucha vida.', 'Radio de las cenizas'); end if;
  if c30 >= 3 and not (cur ? 'jefe') then nxt := nxt || '{"jefe": true}';
    insert into public.news (category, title, body, source) values ('evento', 'SE DESBLOQUEÓ EL TERCER JEFE: MERCEDES',
      'Tres sobrevivientes llegaron al nivel 30. En la Zona Inferior del Complejo despertó Mercedes, la mala: rápida, pega sin parar, se teletransporta y tira fuego. Vayan juntos.', 'Radio de las cenizas'); end if;
  if c60 >= 3 and not (cur ? 'sofia') then nxt := nxt || '{"sofia": true}';
    insert into public.news (category, title, body, source) values ('evento', 'SE DESBLOQUEÓ EL CUARTO JEFE: SOFÍA',
      'Tres sobrevivientes llegaron al nivel 60. Sofía apareció en el Corredor Subterráneo: tira cuchillos de lejos, desaparece y deja nubes tóxicas. Quien la derrote se lleva una habilidad.', 'Radio de las cenizas'); end if;
  if nxt <> cur or not exists (select 1 from public.game_state where k = 'unlocks') then
    insert into public.game_state (k, v, updated_at) values ('unlocks', nxt, now())
      on conflict (k) do update set v = excluded.v, updated_at = now();
  end if;
  return nxt;
end;
$$;
revoke all on function public.game_unlocks() from public;
grant execute on function public.game_unlocks() to authenticated;
