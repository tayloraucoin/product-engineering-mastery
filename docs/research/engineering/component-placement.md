---
title: "In a Next.js App Router monorepo (a shared UI package plus apps), where should each kind of React component live, and how does a team decide when one moves?"
description: "Read before placing, moving or promoting a React component in apps/web, apps/docs or @pem/ui, or before amending codebase-conventions.md §1 or §3."
layer: research
status: archived
thread: component-placement
role: Mason
date: 2026-10-08
last_reviewed: 2026-10-08
supersedes:
load_when: "placing, moving, or promoting a React component; reviewing a PR that adds a _components/ folder or a @pem/ui entry"
---

# In a Next.js App Router monorepo (a shared UI package plus apps), where should each kind of React component live, and how does a team decide when one moves?

## Answer

Placement is decided by who imports a component, never by what kind of component it is. Next.js 16 is explicitly unopinionated about organisation. Colocating inside `app/` is already safe without private folders, and `app/_components/` versus `apps/<app>/components/` has no technical consequence. The choice is pure convention, and the repo already made it, so it stands. The written rule is right on its central point: consumer count governs. Taylor's kind-based criterion ("a primitive or composed component goes in packages/ui") should not govern placement. Kind only decides where a component sits inside `@pem/ui` once consumer count and import legality have already put it there. A domain-free composed component with one consumer stays next to that consumer. A domain-aware component that both apps render cannot go into `@pem/ui`, because `@pem/ui` may import only `@pem/config`. Its presentational part is extracted into `@pem/ui` and the domain wiring stays in each app. The written rule has one gap. "Grows beyond one route moves up to app/_components/" sends every multi-route component straight to the app root. The better target is the `_components/` of the lowest common ancestor segment of its importers. That rule gives domain grouping (`apps/web/app/admin/_components/`) for free, without a second top-level folder.

**The rule**

1. Count the importers: one route segment imports it, so it lives in that segment's `_components/`. Several segments in one app import it, so it lives in the `_components/` of the deepest segment that contains them all (`apps/<app>/app/_components/` when that is the app root).
2. Both apps import it: move it to `@pem/ui` only if every import is `@pem/config` or `@pem/ui/*`, under `primitives/` if it renders one styled element and `composed/` otherwise. If it fails that import test, extract the presentational part to `@pem/ui` and keep the domain wiring in each app's `_components/`.
3. Kind never moves a file: a generic-looking component with one importer stays co-located, and nothing is promoted before the second importer exists.
4. Move the file in the same PR that changes its importer set, up or down. Name a sub-folder under `_components/` for a domain noun, never a type (no `ui/`, `forms/`, `misc/`).

Tradeoff: generic-looking components will sit deep in route folders until a second consumer appears, and occasionally two near-duplicates will exist briefly. That cost is right at this phase because an in-app move is a one-time, reversible edit, while a `@pem/ui` export is a public surface paid for on every change. This note confirms the written rule's consumer criterion and rejects the top-level `components/` folder. It proposes an amendment to `docs/engineering/codebase-conventions.md` §1 and §3 (lowest-common-ancestor placement, the kind-is-not-a-criterion clause, the split for domain-aware shared components, domain-noun sub-folders, demotion). That amendment needs a ledger line and a changelog entry. This note itself changes nothing.

## Evidence

All sources were accessed on 2026-10-08 unless a publication date is given. "Search extract" means the text was read in the search tool's rendering of that exact primary page rather than a full fetch. GitHub tree pages refused automated fetching (robots), so repository evidence is thinner than the brief wanted, and every row says how it was seen.

### 1. Next.js 16.x docs and current practice on private folders, top-level components/, colocation

