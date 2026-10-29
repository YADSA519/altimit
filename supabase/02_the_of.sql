-- =====================================================================
--  THE O|F · actualización 0.4
--  Pegar entero en Supabase → SQL Editor → Run (después del 01).
--  Se puede correr más de una vez sin romper nada.
-- =====================================================================

-- ---------- BANDO: se elige una sola vez ----------
alter table public.profiles add column if not exists faction text
  check (faction in ('rebel','ork'));

create or replace function public.set_faction(f text) returns text
language plpgsql security definer set search_path = public as $$
declare cur text;
begin
  if f not in ('rebel','ork') then raise exception 'bando inválido'; end if;
  select faction into cur from public.profiles where id = auth.uid();
  if cur is not null then return cur; end if;          -- no hay vuelta atrás
  update public.profiles set faction = f where id = auth.uid();
  return f;
end;
$$;
grant execute on function public.set_faction(text) to authenticated;

-- el admin puede resetear el bando de alguien (para el futuro "reset pago")
create or replace function public.admin_reset_faction(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'solo admin'; end if;
  update public.profiles set faction = null where id = target;
end;
$$;
grant execute on function public.admin_reset_faction(uuid) to authenticated;

-- ---------- MAIL como chat: asunto opcional + invitaciones ----------
alter table public.mails alter column subject drop not null;
alter table public.mails drop constraint if exists mails_subject_check;
alter table public.mails drop constraint if exists mails_subject_len;
alter table public.mails add constraint mails_subject_len check (subject is null or char_length(subject) <= 140);
alter table public.mails add column if not exists kind text not null default 'msg' check (kind in ('msg','inv'));
alter table public.mails add column if not exists inv_state text check (inv_state in ('pending','accepted','declined'));

create or replace function public.answer_invite(mail_id bigint, accept boolean) returns void
language sql security definer set search_path = public as $$
  update public.mails set inv_state = case when accept then 'accepted' else 'declined' end, read_at = coalesce(read_at, now())
  where id = mail_id and recipient = auth.uid() and kind = 'inv';
$$;
grant execute on function public.answer_invite(bigint, boolean) to authenticated;

-- marcar como leída toda una conversación
create or replace function public.mark_thread_read(other uuid) returns void
language sql security definer set search_path = public as $$
  update public.mails set read_at = now() where recipient = auth.uid() and sender = other and read_at is null;
$$;
grant execute on function public.mark_thread_read(uuid) to authenticated;

-- ---------- NEWS: fuente del mundo, eventos y bando ----------
alter table public.news add column if not exists source text;
alter table public.news add column if not exists event_at timestamptz;
alter table public.news add column if not exists faction text check (faction in ('rebel','ork'));   -- null = para todos
alter table public.news add column if not exists image_path text;

drop policy if exists "leer news" on public.news;
create policy "leer news" on public.news for select to authenticated using (
  public.is_approved() and (
    faction is null or public.is_admin()
    or faction = (select p.faction from public.profiles p where p.id = auth.uid())
  ));

-- ---------- permisos de ejecución de lo anterior ----------
grant execute on function public.mark_mail_read(bigint) to authenticated;
grant execute on function public.mark_seen(text, bigint) to authenticated;
