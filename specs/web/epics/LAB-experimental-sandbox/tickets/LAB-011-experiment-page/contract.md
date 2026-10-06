---
id: LAB-11
size: medium
objective: "A reviewer with live access sees each design in turn, opening on a first design drawn once for them, and switches from a bar at the bottom; the team sees the same page, uncounted."
slice_type: "The experiment page, review bar and view log (S15, door 4); the risk is a skewed or unstable draw, views logged twice or for the team, or two designs' ids in one document."
non_negotiables:
  - "R9: both designs render on the server; the switcher mounts only the shown one, inside a root marked data-sandbox-design=<id> within main; switching makes no request before the new design paints."
  - "The first design is drawn once per reviewer with crypto.randomInt and stored in sandbox_reviewers.first_design by a write that keeps the first value; later visits open on last_design."
  - "Loads and switches go to sandbox_view_events through a server action after mount, never during render; a team viewer and a closed experiment write nothing (D-LAB-14)."
  - "New queries live in packages/db/src/sandbox/experiment.ts, take (db, viewer, input), refuse a team viewer, and each has its isolation case in packages/db/test/sandbox/."
  - "The bar is fixed to the bottom in the app's tokens, a region named 'Review tools', last in DOM order; the page pads by the bar's measured height; below 768px the switcher takes its own row (D-LAB-9)."
  - "Labels are glyph plus shape name from the config, ordered with the reviewer's first design first; one design renders no switcher (D-LAB-10)."
  - "experiment.md's Words verbatim; every exp-* key registers in LAB-4's state.ts as team-only, on synthetic fixtures."
devs_call: "The component split, how the bar measures its height, the view action's result type and the deps seam."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/experiment.md"
  - "D-LAB-9"
  - "D-LAB-10"
  - "D-LAB-13"
  - "D-LAB-14"
  - "C-LAB-exp-1"
  - "C-LAB-exp-2"
  - "C-LAB-exp-3"
  - "C-LAB-exp-4"
  - "C-LAB-exp-5"
  - "C-LAB-exp-6"
  - "C-LAB-exp-7"
  - "C-LAB-exp-8"
  - "C-LAB-exp-9"
truth_files: "none: the approved proposal ux/experimental/experiment.md reaches specs/web/ux/experimental/experiment.md through yarn truth:promote LAB once its citing tickets close"
qa: Q2
reviewers:
  - assay
  - mason
focus:
  - "first-design draw is uniform and fixed; the team writes no views (mason)"
operator_review: false
planned_paths:
  - "apps/web/app/experimental/[slug]/page.tsx"
  - "apps/web/app/experimental/[slug]/actions.ts"
  - "apps/web/app/experimental/[slug]/_components/experiment/**"
  - "apps/web/lib/sandbox/experiment.ts"
  - "apps/web/lib/sandbox/experiment.test.ts"
  - "apps/web/lib/sandbox/client/switcher.ts"
  - "apps/web/lib/sandbox/client/switcher.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "packages/db/src/sandbox/experiment.ts"
  - "packages/db/src/sandbox/index.ts"
  - "packages/db/test/sandbox/isolation.test.ts"
  - "packages/db/test/sandbox/experiment.test.ts"
depends_on:
  - LAB-7
out_of_scope:
  - "Comment mode, pins, the queue and the save status's live data: LAB-12. The list behind the Comments button: LAB-13. The team's filter, pins and notes: LAB-14."
  - "The review page and its 'Look at ◆ again' link: LAB-17, which follows this ticket's ?design= interface. The ended page: LAB-21."
  - "Order log, time per design and the last design before the preference, derived from the events: LAB-23."
criteria:
  - id: C1
    statement: "On a reviewer's first visit to a 2-design experiment the opening design is drawn, stored as first_design and rendered; a reload renders it again; after a switch the next load opens on last_design; a ?design= link is ignored on the first visit and honoured after it."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "Two first visits at once for one reviewer store one first_design and both return it; a later claim never overwrites it."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C3
    statement: "Over 1,000 first visits from a seeded generator each of 2 designs is first 50% ± 5%, and the default draw is crypto.randomInt over the design count."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "client/switcher.ts plans a switch that makes no request, keeps the scroll clamped to the new page's length, logs one switch event, and announces 'Showing the Square design. 2 of your comments are on it.'"
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "A developer or admin loading, reloading and switching writes nothing: the database stub, which throws when called, is never called."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Each experiment function, called by every viewer kind, touches only the calling reviewer's row and events on their slug, and refuses a team viewer."
    evidence: test
    command: "yarn workspace @pem/db test:db"
  - id: C7
    statement: "Every design label shows a glyph and its shape name ('● Circle', '■ Square'); no A/B and no 1/2."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-011-experiment-page/evidence/exp-labels.png"
  - id: C8
    statement: "A single-design experiment renders no switcher."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-011-experiment-page/evidence/exp-single.png"
  - id: C9
    statement: "The bar never covers a header the design pins to the top, and at the page's end the last content sits clear above the bar, at 390 and 1440."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-011-experiment-page/evidence/exp-bar-clearance.png"
  - id: C10
    statement: "With keyboard alone, the switcher, Comment, Comments and Finish are reachable and operable, and a switch is announced."
    evidence: manual
    reason: "The announcement needs a person with a screen reader; no runner exists. The builder checks Tab order, arrow keys and the live region, then defers it."
  - id: C11
    statement: "Every experiment.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-011-experiment-page/evidence/exp-states.png"