The project-structure page fetched today reports `version: 16.4.0` and `lastUpdated: 2026-07-21` in its metadata.\[1\] That is the installed major, so no older-version page was used.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Next.js calls itself "unopinionated" about how project files are organised and colocated, while providing features to help.\[1\] | https://nextjs.org/docs/app/getting-started/project-structure (v16.4.0, last updated 2026-07-21; accessed 2026-10-08) | verified | Paraphrased; one-word quotation. |
| Folders define route segments, but a route is not publicly accessible until the segment has a `page` or `route` file, and only what those files return is sent to the client. Project files can therefore be safely colocated inside `app/`.\[1\] | same page, "Colocation" | verified | This is the fact that makes the underscore optional for safety. |
| A `_folderName` private folder marks a private implementation detail and opts the folder and all its subfolders out of routing.\[1\] | same page, "Private folders" | verified | |
| Private folders are not required for colocation. The docs list four uses: separating UI logic from routing logic, consistent organisation across a project and the ecosystem, sorting and grouping in editors, and avoiding conflicts with future Next.js file conventions.\[1\] | same page | verified | The last reason is the only technical argument for the underscore. |
| The docs' route-groups table uses `app/blog/_components/Post.tsx` as the example of a non-routable "safe place for UI utilities".\[1\] | same page, "Route groups and private folders" | verified | Route-level `_components` is the docs' own example spelling. |
| Route groups `(folder)` organise routes by section, intent or team (the docs name marketing and admin pages) and allow different layouts, without affecting the URL.\[1\] | same page, "Route groups" | verified | An option for the admin tree if layouts diverge; not needed for placement. |
| `src/` is optional and only separates application code from root config files.\[1\] | same page, "src folder" | verified | Irrelevant to the decision; the repo does not use it. |
| The docs show three strategies (files outside `app`; top-level folders inside `app`; split by feature or route, with globally shared code at the `app` root and specific code in the segments that use it). The simplest takeaway is to pick one and be consistent.\[1\] | same page, "Examples" | verified | The repo's `app/_components/` plus route `_components/` is the third strategy. |
| `components` and `lib` in the examples are generalised placeholders with no special framework significance.\[1\] | same page, "Good to know" under Examples | verified | No Next.js 16 meaning attaches to a top-level `components/` folder. |
| `apps/<app>/app/_components/` and `apps/<app>/components/` are therefore technically equivalent in Next.js 16: neither is routable, and neither has framework meaning. The difference is purely conventional. | inference from the four rows above | judgment | Taylor's top-level folder buys nothing technical, and adding it would create a second convention. |
| shadcn's monorepo CLI installs primitives (e.g. `button`) into `packages/ui/src/components`, while a block such as `login-01` installs its composed `login-form` into `apps/web/components` and its primitives into `packages/ui`.\[2\] | https://ui.shadcn.com/docs/monorepo (accessed 2026-10-08; no date shown) | verified | The most widely copied template puts compositions in the app and primitives in the package. It uses a top-level `components/`, not `_components`. |
| Turborepo's guidance: application packages should not contain shared code (put it in a separate package that apps depend on), and each package should have one purpose. Its example `@repo/ui` holds "all of your shared UI components".\[3\] | https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package (accessed 2026-10-08) | verified | Best-practices headings and text read in search extract; the body was fetched. Consistent with Rule 2. |
| Kent C. Dodds's colocation principle: "Place code as close to where it's relevant as possible". His example: once the component that used it is deleted, an extracted utility lingers with its tests, because whoever deleted the component assumed the utility was more widely used. | https://kentcdodds.com/blog/colocation (published 2019-06-17) | secondary | Directly supports "when unsure, co-locate". |

Comparison of public repositories inspected:

