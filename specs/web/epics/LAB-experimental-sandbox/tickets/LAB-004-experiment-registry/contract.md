---
id: LAB-4
size: small
objective: "Every experiment is one validated config in apps/web, found by slug through one registry, and the demo pricing-2026 ships with two marked designs, so the gate, pages and /admin read one source for designs, goals, mode and close date; one reader decides who may render each ?state= key."
slice_type: "Config schema and demo content (S13, S14, S30); the risk is a config that passes with a bad slug, a future close date or a duplicate, which later orphans rows or opens a closed review."
non_negotiables:
  - "One config.ts per experiment in apps/web/app/experimental/_experiments/<slug>/, registered in _experiments/registry.ts; there is no experiments table."
  - "A slug matches ^[a-z0-9]+(-[a-z0-9]+)*$, is at most 48 characters, equals its folder name and is unique; design ids and slugs never change once rows hold them."
  - "designs: 1 to 4, each a distinct shape of circle, square, triangle, diamond, and a distinct id; goals: 2 to 3; mode private or collaborate; coreVersion v1."
  - "closedOn is an ISO date or null, never after today in Europe/London (one constant in apps/web/lib/sandbox/time.ts)."
  - "config.ts and registry.ts hold no JSX, no static .tsx import and no @/ alias, so node --test loads them."
  - "The demo is synthetic only (S30): no client name, real person, price or email; every section carries a stable region id and a human name; the designs use @pem/ui components and preset tokens only, with no slop tell (canon §2, A-01 to A-20)."
  - "apps/web/lib/sandbox/state.ts is the one ?state= reader for the sandbox: a key marked anyone renders for any viewer, a key marked team only for a team viewer; a refused or unknown key reads as absent (data-contract.md)."
devs_call: "The zod schema's layout, how the component is reached lazily, the region marker's helper shape, and the demo's sections and copy."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/technical/data-contract.md"
  - "D-LAB-10"
  - "D-LAB-25"
  - "D-LAB-41"
truth_files: "none: config and demo code; each experiment surface's UX file promotes with its own ticket"
qa: Q2
reviewers:
  - mason
focus:
  - "config validation: slug rule, closedOn never in the future (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/_experiments/registry.ts"
  - "apps/web/app/experimental/_experiments/pricing-2026/**"
  - "apps/web/lib/sandbox/time.ts"
  - "apps/web/lib/sandbox/registry.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "apps/web/lib/sandbox/state.test.ts"
depends_on: []
out_of_scope:
  - "The experiment page, the switcher and the first-design draw: LAB-11."
  - "Reading region markers and drawing pins: LAB-12."
  - "Rendering the core and extra questions: LAB-17, LAB-18."
  - "The /admin experiments list: LAB-10. resolveViewer's registry lookup: LAB-5."
criteria:
  - id: C1
    statement: "Every registered config parses; each folder under _experiments holds a config whose slug equals the folder, and the registry lists each once; pricing-2026 has designs Circle and Square, two or three goals, mode private and closedOn null."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "The validator refuses synthetic configs with a duplicate slug, a bad slug (upper case, edge or double hyphen, 49 characters), 0 or 5 designs, two designs sharing a shape or id, 1 or 4 goals, or an unknown mode, each with a fixed message naming the field."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "closedOn equal to today in Europe/London passes and tomorrow is refused, including at an instant when the UTC and London dates differ (23:30 UTC in summer)."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "Each demo design's source marks every section with a region id and a human name, ids unique within the design."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "The demo designs pass the token and UI lint with no warning."
    evidence: check
    command: "yarn workspace web lint"
  - id: C6
    statement: "readSandboxState returns a synthetic anyone key for a reviewer, a guest and the team, a synthetic team key only for the team, and null for that team key read by anyone else and for an unknown key."
    evidence: test
    command: "yarn workspace web test"
---

# Contract — LAB-4 experiment-registry

## Build notes

