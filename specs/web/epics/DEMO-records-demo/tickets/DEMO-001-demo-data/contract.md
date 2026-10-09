---
id: DEMO-1
size: small
objective: "Every demo surface reads one typed, deep-frozen fixture set through a pure reducer, one prefs codec and one ?state= registry, so the six surface tickets build on the same data and keys."
slice_type: "Pure modules and their unit tests, no UI; the risk is a wrong built word or a diff that cannot rebuild its versions, which every surface and capture would then repeat."
non_negotiables:
  - "Shapes exactly as technical/data-contract.md gives them (RecordSummary index and RecordBody map kept apart, D-DEMO-20); IsoDate strings in state, never a Date."
  - "40 synthetic records, deep-frozen; Halvorsen Freight carries the four versions and the words in record-detail.md; the named records' ids are exported constants."
  - 'Every relative word comes from DEMO_TODAY = "2026-10-08"; format.ts uses explicit locales (en-US money plus " USD", en-GB d MMM yyyy in UTC); no Date.now() or random value anywhere.'
  - "The reducer is pure: update with changed clauses appends version n + 1 with a summary built from the diff; unchanged clauses add no version; delete and reset restore nothing from prefs."
  - "readDemoState(raw, surface) returns a registered key or null; a repeated or unknown key is null."
  - "The prefs codec reads anything invalid as the defaults (onboarded false, compactRows false, vendor-asc)."
devs_call: "Fixture wording beyond the named records, the reducer's internal action shape, and the seeded generator's design, as long as it needs no new dependency."
cites:
  - "specs/web/epics/DEMO-records-demo/ux/demo/overview.md"
  - "D-DEMO-6"
  - "D-DEMO-7"
  - "D-DEMO-19"
  - "D-DEMO-20"
truth_files: "none: pure modules with no rendered behaviour; the surfaces that render them carry the truth files"
qa: Q2
reviewers:
  - vigil
focus:
  - "The diff and the reducer's versioning: the generated cases rebuild both versions and the summary counts agree (vigil, Q2)"
operator_review: false
planned_paths:
  - "apps/web/app/demo/_lib/**"
  - "apps/web/lib/demo/states.ts"
  - "apps/web/lib/demo/states.test.ts"
  - "apps/web/lib/demo/surfaces/*.ts"
depends_on: []
out_of_scope:
  - "The store provider, routes and shell: DEMO-4. Rendering the diff: DEMO-5."
  - "Each surface's own ?state= keys beyond the universal five: that surface's ticket."
criteria:
  - id: C1
    statement: 'Over 500 seeded generated clause lists, same plus removed rebuilds the old version, same plus added rebuilds the new one, and the summary counts match; Halvorsen 4 against 3 gives "2 clauses changed, 1 added".'
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Saving Halvorsen with changed clauses appends version 5 with a built summary; saving with only the value changed adds no version and sets lastEvent saved with the changed field; delete then reset returns all 40 records."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "readDemoState returns null for an unknown, repeated or unregistered key and the key for a registered one; each surface entry lists only the universal keys its States table has (delete-dialog has no empty or loading)."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "The prefs codec round-trips every valid DemoPrefs and reads malformed JSON, a wrong v or an unknown sort as the defaults."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: 'format.ts gives "52,000 USD" and "5 Oct 2026", relative words read from DEMO_TODAY ("3 days ago"), and the version-count words read "all 4 versions" and "its only version".'
    evidence: test
    command: "yarn workspace web test"
---

# Contract — DEMO-1 demo-data

## Build notes

- **Approach:** Write the pure layer of `technical/data-contract.md` as it stands: types, fixtures, reducer, diff, clock, format, prefs codec, and the `?state=` registry. Every test is named by its criterion id (`C1 …`) and sits beside its module, so `apps/web`'s `test` script picks it up.
- **Decisions that apply:**
  - D-DEMO-6: "Records are synthetic vendor contracts with versioned terms."
  - D-DEMO-7: "Writes are fixture-local and reset on reload (keeps tickets below Q3)."
  - D-DEMO-19: "History lists every version, newest first; the Halvorsen Freight fixture has four."
  - D-DEMO-20: "A record's name comes from the records index; only the body loads, so a loading or failed record can be named."
  - D-DEMO-27 (technical.md): fixtures are typed TS modules; the live data is a pure reducer; the records index and the bodies are separate maps.
  - D-DEMO-29 (technical.md): one registry and reader for every demo `?state=` key, modelled on `apps/web/lib/sandbox/shared/state.ts`; an unknown key reads as absent.
- **Interfaces:** `_lib/record.ts` (the types); `_lib/fixtures/` (`FIXTURE_INDEX`, `FIXTURE_BODIES`, `HALVORSEN_ID`, `GREYFOLD_ID`, `KESTREL_ID`, `PELLOW_ID`, `OWNERS`); `_lib/store.ts` (`demoReducer`, `initialDemoState`, actions `create | update | delete | reset`, `lastEvent`); `_lib/diff.ts` (`diffClauses(old, new)` returning same, removed and added rows plus the summary counts); `_lib/clock.ts` (`DEMO_TODAY`, `relativeDay`); `_lib/format.ts` (`formatUsd`, `formatDate`, `versionCountWords`); `_lib/prefs.ts` (`parseDemoPrefs`, `serializeDemoPrefs`, `DEMO_PREFS_COOKIE = "pem_demo_prefs"`, `writeDemoPrefs` for the client: `Path=/demo`, `SameSite=Lax`, one-year `Max-Age`); `lib/demo/states.ts` (`DEMO_SURFACES`, `readDemoState`).
- **Per path:** `_lib/**` the modules above and their `*.test.ts`; `lib/demo/surfaces/<surface>.ts` one entry per surface (id, route pattern, sample path, keys), so each surface ticket edits only its own file; `lib/demo/states.ts` composes them and exports the reader; `states.test.ts` C3.
- **Gotchas:**
  - Deep-freeze the fixtures; the reducer copies, never mutates.
  - The diff summary words live with the diff ("2 clauses changed, 1 added"), so the history summary for a new version and the detail subtitle agree.
  - Seeded generator: a small LCG in the test file, fixed seed; no `Math.random`.
  - Greyfold Security is the bare `deleted` key's record; Halvorsen, Kestrel Cloud Hosting and Pellow Cleaning are the `partial` "Not loaded" rows. Ids are `rec_` plus 4 lowercase hex.
  - The sample path for detail, edit and delete is Halvorsen's id.
- **Model:** minimum Sonnet 5.5 at medium, recommended Opus 5.5 at medium. Choosing down tends to hand-write a diff that passes the golden case but fails the generated ones, or to call `new Date()` in a formatter and break capture parity.
