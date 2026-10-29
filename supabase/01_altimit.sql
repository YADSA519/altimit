-- =====================================================================
--  ALTIMIT OS · base de datos
--  Pegar entero en Supabase → SQL Editor → Run.
--  El PRIMER usuario que se registre queda como admin y habilitado.
-- =====================================================================

-- ---------- USUARIOS ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nick        text not null,
  status      text not null default 'pending' check (status in ('pending','approved','blocked')),
  role        text not null default 'user'    check (role in ('user','admin')),
  created_at  timestamptz not null default now()
);
create unique index if not exists profiles_nick_unique on public.profiles (lower(nick));

-- quién es quién (se usan dentro de las reglas)
create or replace function public.is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'approved');
$$;

-- al registrarse se crea su perfil; el primero es admin
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;
  insert into public.profiles (id, nick, status, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nick'), ''), split_part(new.email, '@', 1)),
    case when first_user then 'approved' else 'pending' end,
    case when first_user then 'admin'    else 'user'    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "ver perfiles" on public.profiles;
create policy "ver perfiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or (public.is_approved() and status = 'approved'));

drop policy if exists "admin edita perfiles" on public.profiles;
create policy "admin edita perfiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin borra perfiles" on public.profiles;
create policy "admin borra perfiles" on public.profiles for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- ---------- MAILER ----------
create table if not exists public.mails (
  id          bigint generated always as identity primary key,
  sender      uuid not null references public.profiles(id) on delete cascade,
  recipient   uuid not null references public.profiles(id) on delete cascade,
  subject     text not null check (char_length(subject) between 1 and 140),
  body        text not null check (char_length(body) between 1 and 8000),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index if not exists mails_recipient_idx on public.mails (recipient, created_at desc);
create index if not exists mails_sender_idx    on public.mails (sender, created_at desc);
alter table public.mails enable row level security;

drop policy if exists "ver mis mails" on public.mails;
create policy "ver mis mails" on public.mails for select to authenticated
  using (sender = auth.uid() or recipient = auth.uid());

drop policy if exists "mandar mails" on public.mails;
create policy "mandar mails" on public.mails for insert to authenticated
  with check (sender = auth.uid() and public.is_approved()
    and exists (select 1 from public.profiles p where p.id = recipient and p.status = 'approved'));

drop policy if exists "borrar mails" on public.mails;
create policy "borrar mails" on public.mails for delete to authenticated
  using (recipient = auth.uid() or sender = auth.uid() or public.is_admin());

-- marcar como leído (solo el destinatario, solo ese dato)
create or replace function public.mark_mail_read(mail_id bigint) returns void
language sql security definer set search_path = public as $$
  update public.mails set read_at = coalesce(read_at, now())
  where id = mail_id and recipient = auth.uid();
$$;

-- ---------- NEWS (escribe solo el admin) ----------
create table if not exists public.news (
  id          bigint generated always as identity primary key,
  author      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  category    text not null default 'general' check (category in ('evento','general','informe')),
  title       text not null check (char_length(title) between 1 and 140),
  body        text not null check (char_length(body) between 1 and 12000),
  created_at  timestamptz not null default now()
);
alter table public.news enable row level security;

drop policy if exists "leer news" on public.news;
create policy "leer news" on public.news for select to authenticated using (public.is_approved());
drop policy if exists "admin escribe news" on public.news;
create policy "admin escribe news" on public.news for insert to authenticated with check (public.is_admin());
drop policy if exists "admin edita news" on public.news;
create policy "admin edita news" on public.news for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin borra news" on public.news;
create policy "admin borra news" on public.news for delete to authenticated using (public.is_admin());

-- ---------- AUDIO y DATA (fotos) ----------
create table if not exists public.audios (
  id          bigint generated always as identity primary key,
  sender      uuid not null references public.profiles(id) on delete cascade,
  recipient   uuid not null references public.profiles(id) on delete cascade,
  path        text not null,
  seconds     integer,
  note        text check (note is null or char_length(note) <= 280),
  created_at  timestamptz not null default now(),
  heard_at    timestamptz
);
create table if not exists public.photos (
  id          bigint generated always as identity primary key,
  sender      uuid not null references public.profiles(id) on delete cascade,
  recipient   uuid not null references public.profiles(id) on delete cascade,
  path        text not null,
  comment     text check (comment is null or char_length(comment) <= 1000),
  created_at  timestamptz not null default now(),
  seen_at     timestamptz
);
alter table public.audios enable row level security;
alter table public.photos enable row level security;

drop policy if exists "ver mis audios" on public.audios;
create policy "ver mis audios" on public.audios for select to authenticated using (sender = auth.uid() or recipient = auth.uid());
drop policy if exists "mandar audios" on public.audios;
create policy "mandar audios" on public.audios for insert to authenticated
  with check (sender = auth.uid() and public.is_approved()
    and exists (select 1 from public.profiles p where p.id = recipient and p.status = 'approved'));
drop policy if exists "borrar audios" on public.audios;
create policy "borrar audios" on public.audios for delete to authenticated using (recipient = auth.uid() or sender = auth.uid() or public.is_admin());

drop policy if exists "ver mis fotos" on public.photos;
create policy "ver mis fotos" on public.photos for select to authenticated using (sender = auth.uid() or recipient = auth.uid());
drop policy if exists "mandar fotos" on public.photos;
create policy "mandar fotos" on public.photos for insert to authenticated
  with check (sender = auth.uid() and public.is_approved()
    and exists (select 1 from public.profiles p where p.id = recipient and p.status = 'approved'));
drop policy if exists "borrar fotos" on public.photos;
create policy "borrar fotos" on public.photos for delete to authenticated using (recipient = auth.uid() or sender = auth.uid() or public.is_admin());

create or replace function public.mark_seen(kind text, item_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if kind = 'audio' then
    update public.audios set heard_at = coalesce(heard_at, now()) where id = item_id and recipient = auth.uid();
  elsif kind = 'photo' then
    update public.photos set seen_at = coalesce(seen_at, now()) where id = item_id and recipient = auth.uid();
  end if;
end;
$$;

-- archivos privados: carpeta = <quien manda>/<quien recibe>/archivo
insert into storage.buckets (id, name, public) values ('audios','audios', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('fotos','fotos', false)   on conflict (id) do nothing;

drop policy if exists "altimit subir" on storage.objects;
create policy "altimit subir" on storage.objects for insert to authenticated
  with check (bucket_id in ('audios','fotos') and public.is_approved()
    and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "altimit ver" on storage.objects;
create policy "altimit ver" on storage.objects for select to authenticated
  using (bucket_id in ('audios','fotos')
    and ((storage.foldername(name))[1] = auth.uid()::text or (storage.foldername(name))[2] = auth.uid()::text));

drop policy if exists "altimit borrar" on storage.objects;
create policy "altimit borrar" on storage.objects for delete to authenticated
  using (bucket_id in ('audios','fotos')
    and ((storage.foldername(name))[1] = auth.uid()::text or (storage.foldername(name))[2] = auth.uid()::text or public.is_admin()));

-- ---------- avisos en vivo ----------
do $$
begin
  begin alter publication supabase_realtime add table public.mails;  exception when others then null; end;
  begin alter publication supabase_realtime add table public.news;   exception when others then null; end;
  begin alter publication supabase_realtime add table public.audios; exception when others then null; end;
  begin alter publication supabase_realtime add table public.photos; exception when others then null; end;
end $$;
