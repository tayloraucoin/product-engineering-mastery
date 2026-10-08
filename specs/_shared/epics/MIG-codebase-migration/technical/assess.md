---
epic: MIG
status: draft
---

# MIG — the assessment, the preconditions, the reviewer map and the tooling set

> Detail for calls T1, T4, T6, T8 and T10 (`../technical.md`). Mason with Lorimer and Quartermaster consulted, 2026-10-06. Repo counts are from a read-only scan of tracked files (`git --no-optional-locks ls-files`, so worktrees are never walked) run in this thread on 2026-10-06. Where a count differs from the brief's, the definition differs: the brief counted app files only for `"use client"`, and this scan counts every tracked source file.

## T1 The distance assessment

`yarn migrate:assess <target>` reads and never writes. It imports node built-ins only, as `tooling/hooks/bash-guard.ts` does (verified), so it also runs as `node <toolkit>/tooling/migrate-assess.ts <target>` from a cold session inside the target, before anything is installed. It prints a markdown report, and writes the same data as JSON with `--json`. The report is the interview's opening document, and is filed byte for byte in the target as `<specsRoot>/_shared/epics/<P>-migration/assess.md`.

### Signals and scores

Each signal scores 0 (matches the practice), 1 (partial) or 2 (absent or conflicting). Rows come from `docs/engineering/codebase-conventions.md`, `docs/engineering/tech-stack.md` and the brief's Evidence section. The cut-offs are judgment, calibrated on these three repos, and named as constants so the synapse dry run can move them.

| #   | Signal (layer it informs)                                                                     | 0 / 1 / 2                                            | Synapse                               | CC                                              | TA               |
| --- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- | ----------------------------------------------- | ---------------- |
| S1  | Workspaces and `turbo.json` (3)                                                               | both / one / neither                                 | 0                                     | 0                                               | 2                |
| S2  | Toolchain majors against tech-stack: Yarn 4, Node 22, TS 5, Next 16, React 19, Tailwind 4 (3) | none off / one / two or more                         | 0                                     | 0 (Next 16.2.6)                                 | 1 (Next ^15.1.0) |
| C1  | One verify command (2)                                                                        | yes / CI chains checks / neither                     | 1                                     | 1                                               | 2                |
| C2  | CI config (2)                                                                                 | present / – / absent                                 | 0                                     | 0                                               | 2                |
| C3  | Tests (2)                                                                                     | runner and tests / runner only / none                | 2                                     | 2                                               | 2                |
| C4  | Type check and lint scripts (2)                                                               | both / one / none                                    | 0                                     | 0                                               | 0                |
| C5  | Read-only format check (2)                                                                    | `--check` script / write-only / none                 | 1                                     | 1                                               | 1                |
| V1  | Boundaries lint at `packages/config/eslint/boundaries.js` (3)                                 | present / – / absent                                 | 0                                     | 0                                               | 2                |
| V2  | Token preset at `packages/config/tailwind/preset.css` (3)                                     | present / – / absent                                 | 0                                     | 0                                               | 2                |
| V3  | Files reading `process.env` outside an `env.ts` (3)                                           | 0 / 1–25 / over 25                                   | 1 (19)                                | 2 (48)                                          | 1 (16)           |
| V4  | `"use client"` files outside `_components/`, share (3)                                        | ≤10% / ≤50% / over 50%                               | 2 (243 of 322)                        | 1 (180 of 390)                                  | 1 (25 of 157)    |
| V5  | Money, auth, email or AI SDK importers no reviewer glob matches (3)                           | 0 / 1–10 / over 10                                   | 1 (3)                                 | 2 (26)                                          | 2 (17)           |
| P1  | Instruction-file rules that conflict with a toolkit policy (1)                                | none / one or two / three or more                    | 1 (no tests; no branches or PRs)      | 1 (same two)                                    | 0                |
| P2  | Docs with frontmatter, share (1)                                                              | ≥90% / ≥10% / below                                  | 2                                     | 2                                               | 2                |
| P3  | Record kinds in a foreign format (1)                                                          | none / one / two or more                             | 2 (9 decision logs, 9 deviation logs) | 2 (4, 3, plus `docs/decisions/`)                | 2 (7, 7)         |
| P4  | Living truth (1)                                                                              | `specs/<app>/ux/` / a UX spec elsewhere / none found | 1 (5 versions in `docs/ux/`)          | 2 (not found by name)                           | 1 (3 area specs) |
| P5  | Tracked doc paths with spaces or non-ASCII characters (1)                                     | 0 / 1–50 / over 50                                   | 0                                     | 2 (57 with spaces; 173 em-dashes per the brief) | 0                |
|     | **Total (of 34)**                                                                             |                                                      | **14**                                | **18**                                          | **23**           |

All three scans 2026-10-06, verified. CI chains, by file: `.github/workflows/ci.yml` in synapse and CC (lint, boundaries, types, build). The instruction-file rules are synapse `AGENTS.md` lines 36 and 145 and CC `AGENTS.md` lines 33 and 34. The format scripts are `prettier --write` in all three `package.json` files. P4 for CC is not found by file name, and the assessment ticket confirms it.

### Path thresholds

- **Far:** the shape gate fails (S1 = 2), the repo is not a JavaScript repo (layer 1 only; layers 2 and 3 are one named gap each, settled), or the total is 22 or more. TA: gate and 23.
- **Middle:** the total is 16 to 21. CC: 18.
- **Near:** the total is 15 or less. Synapse: 14.

The margins are two points each way, so the gate is the firm part and the totals are judgment. **What the path changes.** Day one is layer 1 plus the verify command on every path (settled). The path sets the interview rounds, the time box per step and the layer 3 entry point:

