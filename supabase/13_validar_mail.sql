-- THE O|F · validación por mail
-- Cuando alguien confirma su mail (toca el botón del correo de registro), su cuenta pasa sola a "approved".
-- El admin igual puede habilitar, rechazar o bloquear a mano desde ADMIN.
-- Requisito en Supabase: Authentication → Sign In / Providers → Email → activar "Confirm email".
create or replace function public.theof_mail_confirmado() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set status = 'approved' where id = new.id and status = 'pending';
  end if;
  return new;
end $$;

drop trigger if exists theof_mail_confirmado on auth.users;
create trigger theof_mail_confirmado
  after update of email_confirmed_at on auth.users
  for each row execute function public.theof_mail_confirmado();
