-- 04_users_backfill.sql: a public.users row for every auth user that lacks one
-- (D-STK-5, D-STK-6). The trigger in 02 covers users created after setup;
-- this covers the ones that already existed: users of a hosted project
-- created before setup first ran, and mirrored users whose public row went
-- when `yarn db:local:reset` emptied public, since the mirror then finds their
-- auth row unchanged and the insert trigger never fires again.
-- Idempotent: an existing row is left as it is.

insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do nothing;
