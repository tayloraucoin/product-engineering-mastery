---
title: 0006 — Files are named in ASCII kebab-case, and filing preserves every body byte for byte
description: Read before creating, renaming or filing any file under docs/, roles included, or before moving material into the repo from a thread or an inbox.
layer: decisions
status: ruling
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# 0006 — Files are named in ASCII kebab-case, and filing preserves every body byte for byte

Extends `conflicts.md` CF-17 (filenames) and CF-16 (frontmatter) into the full convention. Enforced by `tooling/lint-frontmatter.ts`, which fails CI on any path or frontmatter that breaks it.

## Context and problem

Thirty-seven thread outputs arrived in `docs/_file-dump/` with spaces, em dashes, apostrophes and underscores in their names, some with frontmatter of their own and some without. Agents, `gen-agents.ts` and the primer prompts construct these paths; shells and grep break on the em dash. The owner asked for one convention, written down, and for the dump's contents to survive the move unchanged.

## Considered options

1. Keep the role-authoring guide's em-dash names for roles and research, ASCII elsewhere.
2. ASCII kebab-case everywhere, the em-dash title moved into `title`.
3. Rename freely and rewrite bodies to fit the new layout.

## Decision

Chosen: option 2 for names, with a filing rule that never touches a body, because a path an agent must construct has to be typeable, and provenance is worth more than tidiness.

### Names

| Kind                                        | Pattern                                                                                            | Example                                      |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Every path                                  | lowercase ASCII, kebab-case, `.md`                                                                 | `codebase-conventions.md`                    |
| Conventional upper-case files (closed list) | `README`, `AGENTS`, `CLAUDE`, `CHANGELOG`, `SKILL`, `DESIGN`, `REGISTRY`, `PROVENANCE`, `LICENSE`  | `.claude/skills/REGISTRY.md`                 |
| Folder landing page                         | `README.md` in every folder under `docs/`; `docs/index.md` is the one exception, the agent map     | `docs/roles/product-design/README.md`        |
| Role                                        | `<name>-<role-title>.md`, name first                                                               | `plumb-design-director.md`                   |
| Role extension                              | `<name>-ext-<mode>.md`, beside its role                                                            | `cantor-ext-human-hand-mode.md`              |
| Template                                    | `<artifact>.template.md`                                                                           | `brief.template.md`                          |
| Research output                             | `<topic>/<slug>.md`; the thread and author live in frontmatter, never in the name                  | `design-tools/tools-per-loop.md`             |
| Primer prompt                               | `phases/<slug>.md` or `threads/<slug>.md`; the phase id lives in frontmatter and the prompts table | `phases/demo-app-and-skills.md`              |
| Decision record                             | `NNNN-<slug>.md`, never renumbered                                                                 | `0006-file-naming-and-filing.md`             |
| Generated or meta                           | leading underscore                                                                                 | `docs/_generated/`, `docs/references/_meta/` |

The human title, em dashes and all, lives in `title`. No emoji anywhere in a path.

**Amended 2026-10-02 (owner's instruction; changelog, PR-12).** Landing pages are `README.md`, because GitHub renders that name in a folder view and the docs app routes it to the folder; `docs/index.md` keeps its name because it is the agent map, cited everywhere and loaded in every session. Numbers and thread prefixes left file names: a name says what a file is, and the thread id, phase id and author already sit in frontmatter. Research outputs sit in topic folders. The first-filing names are kept in `docs/_generated/filing-manifest.json` under `previously`.

### Frontmatter

Every file under `docs/` opens with the §2.7 block as amended by CF-16: `title`, `description` (one line, written as a trigger), `layer`, `status`, `thread`, `role`, `date`, `last_reviewed`, `supersedes`, `load_when`. Enums and per-layer extensions are listed in `tooling/lint-frontmatter.ts`, which is the enforceable copy.

- `date` is the authoring date. Where the source records none, it is the filing date.
- `role` is the owning role; for archives, the authoring role.

### Filing (moving material into the repo)

1. **Bodies are byte-identical.** Everything after the frontmatter block matches the source exactly; the filer verifies it by hash.
2. **No frontmatter:** the §2.7 block is prepended.
3. **Existing frontmatter:** kept line for line. Missing schema keys are appended.
4. **Collision:** when the filer must set a schema key the source already holds with a different value (most often `status: archived` on filing into `research/`), the original is kept as `source_<key>`. Nothing is deleted.
5. **A value YAML would misread is quoted**, its text unchanged: an unquoted `: ` (invalid YAML), or a number-like ID such as `thread: 05`, which YAML reads as the integer 5.
6. **The move is recorded** in `docs/_generated/filing-manifest.json`: source path, target path, body hash, and whether frontmatter was added, merged or kept.
7. Files whose bodies are preserved verbatim are listed in `.prettierignore`, so formatting never rewrites them.

## Consequences

- **Buys:** paths agents and shells can construct; one place for the human title; a verifiable chain from every filed file back to the commit it arrived in (`f61ac1b` for the Phase 1 dump).
- **Costs:** the role-authoring guide's em-dash convention, set by the owner, is overridden (CF-17 records the owner's veto). Archived files carry a few `source_*` keys.
- **Forecloses:** editing a filed thread output in place. A correction is a new file or an amendment that supersedes it.

## Revisit trigger

A tool in the agent loop that handles Unicode paths as reliably as ASCII ones, or the owner exercising the CF-17 veto.
