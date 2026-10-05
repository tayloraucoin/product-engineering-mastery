---
title: References — the router
description: Read when a UI build, critique or spec needs the library; maps the task type to at most three reference files, so nothing else in docs/references/ loads.
layer: references
status: adopted
thread: "13"
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique, spec, discovery, metrics
---

# References

Load order: the design layer, then the package, then this router, then **at most three** files from the row that matches the task. The cap counts laws, heuristics and canons together. The design layer wins every conflict: a reference can justify a finding but never overrides a token, a component rule or an anti-pattern. Findings cite rule IDs (`Fails <Law> [<RULE-ID>] at <element>: <evidence>. Fix: <fix>.`); a finding with no rule ID of any kind is Consider at most (canon C-R15).

**Nothing below is written yet.** Every file arrives in Phase 4 through prompt [P-D](../prompts/archive/phases/library-batches.md): Laws of UX first (batch 1), then batches 2 and 3, then canons, practitioners and books. Until a file lands, skip it. **Do not improvise its content.**

## Laws of UX, by task type

| Task type                      | Load (max 3)                                                                        | Why these                                           |
| ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| Table                          | laws-of-ux/working-memory, laws-of-ux/chunking, laws-of-ux/hicks-law                | compare in view; grouped IDs; row actions           |
| Document diff / compare        | laws-of-ux/working-memory, laws-of-ux/chunking, [B2] laws-of-ux/von-restorff        | both states visible; changes distinct               |
| Audit trail / log              | laws-of-ux/chunking, laws-of-ux/working-memory, [B2] laws-of-ux/proximity           | grouped by day and actor; no recall                 |
| Form                           | laws-of-ux/chunking, laws-of-ux/parkinsons-law, [B3] laws-of-ux/postels-law         | sections; prefill; tolerant input                   |
| Data entry (repeated)          | laws-of-ux/fittss-law, laws-of-ux/flow, laws-of-ux/parkinsons-law                   | targets; unbroken run; prefill                      |
| Onboarding                     | laws-of-ux/hicks-law, laws-of-ux/goal-gradient, [B3] laws-of-ux/paradox-active-user | fewer first choices; true progress                  |
| Navigation                     | laws-of-ux/hicks-law, [B3] laws-of-ux/jakobs-law, [B2] laws-of-ux/serial-position   | known patterns; ends of lists                       |
| Search / filter                | laws-of-ux/choice-overload, laws-of-ux/hicks-law, laws-of-ux/doherty-threshold      | narrowing; response pace                            |
| Dashboard                      | laws-of-ux/cognitive-load, laws-of-ux/chunking, [B2] laws-of-ux/von-restorff        | extraneous load; one salient item                   |
| Map or canvas interaction      | laws-of-ux/fittss-law, laws-of-ux/doherty-threshold, laws-of-ux/cognitive-load      | target size; pan latency; panel load                |
| Long-running process / loading | laws-of-ux/doherty-threshold, laws-of-ux/goal-gradient, [B2] laws-of-ux/peak-end    | acknowledge within 400ms; true progress; the ending |
| Error state                    | [B3] laws-of-ux/postels-law, [B2] laws-of-ux/peak-end, laws-of-ux/working-memory    | tolerant input; recovery moment; no recall          |
| Destructive action             | laws-of-ux/fittss-law, [B2] laws-of-ux/von-restorff, laws-of-ux/hicks-law           | spacing; distinct; one clear choice                 |
| Settings                       | laws-of-ux/hicks-law, [B3] laws-of-ux/teslers-law, laws-of-ux/choice-overload       | defaults; who carries complexity                    |
| Empty state                    | [B3] laws-of-ux/paradox-active-user, laws-of-ux/goal-gradient, laws-of-ux/hicks-law | act-first guidance; one next step                   |
| Report / export                | laws-of-ux/choice-overload, [B2] laws-of-ux/peak-end, laws-of-ux/chunking           | comparable templates; the ending                    |

Paths are relative to `docs/references/`; the family folders R13 proposed (`cognition/`, `motor-time/`, …) are an implementation detail of the batch, recorded in each file's `family` field. `[B2]` and `[B3]` mark files scheduled for later batches.

## Other folders

| Folder           | Holds                                                                                                                                   | Rows added by            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `canons/`        | Source distillations: refactoring-ui, shift-nudge, design-plus-code (references, not law; CF-26)                                        | P-D canon batch          |
| `practitioners/` | One file per person, flat; subject in `load_when` (CF-14)                                                                               | P-D practitioner batches |
| `books/`         | One file per book, flat (CF-14, CF-46 for author overlap)                                                                               | P-D book batches         |
| `_meta/`         | [`extraction-guide.md`](_meta/extraction-guide.md), [`books-plan.md`](_meta/books-plan.md) — procedures, loaded only in a library batch | —                        |

Every batch adds its files to this router in the same change, under the task types in their `load_when`: table, form, onboarding, navigation, error state, dashboard, map, critique, spec, discovery, positioning, metrics.

**Not listed?** Match the task to each file's `load_when`. Still ambiguous: load none and flag it to Plumb.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`_meta/`](_meta/README.md) | Open before running a library batch: how sources are extracted, scored and verified before they enter `references/`. |
