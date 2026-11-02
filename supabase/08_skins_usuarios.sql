-- =====================================================================
--  CENIZAS 1.4 · skins por usuario (la skin queda atada a la CUENTA)
--  Pegar en Supabase → SQL Editor → Run. Se puede correr más de una vez.
-- =====================================================================
alter table public.game_skins drop constraint if exists game_skins_skin_check;
alter table public.game_skins add constraint game_skins_skin_check
  check (skin in ('pablo','pablo2','pablo3','pol','polAlter','renzo','sam',
                  'eze','esteban','giuliana','lean','luis','norbert','toby','tomy'));

insert into public.game_skins (user_id, skin)
select p.id, s.skin
from (values
  ('eche','eze'), ('estebjob64','esteban'), ('giuliana','giuliana'), ('lean','lean'),
  ('luna52','luis'), ('norber','norbert'), ('tobito','toby'), ('tomit','tomy'),
  ('untalpol','pol'), ('untalpol','polAlter'),
  ('pablo','pablo'), ('pablo','pablo2'), ('pablo','pablo3'),
  ('xhiang','pablo'), ('xhiang','pablo2'), ('xhiang','pablo3')
) as s(nick, skin)
join public.profiles p on lower(p.nick) = s.nick
on conflict do nothing;

-- control: quién quedó con qué skin
select p.nick, g.skin from public.game_skins g
join public.profiles p on p.id = g.user_id order by 1, 2;
