# STK-11 C5 — operator check (deferred)

Statement: following remove-supabase-database.md on a scratch copy leaves grep for drizzle and supabase empty and verify green.

Why deferred: the contract makes the removal rehearsal on a scratch copy a person's check.

Grep scope, proposed and not yet settled by Taylor: as worded, the grep cannot come back empty while Supabase Auth stays. The runbook keeps `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the auth module, and docs name Supabase. Proposed: `git grep -il 'drizzle\|supabase' -- ':!docs' ':!specs'`, where the only allowed hits are those two variables in `.env.example` and `turbo.json`. Alternatively, run remove-supabase-auth.md first; then the grep should be empty.

The check:
1. Duplicate the repo to a scratch folder (new-project.md step 1).
2. Follow docs/runbooks/remove-supabase-database.md top to bottom.
3. Run the grep above, then `yarn check-stack` and `yarn verify`.
4. Record the grep output and both exits here, with the date.