---

# Contract — LAB-11 experiment-page

## Build notes

- **Approach:**
  - `page.tsx`'s experiment and team branches render every design as a server element and pass them to a `"use client"` switcher, which renders only the shown one, keyed by design id.
  - `lib/sandbox/experiment.ts` holds `drawFirstDesign(designs, randomInt)` and `openingDesignWith(deps, viewer, config, requested)`, bound to `@pem/db/sandbox`. Model the seam on LAB-7's `gate.ts` and `apps/web/lib/billing/webhook/handle.ts`.
  - The pure switch (scroll clamp, order, announcement) is `lib/sandbox/client/switcher.ts`. Client-safe modules in `lib/sandbox/client/` import nothing from `@pem/db`, `next/headers` or `env.ts`.
  - `actions.ts` adds `recordView(slug, { kind, design })`: validate, `resolveViewer`, return early for the team, then one call.
  - `ReviewBar` takes slots for the Comment toggle, the Comments button and the save status, fed by fixtures here; LAB-12 and LAB-13 wire them.
- **Decisions that apply:**
  - D-LAB-9: "The review bar sits at the bottom of the screen", because "Thumb reach; no clash with the design's header".
  - D-LAB-10: "Shape labels (Circle, Square, Triangle, Diamond) are fixed per experiment, at most four".
  - D-LAB-13: "a pin is drawn only on its own design; anchors resolve inside the shown design's root".
  - D-LAB-14: "Team visits are not counted in views or the order log".
  - R9 (D-LAB-40): "Unmounted. Both designs render on the server; the switcher mounts only the shown one, so the two designs' own ids never share a document. Switching needs no request; a design's own state resets, which is accepted."
  - S15: "For each reviewer, the variant that loads first is chosen at random and fixed."
  - data-contract.md: `sandbox_view_events` is "Never written for the team (D-LAB-14)"; `sandbox_reviewers` holds "`first_design` (drawn once, S15), `last_design`".
- **Interfaces:**
  - `data-sandbox-design="<design id>"` on the shown design's root, inside `main`. LAB-12 resolves anchors in it.
  - `/experimental/<slug>?design=<id>&from=review` opens that design with the primary "Back to your review". LAB-17 builds the link. `[ASSUMPTION: data-contract.md's URL line lists the path, ?state= and ?r=; read as barring identity data, since experiment.md says the link "may name" a design. An unknown id is ignored.]`
  - `@pem/db/sandbox`: `readReviewerDesigns(db, viewer)` returns `{ firstDesign, lastDesign, hasSent }`; `claimFirstDesign(db, viewer, { design })` returns the stored design; `recordViewEvent(db, viewer, { kind, design })` writes the event and sets `last_design`.
- **Per path:** `page.tsx`, the experiment branch replacing LAB-7's placeholder; `_components/experiment/`, the page, switcher leaf and bar; the web tests hold C1 and C3 to C5, the db tests C2 and C6 (cases in the isolation registry), named by criterion id; `state.ts`, the eleven `exp-*` keys.
- **Gotchas:**
  - Log the load from a client effect guarded by a ref, never in render: prefetch and Strict Mode would count it twice.
  - Claim with `update … set first_design = $1 where id = $2 and first_design is null returning`, then read back when no row returns. Never read and then write.
  - No `Math.random` and no modulo over random bytes. C3 injects a seeded generator.
  - The bar grows to two rows below 768px, so measure it (`ResizeObserver`) rather than use a constant.
  - The switch log is fire-and-forget after the paint; a failed log never undoes a switch. Validate every design id against the config first.
  - Web tests run only from `lib/**/*.test.ts`; `test:db` only on the local database. Fixtures are synthetic (`ana@example.com`).
  - Check R9 in the preview's DOM (one design root at a time); note it in the as-built.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model logs views in render or draws with `Math.random`, and both skew the tallies the decision rests on.
