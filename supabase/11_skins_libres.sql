-- =====================================================================
--  CENIZAS · cualquier personaje dibujado puede ser skin
--  1) Se saca la lista cerrada de skins (ya no hace falta actualizarla).
--  2) Ejemplo: Blue recibe a Azu. Para otro: cambiar el nombre y la skin.
--     La skin es el nombre del dibujo: azu, jem, sofia_buena, el_sabio, etc.
-- =====================================================================
alter table public.game_skins drop constraint if exists game_skins_skin_check;

insert into public.game_skins (user_id, skin)
select id, 'azu' from public.profiles where lower(nick) = 'blue'
on conflict do nothing;

select p.nick, g.skin from public.game_skins g
join public.profiles p on p.id = g.user_id where lower(p.nick) = 'blue';
