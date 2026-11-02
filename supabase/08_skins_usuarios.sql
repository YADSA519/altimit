-- =====================================================================
--  CENIZAS 1.4 · skins por usuario
--  Cada skin queda atada a la CUENTA (no al nombre): si después alguien
--  se cambia el nombre, la conserva.
--  Pegar en Supabase → SQL Editor → Run (después del 07).
-- =====================================================================

-- se amplía la lista de skins permitidas
alter table public.game_skins drop constraint if exists game_skins_skin_check;
alter table public.game_skins add constraint game_skins_skin_check
  check (skin in ('pablo', 'pablo2', 'pablo3', 'pol', 'polAlter', 'renzo', 'sam',
                  'eze', 'esteban', 'giuliana', 'lean', 'luis', 'norbert', 'toby', 'tomy'));

-- usuario del juego → skin
insert into public.game_skins (user_id, skin)
select p.id, s.skin
from (values
  ('eche',       'eze'),
  ('estebjob64', 'esteban'),
  ('giuliana',   'giuliana'),
  ('lean',       'lean'),
  ('luna52',     'luis'),
  ('norber',     'norbert'),
  ('tobito',     'toby'),
  ('tomit',      'tomy'),
  ('untalpol',   'pol'),
  ('untalpol',   'polAlter'),
  ('xhiang',     'pablo'),
  ('xhiang',     'pablo2'),
  ('xhiang',     'pablo3')
) as s(nick, skin)
join public.profiles p on lower(p.nick) = s.nick
on conflict do nothing;

-- control: quién quedó con qué skin (si falta alguien, revisar cómo está escrito su nombre)
select p.nick, g.skin
from public.game_skins g join public.profiles p on p.id = g.user_id
order by p.nick, g.skin;
