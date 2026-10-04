# tk-close — trigger tests

Run in a fresh session at the repo root (`docs/runbooks/onboard-agent.md` §4). Pass: all five must-trigger prompts invoke the skill, and at most one must-not prompt does. Every ticket named is synthetic.

## Must trigger

1. Close WEB-9.
2. Status for WEB-9 shows only the as-built and reviews left; finish it.
3. The build is done. Prove it, write the as-built and run the reviewers.
4. Wrap up STK-40 so it is ready for me to merge.
5. Every criterion on WEB-12 is green; take it to done.

## Must not trigger

1. Start WEB-9 from its contract.
2. Draft the contract for a records export.
3. Run contract:run for WEB-9 and tell me what fails.
4. Merge agent/WEB-9 into main.
5. Explain what review:run sends to the reviewer.
