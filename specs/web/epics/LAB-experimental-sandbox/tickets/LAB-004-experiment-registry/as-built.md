# As-built — LAB-4

## Shipped against the contract

- C1: `apps/web/app/experimental/_experiments/registry.ts` validates `registeredConfigs` at module load (a bad config throws in `next build` and in the test) and exports `experiments` and `findExperiment(slug)`, null for an unregistered slug. The test lists every folder under `_experiments`, imports its `config.ts`, and checks slug equals folder and one registry entry each. `pricing-2026` has Circle and Square, two goals, `private`, `closedOn: null`.
- C2: `validateRegistry(configs, now)` returns `REGISTRY_ERRORS` entries: fixed strings that start with the field they name and never echo the config (tested with a leaking value, and with a null config, design or question). The schemas are strict, so a misspelled field is refused, and a duplicate slug is reported even when the first config has another error.
- C3: `closedOn` is compared as an ISO string with `todayIn(SANDBOX_TIME_ZONE, now)` (`apps/web/lib/sandbox/time.ts`), never the UTC date. Tested at 23:30 UTC on 15 July (London already 16 July), on both 2026 clock changes, on 15 January, and on invalid dates such as `2026-02-30`.
- C4: each `<section>` in `circle.tsx` and `square.tsx` carries `data-sandbox-region` and `data-sandbox-name`; the test reads the sources and checks every section is marked and ids are unique per design.
- C5: `yarn workspace web lint` clean. The designs use `@pem/ui/table`, `@pem/ui/button` and tokens only; the copy is synthetic, with billing in words and no figure. Both rendered through the lazy loader on a throwaway route at 1440 and 390 (route deleted); a page overflow at 390 was fixed with `min-w-0`.
- C6: `readSandboxState(raw, viewerKind, keys?)` in `apps/web/lib/sandbox/state.ts`, with an empty `SANDBOX_STATE_KEYS`; the optional `keys` lets C6 run on synthetic keys. Prototype names and a repeated param read as absent.

## Deviations

- [ASSUMPTION] The region marker has no helper: literal attributes on each `<section>`, which C4 reads from source and LAB-12 can query directly.
- [ASSUMPTION] A design is reached as `component: () => import("./circle.tsx").then((m) => m.CircleDesign)`, a `DesignLoader` resolving to a named component; LAB-11 calls `await design.component()`.
- [ASSUMPTION] Rules the contract left open: a design id follows the slug pattern, at most 24 characters (rows store it as text); question ids follow the slug pattern and are unique per config; `targetedQuestion`, when present, is non-empty.
- [ASSUMPTION] `viewerKind` is `reviewer`, `guest` (not past the gate) or `team`.
- Each design's root is a `<div>`, not `<main>`: the page LAB-11 builds owns the `main` landmark.
- After Mason's Q2 review (no black or red): fixed messages on malformed objects, strict schemas, the duplicate check before the parse, `<div>` roots, DST tests, and C4's name says it reads literal `<section>` tags. Not taken: a lower bound on `closedOn` (any past date passes).
- `pricing-2026/content.ts` holds the copy both designs share, inside the planned `pricing-2026/**` glob.

## Not verified

- none

## Next

LAB-11 renders the designs through `findExperiment` and the loader; LAB-7 and each surface ticket register their `?state=` keys in `SANDBOX_STATE_KEYS`.
