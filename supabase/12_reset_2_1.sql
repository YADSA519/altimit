-- =====================================================================
--  THE O|F 2.1 · REINICIO GENERAL
--  Todos vuelven a elegir bando y arrancan de cero: nivel 1, mochila vacía
--  (3 vendas y el palo), sin misiones hechas, en la base de su bando.
--  Se conservan: la cuenta, el nick y los personajes asignados (game_skins).
--  Pegar entero en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- =====================================================================

-- 1) bando: todos lo vuelven a elegir al entrar
update public.profiles set faction = null;

-- 2) personaje: como si hubiera muerto y perdido todo
update public.game_chars
   set xp = 0, kills = 0, hp = 100,
       zone = 'base', x = 0, y = 0,
       inv = '{}'::jsonb,
       updated_at = now();
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'game_chars' and column_name = 'best_xp') then
    execute 'update public.game_chars set best_xp = 0';
  end if;
end $$;

-- 3) PvP: se borra el progreso aparte
do $$ begin
  if to_regclass('public.game_exp') is not null then
    execute 'delete from public.game_exp';
  end if;
end $$;

-- 4) marca de reinicio: el juego la ve y borra también lo guardado en cada teléfono
insert into public.game_state (k, v, updated_at)
values ('reglas', jsonb_build_object('muertePierdeNivel', false, 'reset', to_char(now(), 'YYYYMMDDHH24MISS')), now())
on conflict (k) do update set v = excluded.v, updated_at = now();

-- control: tiene que dar 0 en las dos columnas
select count(*) filter (where faction is not null) as con_bando,
       (select count(*) from public.game_chars where xp > 0) as con_nivel
  from public.profiles;
