-- 01_functions.sql: the functions the triggers in 02 call (D-STK-5).
-- Applied by `yarn db:setup` after `yarn db:migrate`, in file-name order.
-- Idempotent: every statement is `create or replace`, so a rerun changes nothing.

-- Sets updated_at on every update, so the column never depends on app code.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Mirrors each new Supabase auth user into public.users. Supabase Auth writes
-- auth.users itself (sign-up, magic link, OAuth, admin), so the database, not
-- app code, keeps the two in step. SECURITY DEFINER lets the trigger write
-- public.users whichever role inserted the auth row; the empty search_path
-- makes every name below schema-qualified.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Keeps public.users.email in step when the auth email changes.
create or replace function public.handle_auth_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$;

-- Trigger functions are called by triggers only; no client role may call them.
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.handle_auth_user_email_change() from public, anon, authenticated;