| Repo (accessed 2026-10-08) | Route-level `_components`? | Top-level `components/`-style folder? | Grouping scheme | What the shared UI package holds | Label |
| -------------------------- | -------------------------- | ------------------------------------- | --------------- | -------------------------------- | ----- |
| shadcn/ui monorepo template, https://ui.shadcn.com/docs/monorepo | No | Yes, `apps/web/components`\[2\] | Flat; blocks land there | `packages/ui/src/components` primitives, plus `hooks/`, `lib/utils`\[2\] | verified |
| vercel/chatbot, https://github.com/vercel/chatbot | None seen | Yes, root `components/` beside `app/` (single app)\[4\] | By kind: `components/ui/` (shadcn), `components/ai-elements/`, app components at the root of `components/`\[5\] | No shared package | secondary (root tree read directly by research sub-agent; `ai-elements/` seen only via https://mintlify.wiki/vercel/openchat/customization/ui-components) |
| dubinc/dub, https://github.com/dubinc/dub/tree/main/apps/web | None; plain files colocated next to routes (e.g. `page-client.tsx`) | Yes, `apps/web/ui/` beside `app/`\[6\] | By domain plus chrome: `ui/layout/`, `ui/domains/`, `ui/modals/`, `ui/partners/`, `ui/account/`, `ui/shared/`; PR #3919 touches `ui/workspaces/`\[7\] | `@dub/ui`, published to npm; `apps/web/ui/layout/layout-loader.tsx` imports `LoadingSpinner` from it\[8\]\[9\]\[10\] | verified (apps/web tree, file page and PR file list read in search extract; https://github.com/dubinc/dub/pull/3919) |
| supabase/supabase Studio, https://github.com/supabase/supabase/tree/master/apps/studio | N/A (Pages Router) | Yes, `apps/studio/components/` | `interfaces/<Domain>/` (page-specific), `ui/` (Studio-generic), `layouts/`\[11\] | `packages/ui` basic components; `packages/ui-patterns` compositions built from npm libraries or combinations of `ui` components\[12\] | secondary (sub-folders seen via PR paths and https://deepwiki.com/supabase/supabase/2.1-studio-dashboard; the ui vs ui-patterns split is verified in the design-system README search extract, https://github.com/supabase/supabase/tree/master/apps/design-system) |
| calcom/cal.diy (Cal.com), https://github.com/calcom/cal.diy/releases | Not observed | Yes, `apps/web/components/<domain>/` and `apps/web/modules/<domain>/views/` | By domain | `packages/ui` design system; `packages/features` actively stripped of tRPC imports\[13\] | verified (release-note PR titles read in search extract: #27336 moves "16 tRPC-driven components to apps/web/modules"; #27222, #27343 similar; #27490 moves shared components the other way)\[13\] |
| t3-oss/create-t3-turbo, https://github.com/t3-oss/create-t3-turbo/discussions/965 | App-root only: `apps/nextjs/src/app/_components/posts.tsx`\[14\]\[15\] | No | Flat | `packages/ui`, "start of a UI package" on shadcn\[16\] | verified for commit 7c1da52 (referenced in discussion #965 and issue #984); current `main` not confirmed |

What the table means: no inspected codebase uses deep route-level `_components` heavily, and all the large ones (Dub, Supabase, Cal) keep a central app-level folder grouped by domain. That is evidence of what large teams do. It is not evidence that the pattern is better here. Those apps predate the App Router, or are Pages Router, and none of them enforces placement mechanically. The strongest transferable signal is Cal.com's long-running migration, which moves tRPC-driven components out of a shared package and into the app.\[13\] That is the import-legality gate in this note, learned the expensive way.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Large codebases' central `components/<domain>/` folders are a product of history (Pages Router, pre-App-Router) as much as of choice. Next.js 16's route-tree colocation makes the lowest-common-ancestor `_components/` a cheaper equivalent, because the route tree already encodes the domain. | inference from the comparison table and §1 docs rows | judgment | Why this note does not adopt Taylor's `components/<domain>/`. |

### 2. Criteria per tier

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Atomic Design defines atoms as the foundational building blocks (inputs, labels, buttons), molecules as simple groups of atoms, and organisms as relatively complex components forming discrete sections of an interface.\[17\] This is the origin of the primitive vs composition vocabulary. | https://atomicdesign.bradfrost.com/chapter-2/ (book, 2016) | secondary | Frost himself calls it not a linear process.\[18\] It is a vocabulary for kinds, not a placement rule. |
| Supabase draws the shared-package line by kind and dependencies: `packages/ui` holds basic components, `packages/ui-patterns` holds compositions that pull in npm libraries or combine `ui` components.\[12\] | https://github.com/supabase/supabase/tree/master/apps/design-system (README, search extract) | verified | Two kind-based tiers inside the shared layer; consumer count chooses the layer. |
| Supabase's Studio placement rule (Cursor rules file): Studio-specific components go in `apps/studio/components`, Studio-generic UI in `components/ui`, page-specific components in `components/interfaces/<Area>`, and new primitives in `packages/ui` only when asked.\[11\] | https://github.com/code/lib-supabase/pull/261/files (mirror of `.cursor/rules/studio-ui.mdc`) | secondary | A mirror repository, not the upstream tree. |
| shadcn treats a "block" (a domain-light composition like a login form) as app code, not shared-package code.\[2\] | https://ui.shadcn.com/docs/monorepo | verified | Directly contradicts "composed goes in packages/ui". |
| Bulletproof React keeps domain code in `src/features/<feature>/`, forbids cross-feature imports, and enforces a one-way flow shared, then features, then app, with ESLint `import/no-restricted-paths`.\[19\]\[20\] | https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md (accessed 2026-10-08) | secondary | Same direction as this repo's Rule 2, applied inside one app. |
| Feature-Sliced Design orders layers app, pages, widgets, features, entities, shared; a module may import only from layers strictly below, and one feature may not import another (composition happens in a higher layer).\[21\]\[22\] | https://feature-sliced.design/docs/get-started/faq (accessed 2026-10-08) | secondary | Critics (e.g. https://sandroroth.com/blog/project-structure/) note that real feature modules do depend on each other.\[23\] |
| The tier criteria for this repo: consumer count picks the tier; import legality gates `@pem/ui`; kind (one styled element vs several arranged) picks `primitives/` vs `composed/` inside `@pem/ui`; domain knowledge (a domain noun or type, a tRPC hook from `@pem/api/react`, a server action, `@pem/env`, app routes or `next/navigation` to app paths) disqualifies `@pem/ui` outright. | conventions §1, §4 applied to the sources above | judgment | Each criterion is visible in the file's path or import list, which is what makes it agent-decidable. |
| Taylor's two disagreement cases resolve as follows. A domain-free composed component with one consumer stays in that consumer's `_components/`, because kind does not move files. A domain-aware component both apps render is split: the props-in presentational part goes to `@pem/ui/composed/...`, and each app keeps a thin wrapper in its own `_components/` that supplies data and domain types. If the domain part is itself large and must be shared, that is a new-package decision (one-way door) that needs a decision record, not a placement call. | conventions §1, §4 | judgment | Duplicating two thin wrappers is cheaper than a wrong package. |
| Server Component by default (Rule 4) favours the split above: the shared presentational part can usually stay a Server Component or a small `"use client"` leaf, while data fetching stays in the app's server tree. | conventions Rule 4 | judgment | A `@pem/ui` component that needs app data has to take it as props. |

