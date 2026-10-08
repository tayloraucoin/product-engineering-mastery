---
epic: MIG
status: approved
---

# MIG — technical notes

> Mason, 2026-10-06. Built from the gated brief (Risks 1 to 10) and two research notes: `research/brownfield-adoption.md` and `research/ts-test-baselining.md`. Consulted: Quartermaster (layers 2 and 3), Lorimer (the harness in a foreign repo; settings from rulings) and Usher (the runbook's shape). Detail every ticket shares: `technical/assess.md` (T1, T4, T6, T8, T10), `technical/layer-1.md` (T2, T5), `technical/overlay.md` (T3, T9) and `technical/layers-2-3.md` (T7). Repo counts come from a read-only scan of tracked files in this thread. Labels: verified (read, path cited, 2026-10-06), secondary, judgment.

## Appetite verdict

The full ask does not fit two days. With three cuts it does, tightly (estimate: tooling about 1.25 days; the runbook, desk walks and reviews about 0.75):

1. **No install script.** Layer 1 is a manifest the runbook walks.
2. **No type-freeze script.** It stays a prose recipe until a target's base fails its own type check.
3. **Settings ruled per whole hook,** not per guard rule.

The overlay audit is the long pole. If it passes one day, the reviewer `imports` field falls back to per-file rows (T6), and the operator is told.

## Calls routed to Taylor

All eleven ratified by Taylor on 2026-10-07, as recommended. No one-way door is open; the Tickets stage may open.

| ID  | Call                                      | Recommendation                                                                                                                                                                                                                                                                                                                                                    | Beat                                                                      | If wrong                                                            |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| T1  | Distance assessment                       | 17 read-only signals in four groups (shape, checks, conventions, process), each scored 0, 1 or 2. Far: no workspaces and no `turbo.json` (the gate), not JavaScript, or a total of 22 or more. Middle: 16 to 21. Near: 15 or less. Synapse 14, CC 18, TA 23 plus the gate. Branch state, worktrees and large files are reported, never scored                     | dependency-cruiser, knip, madge; one number with no gate                  | The thresholds are constants; recalibrate after the synapse dry run |
| T2  | Layer 1 file list                         | Copy the practice docs, skills and the overlay tooling. Derive the spine, path rules, `toolkit.json` (overlay), settings and `verify`. The floor is tracked; everything else is ruled team or operator (local). Human lines move verbatim to root, a nested file or a path rule; toolkit lines are cut first; caps unchanged                                      | Copying our settings (Risk 2); raising caps under overlay                 | One commit per step; revert that step                               |
| T3  | Overlay across tooling and hooks (Risk 1) | One probe, `tooling/lib/layout.ts`, read by 11 scripts and 3 hooks. Starter unchanged. Proven by `tooling/overlay.test.ts` on a single-app scratch repo                                                                                                                                                                                                           | A check in each script; a separate light tooling copy (a second mode)     | A missed script blocks a stop; the fixture names it                 |
| T4  | Preconditions and branches (Risks 3, 8)   | `migrate:assess --check` fails on a dirty tree, a detached or protected branch, a migration branch already ahead of its fork point, an unpushed base, a `protectedBranch` that does not hold the fork point, an existing `toolkit.json`, or Node below 22.18. Commit 1 holds `toolkit.json` and the dependency changes. Push is denied in the operator's settings | `protectedBranch` read from `origin/HEAD`                                 | A stale diff base; the check is cheap to tighten                    |
| T5  | Records mapping (Risk 4)                  | Move and index UX specs (to `specs/<app>/_imported/ux/`) and decision logs, bodies byte for byte. Closed specs, deviations, guides, maps and host roles stay in place, indexed. A named gap with a plan is a **drafted ticket** under the target's migration epic                                                                                                 | A new `gaps.md`; closed specs into `_archive/`                            | Moves are `git mv`, reversible                                      |
| T6  | Reviewer map (Risk 6)                     | Reviewer rows take an optional `imports` list. The new `check-reviewers` fails a row matching zero files under overlay. Assess lists every money, auth, email or AI SDK importer                                                                                                                                                                                  | Per-file rows (stale at the next file); globs widened to `**`             | A Q3 change ships at Q1; fallback named                             |
| T7  | Layers 2 and 3 as paths                   | `verify` holds the repo's own checks as they pass at base, plus the toolkit's. A check failing at base is frozen (ESLint bulk suppressions; tagged per-line `@ts-expect-error` plus a count ratchet; expected-fail markers) or left as a gap. `node:test` and a smoke test where there is no runner. Layer 3 is twelve ordered gap tickets; hosted steps stop     | Betterer, tsc-baseline, ts-migrate; `strict` on day one                   | A freeze over about 50 files waits; the operator rules              |
| T8  | Tooling set                               | Build `migrate:assess` (node built-ins only, so it runs from a toolkit checkout) and `check-reviewers`, plus the overlay edits. Prose: the interview, rulings, CI edit, layer 3. Deferred and named: `migrate:install`, the type-freeze script, per-rule guard sets                                                                                               | Scripting every step inside two days                                      | Usher's "every manual step is a bug" waits one run                  |
| T9  | Records and plan mode (Risk 9)            | Record 0012, "Adoption tiers", written in plan mode by its ticket. Two ledger lines. No workspace-package boundary changes; neither `docs/index.md` nor the canon is touched                                                                                                                                                                                      | A ledger line only (too easy to forget once product repos carry the tier) | —                                                                   |
| T10 | Scorer proof                              | Synthetic fixtures, plus one read-only `migrate:assess` capture on the three repos (writes nothing)                                                                                                                                                                                                                                                               | Fixtures only                                                             | Thresholds proven on the copy, not the repo                         |
| T11 | Loom on AI imports                        | No seat; AI importers are listed in the report only (AI is not a Q3 trigger in `AGENTS.md`)                                                                                                                                                                                                                                                                       | A Loom reviewer row                                                       | One row to add                                                      |

## One-way doors

| Door                                             | Path glob                                                                                    | Ratification | Reviewer      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------ | ------------- |
| Layout file shape (tiers; `reviewers[].imports`) | `toolkit.json`, `tooling/lib/toolkit.ts`, `docs/engineering/templates/toolkit.template.json` | T6, T9       | mason         |
| Agent permissions for a team                     | `tooling/check-settings.ts`, `docs/engineering/templates/settings*.json`                     | T2, T9       | warden, mason |
| Hooks                                            | `tooling/hooks/**`                                                                           | T3           | warden        |

This repo's `.claude/settings.json` is not edited. The target's history is never a door: nothing rewrites it (settled).

**QA flag, once.** The overlay ticket edits `tooling/hooks/session-start.ts` and `check-settings.ts`, so it is a Q3 path: Warden and Mason are recommended. Assess and `check-reviewers` are Q2 (Vigil); the runbook is Q2 (Crucible, as taylor-aucoin). These are confirmed at Tickets.

## Test shape per risk

- **Layout (Risk 1):** integration on a real scratch git repo, every installed script and hook run as a subprocess.
- **Scorer (T1):** unit tests on synthetic signal sets.
- **Preconditions (Risk 3):** one scratch repo per failure.
- **Reviewer imports (Risk 6):** a unit test, plus a fixture with a Stripe import outside every glob.
- **Settings floor (Risk 2):** `tooling/fixtures/settings` cases.
- **Runbook (Risks 2, 4, 5):** three desk walks (readings), plus the `onboard-agent.md` §5 test against an old-file fact.

## Rabbit holes

- **Out of bounds on day one:** TA's restructure, promotion to living truth, layers 2 and 3 for non-JavaScript stacks.
- **Worktrees** (synapse 1 GB, CC about 17 GB, per the brief): assess walks `git ls-files` only.
- **Paths with spaces or em-dashes** (CC): read NUL-separated.
- **Hooks registered in both settings files:** [ASSUMPTION: both run; proven with a fixture session at the overlay ticket].
- **Node type stripping:** [secondary: unflagged from 22.18.0; verified at the ticket].
