---
epic: DEMO
status: draft
---

# Brief — DEMO, the records demo

> **Who fills:** the shaper, with Compass. Tally consulted on Metric and Audits at close.
> **When:** before shaping; approved at "Frame go" by Taylor.
> **Lives at:** `specs/web/epics/DEMO-records-demo/brief.md`. The package follows in `package.md`.
> **Source plan:** `docs/prompts/archive/phases/demo-app-and-skills.md` (P-C), parts 1 to 6, its amendment blocks in force. Scope is not re-decided here.
> **Labels:** verified (read in the repo, 2026-10-08), secondary (stated in a doc, not checked against behaviour), judgment (Compass).

## Job

- **Trigger:** "Show me it works on something real before we adopt it" — a team weighing PEM asks for proof, or Taylor is about to move Synapse onto it. (judgment)
- **Baseline:** today `apps/web` is the scaffold's single page (secondary: `apps/web/AGENTS.md`). The design layer `apps/web/docs/design/` does not exist (verified), the critic, diverge and motion skills are not installed as `tk-` skills (secondary: P-C amendments), and nothing in CI judges UI. An evaluator reads docs and has to trust that the canon, the templates and the work loop hold up on a product; there is no filled example to compare a template against and no rendered screen a critic has scored.

## User

- **A team evaluating PEM:** a lead or senior engineer, skeptical, reading on a laptop at 1440 and spot-checking a phone at 390, with an afternoon to decide. They click through routes, flip `?state=`, toggle dark, and open a template beside its filled example in the docs app. (judgment)
- **Taylor, before Synapse migrates:** the operator, who needs to know which parts of PEM v1 hold and what they cost, measured, not felt. (judgment)

## Metric

- **Signal:** no metric ID exists; `docs/measurement/metrics/` holds templates only, no `definitions.md` (verified, not found). The signal is a pass list, judged at the close: (judgment, Tally consulted)
  1. Every demo route lives under `/demo` (`/demo` itself and its children, such as `/demo/records`), and the home page links to it in one line.
  2. Every route reaches every state by `?state=empty|loading|error|partial|offline`, light and dark, reduced motion honored (P-C part 1; `apps/web/AGENTS.md`).
  3. The filled design layer exists at `apps/web/docs/design/` beside its templates (P-C part 2).
  4. `tk-ui-critic`, `tk-ui-diverge` and `tk-motion` are installed with trigger tests (P-C parts 3 and 4; CF-10, CF-18).
  5. The critic fails all three fail exemplars, passes all three pass exemplars, and can never pass a state it did not capture.
  6. Critic CI builds the demo, runs the critic, fails on any Blocking finding and stores the screenshot set (P-C part 6).
  7. The three audits below are reported at the close.
- **By when:** one hour of wall time across every level, Frame to close. [ASSUMPTION: the clock runs from this thread's start to the close report, and excludes time waiting on Taylor at the stops.]
- **Kill criterion:** none ends the bet; the demo ships either way. The appetite is itself a v1 test result: going over is recorded in the close report with where the time went, and never answered by cutting a P-C part silently. [PROPOSED: if the build waves pass two hours, stop and ask Taylor whether to cut parts 4 and 5 to a follow-up epic.]

## Evidence

- P-C was planned and amended over two audit days (secondary: the plan's amendment blocks, PR-12, A4). The demo is the critic's target by charter (secondary: `AGENTS.md`, `docs/index.md`).
- Every UI criterion stays UNVERIFIED until this phase lands (secondary: canon C-R01, quoted in P-C). That is the direct case for doing it now.
- **Counter-evidence:** six parts in one hour is almost certainly over appetite (judgment, estimate). The critic's calibration (three pass, three fail) is small enough that a passing set may not prove much. Four tickets are in flight on the same branch (LAB-14, LAB-18, STK-20, WEB-15; verified from the session hook), so shared files and red tests can block hardening (secondary: memory on review:run).

## Appetite

- **Small batch: about one hour of wall time across every level.** A hard constraint and a v1 test result. Pace Fast. (Taylor)

## Mode

- **Production.** The demo is the shipped proof, not a spike. (judgment)

## Out of scope

- The home page's sales pitch (later work; home gets one link to `/demo`).
- Real customer data; fixtures only.
- A demo that only has happy paths.
- A critic that passes a state it never captured.

## Audits at close

Each over-cap or failing finding becomes a drafted follow-up in the close report, never a silent fix.

- **(a) Spend.** `yarn cost <id> --record` at each ticket's hardening; `yarn cost --epic DEMO` at the close. Reported per level and per ticket, with build versus review shares. Weights are an estimate, not the meter (secondary: `tooling/cost.ts` header, 2026-10-08). It reads `~/.claude/projects/`, so it runs unsandboxed.
- **(b) Context.** Each thread's context at its last call (from `yarn cost`) against the `docs/index.md` caps: UI build 15,000; non-UI build 10,500; evaluator 10,000; critic 6,000. Plus `yarn budget`.
- **(c) Design tokens.** The token lint (`@pem/config/eslint/tokens`), `yarn contrast-audit`, and the Paper artboards using only mirrored tokens.

## Carried to Design

- Paper file `https://app.paper.design/file/01M4EMRAAHDKDE6S693E3N478D/p-1-0`, page `p-1-0`, empty. No Paper call at Frame.

## Decision this unblocks

- Whether PEM v1 is fit to show a team and to carry Synapse, with its cost measured. Taylor decides next, at UX approval and then at the Synapse migration.
