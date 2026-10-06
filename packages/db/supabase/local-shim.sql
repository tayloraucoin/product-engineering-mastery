-- local-shim.sql: what Supabase's own Postgres provides and a plain Postgres on
-- a developer's machine (Postgres.app, Homebrew) lacks, so the migrations, the
-- setup SQL and the policies apply there unchanged: the three client roles the
-- policies and grants name, and the auth schema's users table that the
-- public.users foreign key, the setup triggers and the local auth mirror use.
-- Applied by `yarn db:setup:local` only, on a loopback database on the local
-- tier; never on a hosted tier, where Supabase owns all of this. Idempotent.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  -- Supabase Auth's own role, which owns the auth schema on a real auth
  -- database and creates auth.identities there. No login: nothing connects as
  -- it here; the mirror's integration test switches to it inside a rolled-back
  -- transaction.
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin nologin noinherit;
  end if;
  -- The bridge runs `set local role authenticated` on the connecting user
  -- (src/rls.ts), which must be a member of the role; a superuser is already.
  execute format(
    'grant anon, authenticated, service_role to %I',
    current_user
  );
end;
$$;

-- The auth schema and its users table, owned by supabase_auth_admin as on
-- Supabase: id and email are what the mirror writes and the setup triggers
-- read; the timestamps are nullable with no default, as Supabase's are, so a
-- mirrored row fills id and email only. auth.identities is never created: its
-- presence is what marks a database as Supabase Auth's own (Mode B), and the
-- mirror then stays shut.
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz,
  updated_at timestamptz
);
alter table auth.users
  alter column created_at drop not null,
  alter column created_at drop default,
  alter column updated_at drop not null,
  alter column updated_at drop default;
alter role supabase_auth_admin nologin;
alter schema auth owner to supabase_auth_admin;
alter table auth.users owner to supabase_auth_admin;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role, supabase_auth_admin;