- **Approach:**
  - `registry.ts` exports the zod schema, a pure `validateRegistry(configs, now)` (C2, C3 feed it synthetic configs and a fixed clock), `experiments` (parsed once at module load, so a bad config also fails `next build`) and `findExperiment(slug)`, returning the config or null.
  - `pricing-2026/config.ts` holds the data. `circle.tsx` and `square.tsx` are the two designs. Each design is reached lazily (`component: () => import("./circle.tsx")`, judgment, Mason) or through a sibling map; either way config.ts stays loadable by node.
  - `lib/sandbox/time.ts` exports `SANDBOX_TIME_ZONE = "Europe/London"` and a `todayIn(zone, now)` helper. LAB-20's email reads the same constant.
  - The test sits in `lib/sandbox/` because `yarn workspace web test` runs only `lib/**/*.test.ts`. It imports the registry by relative path with `.ts` extensions, as `lib/billing/webhook/handle.test.ts` imports its module. C4 reads the `.tsx` sources as text.
- **Decisions that apply:**
  - D-LAB-10: "Shape labels (Circle, Square, Triangle, Diamond) are fixed per experiment, at most four." Why: "Free text means one thing across reviewers."
  - D-LAB-25: "The config records the date an experiment closed."
  - data-contract.md: "gate keys render for anyone, since they hold no data and the gate stays one face. Every other sandbox key renders only for the team, on synthetic fixtures."
  - D-LAB-41 (R10): "`Europe/London`, named in the email, one constant. The config's `closedOn` is an ISO date or null, one field, so closed always has a date."
  - Config (data-contract.md): "`slug`, `title`, `designs` (1 to 4, each `{ id, shape, component }`), `goals` (2 to 3), `targetedQuestion?`, `questions`, `mode` (`private` or `collaborate`), `coreVersion` (`v1`), and `closedOn`."
  - S15 (brief): "Labels are neutral: shape or colour tokens, never A/B or 1/2."
  - S30 (brief): "a demo experiment in `apps/web`: two variants, comments and a form, with synthetic content only."
  - pins.md: "Every experiment marks its commentable regions with a stable id and a human name. The demo marks every section."
  - Slug naming (gate.md, D-LAB-38): "a slug is named like a title you would not mind leaking. `pricing-2026`, never a client's name."
- **Interfaces:**
  - `type ExperimentConfig`, `experimentConfigSchema`, `validateRegistry`, `experiments`, `findExperiment(slug): ExperimentConfig | null`.
  - `questions`: `{ id, text }[]` `[ASSUMPTION: an extra question is free text with a stable id; LAB-17 may extend the shape with an as-built line]`.
  - `readSandboxState(raw, viewerKind)` and `SANDBOX_STATE_KEYS` (state.ts), each key marked `anyone` or `team`. It ships with no surface keys: LAB-7 registers the gate keys as `anyone`, and every other surface ticket registers its own as `team`. (Moved here from LAB-7 at the gate, 2026-10-06, so it exists before wave 2's two batches run in parallel.)
  - The region marker: `data-sandbox-region="<id>"` and `data-sandbox-name="<human name>"` on each marked element. LAB-12 reads these; rename only with an as-built line before LAB-12 starts.
- **Per path:**
  - `registry.ts`: schema, validator, list, lookup.
  - `pricing-2026/config.ts`, `circle.tsx`, `square.tsx`: the demo. A synthetic pricing page (plans, a comparison table, FAQ), the two designs laid out differently.
  - `lib/sandbox/time.ts`: the zone constant.
  - `lib/sandbox/state.ts`, `state.test.ts`: the reader, the empty registry and C6. Prior art: `apps/web/app/page.tsx` reads `?state=` today.
  - `lib/sandbox/registry.test.ts`: C1 to C4, test names starting with the criterion id.
- **Gotchas:**
  - `_experiments` is a private folder (the underscore opts it out of routing), so it adds no route.
  - Node's type stripping loads `.ts`, never `.tsx`, and resolves no `@/` alias.
  - Region ids need only be unique within a design: two designs may share one, and anchors resolve inside the shown design's root (D-LAB-13).
  - The design id is stored in rows as text: keep ids short and permanent, as `circle` and `square`.
  - zod 4: type a function field with `z.custom`, not `z.function()`.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model compares `closedOn` with a UTC date, which passes or refuses a day early in British Summer Time.
