---
name: tk-contract
description: "Draft a ticket's contract from a one-line request or an epic's surface file: testable criteria with evidence types, planned paths, one cited surface. Manual: run it as /tk-contract."
disable-model-invocation: true
argument-hint: <APP | app | EPIC> <slug> <what the ticket must do>
---

Draft one contract. Do not start it: `/tk-kickoff` does that.

1. **Place it.** Run `yarn contract:init <APP | app | EPIC> <slug>`. The first run allocates the id and writes `contract.md` from `docs/engineering/templates/contract.template.md` into the ticket folder; read the template's instruction block once. At an epic's Tickets stage, write the draft to a scratch file and run `yarn contract:init <EPIC> <slug> --from <file> --draft` instead.
2. **Read what it builds on.** For an epic ticket: the one surface file it cites, its decision and criterion IDs, and the epic's `technical.md`. For a one-off: the living UX file under `specs/<app>/ux/` that covers the change, if one does. Never attach `docs/research/` (A11).
3. **Fill every field.** The schema is `docs/engineering/schemas/contract.schema.json`; `.claude/rules/specs.md` loads when you open the file.
   - `objective`, `slice_type` (the class of failure it risks), at most seven `non_negotiables`, `devs_call`, `out_of_scope`, `depends_on`.
   - `cites`: one surface file and the IDs you build from it. A second surface needs a `waiver:` line, and usually means two tickets.
   - `truth_files`: the living UX files this ticket edits in the same PR, or `none: <reason>`.
   - `planned_paths`: exact paths or narrow globs. They decide the reviewers, so a broad glob summons reviewers it does not need, and a missing path hides one it does.
   - `criteria`: each observable by a user or a caller, each with one evidence type. `test` (logic, data, money, auth) and `check` (lint, types, boundaries, tokens) name a `package.json` script run as `yarn <script>`; name each test after its criterion id. `capture` (UI, through `?state=`) names its evidence `path`; `manual` names its `reason` and is reported as not verified. UI criteria default to `capture`.
4. **Flag weak evidence.** A criterion proven by searching the code for a string breaks when a comment mentions the string: say so in the contract's Notes and prefer a `check` or a `test`. A criterion no script can run is `manual`, never a `test` that always passes.
5. **Size it.** At most 1,000 tokens and under half a day (`size: small`). If it will not fit, split it into tickets and say so.
6. **Check it.** Run `yarn check-specs`; fix what it names. A draft with `[FILL]` markers passes; a contract with any left cannot start.

End with the contract's path, its reviewers as the planned paths imply them (from `toolkit.json`), and the open questions, if any, each with a recommended answer.
