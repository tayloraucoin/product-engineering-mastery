# tk-kickoff — trigger tests

Run in a fresh session at the repo root (`docs/runbooks/onboard-agent.md` §4). Pass: all five must-trigger prompts invoke the skill, and at most one must-not prompt does. Every ticket named is synthetic.

## Must trigger

1. Build WEB-9 (records-filter). Read its contract and start it.
2. Kick off STK-40 new-project-guide.
3. Start the next ticket in the epic: its contract is drafted and the pre-flight passed.
4. Read prompts/31-build-WEB-9.md and do what it asks.
5. The contract for WEB-12 is filled in; begin the work.

## Must not trigger

1. Draft a contract for a bulk-archive action on the records table.
2. What is left on WEB-9? Run its status.
3. Close WEB-9: every criterion passes and only the reviews are left.
4. Explain what contract:init checks before it creates a branch.
5. Fix the typo in docs/runbooks/release.md.
