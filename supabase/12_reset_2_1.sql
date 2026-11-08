-- THE O|F 2.1 · reinicio de NIVEL y LUGAR (todos arrancan en la base de su bando). La mochila se conserva.
-- Opcional: el juego ya lo hace solo la primera vez que cada uno entra a esta versión.
update public.game_chars set xp = 0, kills = 0, hp = 100, zone = null, x = null, y = null, updated_at = now();
do $$ begin
  if to_regclass('public.game_exp') is not null then
    execute 'update public.game_exp set xp = 0, kills = 0, zone = null, x = null, y = null, updated_at = now()';
  end if;
end $$;
insert into public.game_state (k, v, updated_at) values ('reglas', '{"muertePierdeNivel": false}', now())
  on conflict (k) do update set v = excluded.v, updated_at = now();
