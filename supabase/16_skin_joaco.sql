-- =====================================================================
--  Skin de Joaco para la cuenta nueva de Joaco.
--  Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- =====================================================================

-- La lista cerrada de skins (del archivo 14) no incluye a joaco: se saca,
-- así cualquier personaje dibujado puede ser skin (como en el archivo 11).
alter table public.game_skins drop constraint if exists game_skins_skin_check;

-- Le da la skin a la cuenta cuyo nombre empieza con "joaco"
insert into public.game_skins (user_id, skin)
select id, 'joaco' from public.profiles where lower(nick) like 'joaco%'
on conflict do nothing;

-- Control: qué cuentas la recibieron
select p.nick, p.created_at, g.skin from public.game_skins g
join public.profiles p on p.id = g.user_id
where g.skin = 'joaco';