### 3. Promotion and who decides

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Sandi Metz: "duplication is far cheaper than the wrong abstraction". When an abstraction proves wrong, re-introduce duplication and let it show what is right.\[24\] | https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction (published 2016-01-20) | secondary | Argues against speculative promotion. |
| Kent C. Dodds's AHA ("Avoid Hasty Abstractions") prefers duplication until the abstraction is clear, and deliberately sets no hard threshold.\[25\] | https://kentcdodds.com/blog/aha-programming (published 2019-04-01) | secondary | Its lack of a number is exactly why it is not agent-decidable. |
| GitHub Primer's on-ramp: a new component starts as a custom component in a feature team's app and becomes a Primer component once it matures and gets more usage. Primer may decline, and the team keeps a locally owned implementation.\[26\]\[27\] | https://primer.style/product/contribute/adding-new-components/ and https://primer.style/product/contribute/handling-new-patterns/ (accessed 2026-10-08) | secondary | Promotion is pulled by usage and gated by the system owner. This mirrors the in-app vs `@pem/ui` split here. |
| Trigger: promote at the moment the second importer is written, in that PR, never speculatively. The rule of three is rejected because "third" is not decidable when consumers live in two apps, and Rule 1 already says two consumers means extract. | conventions Rule 1 | judgment | A second importer is a fact in the diff; a predicted one is not. |
| Who decides: an in-app move (route `_components/` up to a common-ancestor `_components/`) is reversible, so the PR author makes it mechanically under rule lines 1 and 4. A new `@pem/ui` subpath export is close to a one-way door (a public API both apps bind to), so it needs `yarn lint:boundaries` and `yarn check-ui-layout` to pass plus review by the `@pem/ui` owner. `[ASSUMPTION: the @pem/ui owner is Mason, as owner of the conventions doc, reversible]` | conventions Rule 2, §4; Mason's reversibility principle | judgment | |
| Demotion is the mirror image: when importers drop back to one, the file moves back down in the same PR. A file with zero importers is deleted.\[28\] | Kent C. Dodds colocation (utilities outliving consumers) | judgment | Keeps the entropy test honest. |