- **Near:** the short interview; layer 3 opens part by part.
- **Middle:** adds the conflict round (P1) and the records round, with the records step timed on its own (Risk 4).
- **Far:** single-app overlay; CI is a hosted gap; layer 3 opens with the restructure gap (root app into `apps/web`, workspaces, Turbo) as its own epic in the product repo, last.

Not scored, but listed in the report:

- **Hygiene:** branch state (T4), worktrees (synapse 2, CC 8, TA 1), tracked files over 10 MB (TA: one 74 MB `.mov`, no LFS).
- **The listings:** P1 conflicts, SDK importers, and records by kind (T5).
- **Collisions:** practice paths that already exist in the target (CC: `docs/decisions/`, `docs/roles/`).

**Beat:** dependency-cruiser, knip and madge. They add dependencies to a read-only step and measure import graphs the boundaries lint already rules on (judgment). One weighted number with no gate also lost: TA's restructure is a categorical fact, not a degree.

## T4 Preconditions and branches

`migrate:assess <target> --check` exits 1 with each failure and its fix. It runs before any write, and again before the last commit. It fails when:

1. The tree is not clean, untracked files included (CC today: 1 entry; TA: 3).
2. HEAD is detached, or the branch is `protectedBranch`.
3. The migration branch has commits beyond its fork point at the start. The operator creates and names the branch; the repo's own convention wins.
4. The base branch differs from its remote copy, or has none (unpushed).
5. `protectedBranch` (asked, never read from `origin/HEAD`) does not hold the branch's fork point. That fails Risk 3's case, where synapse's `main` was stale.
6. `toolkit.json` already exists, or `.claude/settings.local.json` is tracked.
7. Node is below 22.18. [secondary: type stripping runs `.ts` unflagged from Node 22.18.0. Verify at the ticket, dated; this machine runs 22.22.2.]

Commit 1 holds `toolkit.json` (tier `overlay`), the toolkit's devDependencies (`yaml`, plus `typescript` and `@types/node` where absent) and `yarn.lock` (Risk 8). Every commit opens with the target's repo-wide prefix (interview). No step pushes or merges. The operator's local settings deny push (T2), and the runbook ends by printing the branch name for the operator.

**Beat:** reading `protectedBranch` from `origin/HEAD` or the repo's default branch, which is synapse's stale `main` (Risk 3).

## T6 The reviewer map

- **Listing.** The report lists every tracked file that imports `stripe`, an auth SDK (`@supabase/*`, `next-auth`, `@clerk/*`, `better-auth`), an email SDK (`resend`) or an AI SDK (`@anthropic-ai/*`, `openai`, `ai`, `@ai-sdk/*`). Each row says which toolkit glob matches the file, or "none".
- **Import rows.** A reviewer row in `toolkit.json` takes an optional `imports: string[]` and may then omit `glob`. A file matches the row when it imports one of those modules. `tooling/lib/specs.ts` applies the rule to a ticket's existing planned files and its diff. Planned files that do not exist yet match by glob only.
- **Seeded rows.** Stripe goes to mason, warden and chancery, as the billing globs do. Auth SDKs go to mason and warden; email to warden (personal data). AI SDKs are listed only: AI is not a Q3 trigger in `AGENTS.md` (verified), so Loom is consulted, not seated. Ratified 2026-10-07 (T11): no Loom seat.
- **Zero-match check.** `yarn check-reviewers` (new, in `verify`) fails under the overlay tiers when a row matches zero tracked files. The fix is to delete the row or correct it. At `starter` the check is skipped, because a starter's rows are seats for modules not built yet (`**/legal/**` here).

**Beat:** per-file rows written by assess, which go stale at the next new file. So did widening globs to `**`, which puts every change at Q3. **Fallback** if the time box runs out: assess writes per-file rows, and the zero-match check still lands.

## T8 The tooling set

| Step                                                                                   | Scripted or prose                                            | Why                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Assess, preconditions, listings                                                        | Script: `migrate:assess` (Q2, Vigil)                         | Mechanical, repeated at the start and the end of every run                                                                          |
| Reviewer zero-match and SDK coverage                                                   | Script: `check-reviewers` (Q2, Vigil)                        | Must fail in CI, not in prose                                                                                                       |
| Overlay behaviour of the installed tooling                                             | Edits to existing scripts (T3)                               | Risk 1                                                                                                                              |
| Layer 1 copy                                                                           | Prose over a manifest, `docs/runbooks/migrate/manifest.json` | Script deferred until the synapse dry run shows the step repeats unchanged; the manifest makes it a one-hour script then (estimate) |
| Type freeze and count ratchet                                                          | Prose recipe (`layers-2-3.md`)                               | None of the three is known to fail its type check at base; the script is written the first time one does                            |
| Interview, records rulings, human-line placement, CI edit, layer 3 plans, hosted steps | Prose                                                        | Judgment or vendor-specific                                                                                                         |

## T10 The scorer's proof

Unit tests feed the scorer synthetic signal sets equal to the table above. Ratified 2026-10-07 (T10): the assessment ticket also runs `migrate:assess` read-only against the three repos once, as a capture. It writes nothing there.

## Data contract

`migrate:assess --json` returns:

- `target`, `commit`, `toolkitCommit`
- `signals`: `{ id, value, score, evidence }[]`
- `total`, `path`, `gate`
- `preconditions`: `{ id, ok, fix }[]`
- `conflicts`: `{ policy, file, line, text }[]`
- `sdkImports`: `{ file, module, matchedBy }[]`
- `records`: `{ kind, path, lines }[]`
- `collisions`, `hygiene`

The shape is reversible. It is filed only as the report text.
