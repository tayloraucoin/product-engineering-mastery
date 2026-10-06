-- 03_public_tables.sql: deny by default on every public table (D-STK-5).
-- Data-driven, so a table a later migration adds is covered the next time
-- `yarn db:setup` runs, with no edit here. Idempotent: enabling RLS, granting
-- and recreating a trigger leave the same state on every run.
--
-- For each base table in public:
--   - row-level security is on, so a table with no policy denies every row;
--   - anon has no privilege at all, and authenticated has the four DML
--     privileges, which the policies beside each table then narrow;
--   - a table with an updated_at column gets the set_updated_at trigger.

do $$
declare
  t record;
begin
  for t in
    select c.relname as name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format('alter table public.%I enable row level security', t.name);
    execute format('revoke all on table public.%I from anon', t.name);
    execute format(
      'grant select, insert, update, delete on table public.%I to authenticated',
      t.name
    );

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = t.name
        and column_name = 'updated_at'
    ) then
      execute format('drop trigger if exists set_updated_at on public.%I', t.name);
      execute format(
        'create trigger set_updated_at before update on public.%I '
        'for each row execute function public.set_updated_at()',
        t.name
      );
    end if;
  end loop;
end;
$$;
