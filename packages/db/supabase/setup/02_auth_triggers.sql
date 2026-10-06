-- 02_auth_triggers.sql: the triggers on Supabase's auth.users (D-STK-5).
-- They live here, never in a migration: Supabase owns the auth schema, and
-- `yarn check-migrations` fails any migration that touches it.
-- Idempotent: each trigger is dropped if present, then created.

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- The WHEN clause skips the updates every sign-in makes to auth.users.
drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_auth_user_email_change();
