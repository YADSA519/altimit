-- =====================================================================
--  CENIZAS 0.7 · mochila (items y equipo)
--  Pegar en Supabase → SQL Editor → Run (después del 03).
-- =====================================================================
alter table public.game_chars add column if not exists inv jsonb not null default '{}'::jsonb;
