---
title: "0012 — Adoption tiers: a repo with a history joins the practice as an overlay, and leaves it only when layer 3 is done"
description: Read before adding a mode to toolkit.json's tier, before editing a script or hook that reads the repo's layout, or before deciding what a migrated repo's tracked and local settings hold.
layer: decisions
status: ruling
thread: "MIG"
role: Mason
date: 2026-10-07
last_reviewed: 2026-10-07
supersedes:
load_when:
---

# 0012 — Adoption tiers: a repo with a history joins the practice as an overlay, and leaves it only when layer 3 is done

## Context and problem

`toolkit.json` already admitted three tiers, `starter`, `overlay` and `overlay-local`, and `tooling/lib/toolkit.ts`, `tooling/lint-frontmatter.ts` and `tooling/directory-map.ts` already skipped the host repo's docs under the last two. No decision record described them. The engineering-layer report proposed the tiers as "record 0010, proposed"; 0010 was then used for the default stack, and the proposal was never renumbered. Nothing else in the tooling knew the tier: a single-app repo with no `turbo.json` blocked every stop, because `verify:fast` and the stop gate assumed the starter's layout (migration brief, Risk 1). The migration epic (MIG) built the missing half, and the tiers are now the way an existing repo with a history and a team joins the practice. They are hard to undo once product repos carry the tier in a tracked file, and a second adoption mode built beside them would split every check in two.

## Considered options

1. A ledger line only. Cheap, and what the technical notes first beat: too easy to forget once product repos carry the tier, and a line cannot hold the exit or the reason the settings split in two.
2. A separate, lighter copy of the tooling for foreign repos. Each script would behave simply, but it is a second adoption mode: two sets of checks to keep current, and a repo moving between them rewrites its tooling.
3. The three tiers, with one layout probe the scripts and hooks read. The starter's behaviour is unchanged, and a foreign repo differs by what the probe finds.

## Decision

Chosen: option 3, because it is the only one that keeps one set of tooling and gives the operator a written exit. The five rulings:

- **The modes.** `starter`, `overlay` and `overlay-local` are the only adoption modes. `starter` is a duplicate of this repo. `overlay` is an existing repo with the practice installed in it and the harness files tracked. `overlay-local` is the same for a repo whose `.claude/` the team does not own: every setting goes in the operator's local file. A fourth mode is a new record (MIG-1, MIG-3).
- **Host docs are left alone.** Under either overlay tier the docs lint and the directory map skip the host's docs, and `check-refs` reads only the migration manifest's paths and the spine. A host's own files are indexed, never rewritten to satisfy a practice check (MIG-3).
- **A tracked floor and an operator's local layer.** The tracked `.claude/settings.json` holds only the floor: reads of env files, secrets and keys denied, database resets and drops denied, `git reset --hard`, `git clean`, `git branch -D` and `git filter-branch` denied, publish and login denied, database migrate, push, seed and setup asked on, and the two team hooks (the spine line and the results guard). Everything else is ruled team or operator in the migration interview: the push deny, the bash guard, the stop gate, the sandbox and the allow list default to the operator's gitignored `.claude/settings.local.json`, and move to the tracked file only when the team says so. `check-settings` judges the floor per tier, and `yarn doctor` fails when an operator row is in neither file, which is the guard that makes a disposable local file safe (MIG-2).
- **One probe.** `tooling/lib/layout.ts` is the one home for layout facts beyond `toolkit.json`: whether Turbo is configured and which of its tasks exist, the workspaces, the code roots, the specs root, the root scripts. Any script or hook that must behave differently for another layout reads the probe; none re-detects it with its own check (MIG-1).
- **The exit.** A repo leaves overlay for `starter` only when layer 3 of its migration is done: the conventions and the stack in place, part by part, with the gap tickets closed. It never leaves because a check is inconvenient.

## Consequences

- **Buys:** a repo with a team gets the agent spine, the workflows, the records and a verify command in a working day, without the stack. The tooling has one layout probe instead of eleven private checks, and the `starter` fixtures are the regression guard for every overlay edit. The settings split names who owns which rule before the merge, so the morning after it no teammate's agent meets a policy nobody ruled on.
- **Costs:** every edit to a script or hook must keep the single-app overlay fixture green (`tooling/overlay.test.ts`), so a change to the probe is a Q3 change. The local layer is disposable by nature; the doctor check, not the file, is the guard. A repo may sit in overlay indefinitely, and the migration epic's drafted gap tickets are the only burn-down.
- **Forecloses:** a fourth adoption mode without a new record, and a per-repo fork of the tooling.

## Revisit trigger

A product repo needs a fourth mode, or the first product repo finishes layer 3 and the exit is walked for real: then the exit's steps (which files leave the overlay's scope, which checks join `verify`) are written down here as an amendment record.

## Amendment

**Amended 2026-10-08 (operator's ruling; changelog, EN-18).** The floor under `overlay-local`. `check-settings` does not require the floor in the tracked `.claude/settings.json` at that tier: the team does not own that file, and `verify` would fail there forever. `yarn doctor` alone checks the floor (its denies and asks and the two team hooks) and the operator rows in the operator's local `.claude/settings.local.json`; CI does not enforce the floor at `overlay-local`. The modes paragraph above was already right, and "every setting goes in the operator's local file" stands as written; this block says only what checks it. Accepted cost: at `overlay-local` the floor is a doctor check on one machine, not a CI gate. It lives only in each operator's gitignored file and is checked only when that operator runs `yarn doctor`, so a fresh clone, a worktree or a reset file runs with no floor and nothing in CI says so. MIG-2 builds the change.
