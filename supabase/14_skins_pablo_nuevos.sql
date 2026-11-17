-- =====================================================================
--  Skins nuevas de Pablo (casual y futuro) para la cuenta de Thiriang.
--  Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez.
--  (El juego ya se las muestra a esa cuenta aunque no corras esto.)
-- =====================================================================
alter table public.game_skins drop constraint if exists game_skins_skin_check;
alter table public.game_skins add constraint game_skins_skin_check
  check (skin in ('pablo','pablo2','pablo3','pablo4','pabloFuturo','pol','polAlter','renzo','sam',
                  'eze','esteban','giuliana','lean','luis','norbert','toby','tomy'));
insert into public.game_skins (user_id, skin)
select p.id, s.skin from (values ('xhiang','pablo4'), ('xhiang','pabloFuturo'), ('pablo','pablo4'), ('pablo','pabloFuturo')) as s(nick, skin)
join public.profiles p on lower(p.nick) = s.nick
on conflict do nothing;