### 4. Grouping app-level components by domain

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Next.js's "split by feature or route" strategy puts globally shared code at the root of `app` and specific code in the segments that use it.\[1\] | https://nextjs.org/docs/app/getting-started/project-structure (v16.4.0) | verified | The lowest-common-ancestor rule is this strategy made decidable. |
| Large public apps group app-level components by domain (Dub `apps/web/ui/<domain>/`, Cal `apps/web/components/<domain>/` and `modules/<domain>/`, Supabase `components/interfaces/<Domain>/`) and keep a separate bucket for non-domain chrome (Dub `ui/layout/`, `ui/shared/`; Supabase `components/layouts/`, `components/ui/`). | comparison table in §1 | secondary | Mixed evidence quality; see that table's labels. |
| In this repo the route tree is the domain grouping. Components used only under `/admin` live in `apps/web/app/admin/_components/`. Components used under several unrelated segments live in `apps/web/app/_components/`, optionally in a sub-folder named for a domain noun (e.g. `apps/web/app/_components/sandbox/`). No `apps/web/components/` is created. | Next.js docs plus conventions §3 | judgment | One convention, not two. A sub-folder exists only when it holds files from one domain. |
| Non-domain app chrome (theme toggle, providers, shell, floating controls) lives directly in `apps/<app>/app/_components/` with no sub-folder. A type-named bucket (`ui/`, `common/`, `shared/`) would be a catch-all of the kind §8 forbids. | conventions §8 | judgment | Dub's `ui/shared/` is the pattern to avoid. |
| Several nested `_components/` folders in one section are normal under the docs' route-split strategy, and healthy exactly when no file inside one is imported from outside that folder's segment subtree. | Next.js docs example `app/blog/_components/Post.tsx`; conventions Rule 1 | judgment | No public source was found stating a depth or count limit. |

### 5. Case studies

The research cannot see these files. Every verdict below is judgment, conditional on the checks listed. Each check is a single command or glance in the repo.

#### 5a. apps/web/app/experimental/[slug]/review/_components/choice-group.tsx

Verdict: page-local, and it stays where it is. It is not an app component and not `@pem/ui` while it has one importer, however generic its name.

Reasoning: rule line 3. A generic name is a prediction of reuse, not a consumer. If a second route in `apps/web` imports it, it moves to the lowest common ancestor `_components/` (likely `apps/web/app/experimental/_components/` or `apps/web/app/_components/`). Only if `apps/docs` imports it does `@pem/ui` become eligible, and then only as `composed/` (a group of choices arranges several primitives). The real risk is duplication. If it re-implements a radio or checkbox group with raw inputs while `@pem/ui` already has such a primitive, the fix is to rebuild it on that primitive in place. Moving it does not fix that.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Correct tier today is the route's `_components/`, provided exactly one segment imports it. | conventions Rule 1; rule line 1 | judgment | |
| `@pem/ui` eligibility requires imports limited to `@pem/config`, `@pem/ui/*`, React and (by assumption) third-party UI libraries: no domain types (e.g. a review-question type from `@pem/validators`), no `@pem/api/react` hooks, no server actions, no `next/navigation` pushes to app paths. `[ASSUMPTION: "may import only @pem/config" constrains workspace packages, not npm dependencies, reversible]` | conventions §4 | judgment | |
| If it takes domain-shaped props (a `ReviewQuestion` rather than `options: {value, label}[]`), it is a domain component and never `@pem/ui`-eligible as written. | conventions §4 | judgment | |

Confirming checks:
- Importers: `rg -l "choice-group" apps packages`. Exactly one hit outside the file itself means the verdict holds.
- Imports: `rg "^import" "apps/web/app/experimental/[slug]/review/_components/choice-group.tsx"`. Any `@pem/validators`, `@pem/api`, `@pem/services`, `@/`-app path or `next/navigation` rules out `@pem/ui`.
- Duplication: `ls packages/ui/**/primitives/` for a radio-group, checkbox or toggle-group primitive. If one exists and the file does not import it, rebuild on it in place.

#### 5b. apps/web/app/_components/floating-theme-toggle.tsx

Verdict: correctly placed if it is imported by `apps/web/app/layout.tsx` or by components in more than one top-level segment. The lowest common ancestor is then the app root. It would not move to `apps/web/components/<sub-folder>/`, because that folder should not exist. It is a `@pem/ui` candidate only if `apps/docs` also renders a theme toggle, which is unknown.

