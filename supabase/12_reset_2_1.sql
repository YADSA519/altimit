-- THE O|F 2.1 · reinicio de objetos y niveles (opcional: el juego ya lo hace solo la primera vez que entrás a la 2.1)
-- Conserva el aspecto y los personajes desbloqueados (inv.skins). Correr en Supabase > SQL Editor del proyecto del juego.
update public.game_chars
   set xp = 0, kills = 0, hp = 100, zone = null, x = null, y = null,
       inv = jsonb_build_object('items', jsonb_build_object('vendas', 3), 'coins', 10, 'ver', '2.1',
                                'skins', coalesce(inv->'skins', '[]'::jsonb)),
       updated_at = now();
do $$ begin
  if to_regclass('public.game_exp') is not null then
    execute 'update public.game_exp set xp = 0, kills = 0, zone = null, x = null, y = null, inv = jsonb_build_object(''items'', jsonb_build_object(''vendas'', 3), ''ver'', ''2.1''), updated_at = now()';
  end if;
end $$;
-- reglas 2.1: en la HISTORIA no se pierde nivel (salvo 3 caídas seguidas); en PvP nunca.
insert into public.game_state (k, v, updated_at) values ('reglas', '{"muertePierdeNivel": false}', now())
  on conflict (k) do update set v = excluded.v, updated_at = now();
