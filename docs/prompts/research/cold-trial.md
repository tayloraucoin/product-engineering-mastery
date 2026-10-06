---
title: "P-L — Cold trial of the human path, timed by a stranger"
description: "Commission after J14 lands (the stage files and the prompt builder), to measure the human path from clone to a first merged change with someone who has not seen the repo, and turn each stumble into a mechanism or a line."
layer: prompts
status: draft
thread: P-L
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-02
supersedes:
load_when:
---

# P-L — Cold trial of the human path (general Claude thread to brief; the trial itself is a person)

**Venue:** general Claude thread to prepare the trial sheet and to triage afterwards. **When:** after J14, when `/tk-prompt`, the stage files and `yarn status` exist, so the path has its levels. **Who walks it:** a stranger, not Usher and not Taylor (Crucible, audit day): a contractor or a friend who codes, on a clean machine. **Inject:** Usher. **Attach:** `docs/prompts/shared-context.md`, the Usher role, `docs/README.md`, `docs/workflows/README.md`, `docs/runbooks/onboard-agent.md`, Usher's audit-day cold-trial report (changelog, "Audit day").

**Decision served.** Whether the human path works, measured on the three clocks: clone to running, running to first merged change, first change to the next change made alone. The first dated cold trial; the rot test fails until one exists.

**Ask.**

1. Write the trial sheet: the start page (`README.md`, then `docs/README.md`), the designated first change (a one-off ticket through `/tk-prompt`, `contract:init`, `contract:run`, `tk-close`), the timer per step, and the rule that nobody answers a question during the walk.
2. Run it, with the walker thinking aloud; record every stumble with the file where it happened and the question the path should have answered.
3. Triage: each stumble becomes a mechanism (a generator, a doctor check, an error message), a line at the point of use, or an accepted gap with a reason. Route convention findings to their owners with the evidence attached.
4. Record the durations and the date in `docs/runbooks/onboard-agent.md` (the human section) and in the changelog; set the next trial's date.

**Evidence rules.** Only the timed walk counts. The walker's confusion is data about the house. No fix is made during the walk.

**Done.** Three durations with a date; a friction log with a disposition per row; the path's next trial date.

**Not wanted.** A walk by the author; help given mid-walk; a tour longer than the first change.