Reasoning: "floating" is positioning, and positioning is app chrome decided by each app's layout. Toggling the theme is a reusable control. If `apps/docs` needs one too, the right split is a `ThemeToggle` control in `@pem/ui` (`composed/` if it pairs a button with an icon swap, `primitives/` if it is one styled button). `floating-theme-toggle.tsx` stays in `apps/web/app/_components/` as a thin wrapper that adds fixed positioning. As chrome, it sits directly in `app/_components/`, not in a sub-folder.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| App-root `_components/` is right for a component imported by the root layout. | conventions §3; rule line 1 | judgment | |
| A shared `ThemeToggle` must get theme state through props or a theme library, not an app provider path, to stay `@pem/ui`-legal. Colours must come from tokens (Rule 5). | conventions §4, Rule 5 | judgment | If it reads an app-local provider in `apps/web/app/_components/`, it fails the import test. |
| Until `apps/docs` imports a theme toggle, no `@pem/ui` export is created. | rule line 3 | judgment | Possible future need is not a consumer. |

Confirming checks:
- Importers: `rg -l "floating-theme-toggle" apps`. Root layout or two or more segments means it stays at the app root. A single deep segment means it moves down into that segment's `_components/`.
- Does docs need one: `rg -il "theme" apps/docs/app`. Any toggle there means do the split above in the PR that adds the second consumer.
- Imports: `rg "^import" apps/web/app/_components/floating-theme-toggle.tsx`. Check that `"use client"` is on line 1 (Rule 4) and that no colour literals appear (Rule 5).

#### 5c. The admin tree's five _components folders

Verdict: five nested private folders are healthy colocation if each folder's files are imported only from inside that folder's segment subtree. A folder counts as fragmented when any of its files is imported from a sibling or cousin segment (that file belongs at the lowest common ancestor, probably `apps/web/app/admin/_components/`), or when a file has no importers at all (delete it). The domain folder for admin is `apps/web/app/admin/_components/`. `apps/web/components/admin/` should not be created.

Reasoning: the count of folders is not the signal. The question is whether any file sits lower or higher than its importer set says. Deep folders that hold only segment-local files are the docs' own pattern. Consolidating everything into one admin folder up front would trade locality for nothing.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| Mechanical decision per file: compute its importer set, compute the deepest segment containing all importers, and compare with the file's current `_components/` parent. A mismatch means move. | rule lines 1 and 4 | judgment | Decidable without asking. |
| If, after moves, `apps/web/app/admin/_components/` holds files from two distinct admin sub-domains with several files each, sub-folders named for those nouns are allowed. | rule line 4 | judgment | |
| A route group (e.g. `app/(admin)/`) is only warranted if admin sections need different layouts. It is not a placement tool.\[1\] | https://nextjs.org/docs/app/getting-started/project-structure (v16.4.0) | verified | The docs list layout and organisation reasons only. |

Confirming checks:
- Locate: `find apps/web/app/admin -type d -name _components` (expect five).
- For each file `f` in those folders: `rg -l "$(basename "$f" .tsx)" apps/web/app`. Every importer path should start with the folder's parent segment path. Any that does not means the file moves to the common ancestor. Zero importers means delete.

### Enforcement

Rules that only reviewers watch will erode. This is the substance that should become mechanical; the mechanism belongs to the harness owner.

| Claim | Source (dated) | Label | Note |
| ----- | -------------- | ----- | ---- |
| The `@pem/ui` import gate (rule line 2) is already mechanical via `yarn lint:boundaries` (`packages/config/eslint/boundaries.js`, `ELEMENTS` and `PACKAGE_IMPORTS`). The `primitives/` vs `composed/` placement is mechanical via `yarn check-ui-layout`. | conventions Rule 2, §4 | judgment | Existing; no change needed. |
| `import/no-restricted-paths` takes zones of `target`, `from` and an optional `except`. `except` is relative to `from` and cannot backtrack, and target-side exceptions are an open enhancement request (issue #3050).\[29\]\[30\] One generic zone therefore cannot say "a `_components/` folder may only be imported from within its own segment subtree" without one zone per folder. | https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md ; https://github.com/import-js/eslint-plugin-import/issues/3050 (accessed 2026-10-08) | secondary | |
| eslint-plugin-boundaries can capture path fragments in element patterns and reuse them in rule selectors. Its v7.0.0 release (2026-07-04; latest 7.2.0) makes the `from` and `to` template properties expose element, file and module objects (e.g. `{{from.element.types}}`), and renames the rule's `rules` option to `policies`. The release notes describe the template properties for custom messages, so a "same segment prefix" policy is not confirmed expressible, and it was not tested. | https://github.com/javierbrea/eslint-plugin-boundaries/releases (accessed 2026-10-08) | secondary | The package is being renamed to `@boundaries/eslint-plugin`.\[31\] |
| Feature-Sliced's Steiger linter ships an `insignificant-slice` rule. It flags slices with no references (suggesting removal) and slices with exactly one reference (suggesting a merge into the layer above), and it exempts pages. That is a mechanical consumer-count check, but only for FSD layouts. | https://github.com/feature-sliced/steiger (rule README at `packages/steiger-plugin-fsd/src/insignificant-slice/README.md`, accessed 2026-10-08) | secondary | Shows the check is buildable, not a recommendation to adopt FSD. |
| Recommended new structural check (substance only): for every file under `apps/*/app/**/_components/`, fail if an importer lies outside the folder's parent segment (it should move up). Fail if all importers lie inside a single child segment (it should move down). Fail if there are no importers (delete it). Fail if a sub-folder under `_components/` has a type name (`ui`, `forms`, `common`, `shared`, `misc`). Each message should name the target path. | rule lines 1, 3, 4 | judgment | A path-prefix script in the style of `check-ui-layout` is simpler than an ESLint encoding. The harness owner decides. |
| Left to review judgment: whether a component is one styled element or several (where `check-ui-layout` cannot tell), whether a shared component's domain wiring is "thin" enough to split, and whether a near-duplicate should wrap an existing primitive. | | judgment | |

Convergence tests on the rule. Contract: an agent holding the conventions doc, this rule and a ticket gets the same placement from the import list and paths alone. Entropy: copied ten times, the rule produces files that sit where their importers are and that move or die when the importers change, which is better than a growing `components/` bucket. Boundary: `@pem/ui` remains import-gated, so the graph stays downward-only.

## Not found

- The contents, imports and actual importers of `apps/web/app/experimental/[slug]/review/_components/choice-group.tsx`, `apps/web/app/_components/floating-theme-toggle.tsx`, and every file under the admin tree. These are not visible to this research.
- The exact paths of the five `_components` folders under `apps/web/app/admin/`.
- Whether `apps/docs` renders or needs a theme toggle.
- Whether `@pem/ui` already has a radio-group, checkbox-group or toggle-group primitive, and the exact root of `primitives/` inside `packages/ui` (the `packages/ui/AGENTS.md` layout was not available).
- Any difference between the 15.x and 16.x versions of the project-structure page. Only the 16.4.0 page was read, so no difference was looked for or found.
- Any Next.js 16 statement about a top-level `components/` folder beyond the "placeholder, no framework significance" note. None exists on the page read.
- Direct reads of GitHub repository trees for supabase/supabase, calcom/cal.diy, dubinc/dub and t3-oss/create-t3-turbo (robots-blocked). The current `main` state of create-t3-turbo's `src/app/_components/`. Dub's merged state of `apps/web/ui/workspaces/`.
- The text of Cal.com's `agents/rules/architecture-features-modules.md` (only its index entry was seen).\[32\]
- vercel/commerce, vercel/platforms, documenso, formbricks, midday, payload, langfuse, plane and novu were not inspected within budget.
- Shopify Polaris, IBM Carbon, Atlassian and Radix Themes contribution or promotion models. Only Primer was read.
- dependency-cruiser, Nx module-boundary tags and knip were not checked this session, including whether any of them can express the segment-subtree constraint.
- No public source was found that sets a depth or count limit for nested route-level private folders.

## Promote to library

No. The decision content is placement law specific to this repo's tiers and import limits, and it is still a draft amendment. Once it is adopted and has survived one quarter of use, the general part (consumer set decides tier; lowest common ancestor for multi-route components; kind only chooses the slot inside the design-system package) could be proposed for the library. That would go only through the `docs/references/_meta/` procedure, never by copying this file.

Proposed follow-ups (proposed, not done):

- Ledger line for `docs/decisions/ledger.md` (proposed): `2026-10-08 · Component placement: importer set picks tier (route _components -> lowest-common-ancestor _components -> @pem/ui only if imports are @pem/config/@pem/ui); kind only picks primitives/ vs composed/; no apps/<app>/components/ · rejected: kind-based placement + top-level components/<domain>/ · revisit when a third app lands in apps/ or apps/web/app/_components/ exceeds 40 files · owner Mason`
- Changelog entry for `docs/decisions/changelog.md` (proposed): `2026-10-08 · codebase-conventions.md §1, §3 amended: multi-route components move to the lowest common ancestor segment's _components/ (not always app/_components/); component kind is not a placement criterion; domain-aware components rendered by both apps split into a @pem/ui presentational part plus per-app wrappers; _components/ sub-folders named for domain nouns only; files move down or are deleted when importers drop. Source: docs/research/engineering/component-placement.md.`
- Sections to edit (proposed): `docs/engineering/codebase-conventions.md` §1 (add the kind-is-not-a-criterion sentence and the split rule for domain-aware shared components) and §3 (replace "move up to app/_components/" with the lowest-common-ancestor wording, add the sub-folder naming rule and demotion). §4, §8 and Rule 2 need no change.
- Harness-owner request (proposed): a structural check for route `_components/` importer locality, as specified in Enforcement.

## Sources

1. <https://nextjs.org/docs/app/getting-started/project-structure>
2. [Monorepo](https://ui.shadcn.com/docs/monorepo)
3. [Creating an Internal Package](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package)
4. [GitHub - vercel/chatbot: A full-featured, hackable Next.js AI chatbot built by Vercel](https://github.com/vercel/chatbot)
5. [UI components - Vercel AI Chatbot](https://mintlify.wiki/vercel/openchat/customization/ui-components)
6. [dub/apps/web at main · dubinc/dub](https://github.com/dubinc/dub/tree/main/apps/web)
7. [Staging & sandbox workspaces by devkiran · Pull Request #3919 · dubinc/dub](https://github.com/dubinc/dub/pull/3919)
8. [dubinc/dub](https://deepwiki.com/dubinc/dub)
9. [dub/apps/web/ui/layout/layout-loader.tsx at main · dubinc/dub](https://github.com/dubinc/dub/blob/main/apps/web/ui/layout/layout-loader.tsx)
10. [dub/packages/ui at main · dubinc/dub](https://github.com/dubinc/dub/tree/main/packages/ui)
11. [github.com](https://github.com/code/lib-supabase/pull/261/files)
12. [supabase/apps/design-system at master · supabase/supabase](https://github.com/supabase/supabase/tree/master/apps/design-system)
13. [Releases · calcom/cal.diy](https://github.com/calcom/cal.diy/releases)
14. [feat: Hydrate Client Component (QueryClient) state w/ dehydrate in RSC · t3-oss/create-t3-turbo · Discussion #965](https://github.com/t3-oss/create-t3-turbo/discussions/965)
15. [feat: Hydrate Client Component (QueryClient) state w/ dehydrate in RSC · Issue #876 · t3-oss/create-t3-turbo](https://github.com/t3-oss/create-t3-turbo/issues/876)
16. [GitHub - VaniaPopovic/create-t3-turbo: Clean and simple starter repo using the T3 Stack along with Expo React Native · GitHub](https://github.com/VaniaPopovic/create-t3-turbo)
17. [Atomic Design Methodology](https://edits.atomicdesign.bradfrost.com/chapter-2/)
18. [From Template to Atoms.](https://bradfrost.com/blog/link/from-template-to-atoms/)
19. [bulletproof-react/docs/project-structure.md at master · alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
20. [bulletproof-react/AGENTS.md at master · alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/AGENTS.md)
21. [FAQ](https://feature-sliced.design/docs/get-started/faq)
22. [Feature Sliced Design - Skills - Claude Code Marketplaces](https://claudemarketplaces.com/skills/feature-sliced/skills/feature-sliced-design)
23. [How to structure your React projects](https://sandroroth.com/blog/project-structure/)
24. [The Wrong Abstraction — Sandi Metz](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
25. [AHA Programming 💡](https://kentcdodds.com/blog/aha-programming)
26. [Adding new components](https://primer.style/product/contribute/adding-new-components/)
27. [Handling new patterns](https://primer.style/product/contribute/handling-new-patterns/)
28. [Colocation](https://kentcdodds.com/blog/colocation)
29. [eslint-plugin-import/docs/rules/no-restricted-paths.md at main · import-js/eslint-plugin-import](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md)
30. [Enhancement: \[import/no-restricted-paths\] accept target exceptions · Issue #3050 · import-js/eslint-plugin-import](https://github.com/import-js/eslint-plugin-import/issues/3050)
31. [RFC: Plugin Rename to \`@boundaries/eslint-plugin\` · javierbrea/eslint-plugin-boundaries · Discussion #371](https://github.com/javierbrea/eslint-plugin-boundaries/discussions/371)
32. [cal.diy/agents at main · calcom/cal.diy](https://github.com/calcom/cal.diy/tree/main/agents)
