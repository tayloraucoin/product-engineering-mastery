---
title: "The React UI library market: Quartermaster's component-sourcing ledger"
description: "Read only to trace docs/design/component-sources.md or to re-score a component source."
layer: research
status: archived
thread: P-M
role: Quartermaster
date: 2026-10-03
last_reviewed: 2026-10-03
supersedes:
load_when:
---

# The React UI library market: Quartermaster's component-sourcing ledger

## 1. Recommendation to Plumb

Bottom line: keep shadcn/ui core as the only installed source and move it to the Base UI track. Admit two ecosystem sources, Dice UI and tablecn, only as commit-pinned GitHub registry items that pass the amended A2 review. Mine everything else for patterns; do not install it. Verified evidence (React 19, licence, activity; read 2026-10-03) is thin across the ecosystem, so the short-list is small on purpose. It is not a market ranking.

**Short-list and proposed verdicts (all dated 2026-10-03)**

| LIB | Source | Proposed verdict | One-line reason |
|---|---|---|---|
| LIB-01 | shadcn/ui core | Adopt (baseline) [PROPOSED] | MIT; React 19 and Tailwind v4 named in its changelog;\[1\] 64 components; schema-documented registry\[2\]\[3\] |
| LIB-34 | Base UI | Adopt as primitive base [PROPOSED] | shadcn default since July 2026;\[4\] v1.8.0 on 2026-09-04; monthly releases\[5\]\[6\] |
| LIB-33 | Radix Primitives | Defer: existing Radix code only; re-score at next shadcn major [PROPOSED] | Maintained (commits 2026-07-13) and supported by shadcn, but no longer the default\[4\]\[7\] |
| LIB-05 | Dice UI | Adopt after edits [PROPOSED] | MIT; PRs merged 2026-10-02; serves shadcn v4 style builds\[8\]\[9\]\[10\] |
| LIB-06 | tablecn | Adopt after edits, data grid only [PROPOSED] | MIT; TanStack Table; server-side filter/sort/paginate\[11\]\[12\] |
| LIB-12 | ReUI | Mine, not install [PROPOSED] | MIT core mixed with a proprietary Pro tier whose items need a licence key\[13\]\[14\] |

**The base decision.** Base UI becomes the shadcn base for this toolkit (`style: base-*` in `components.json`). Radix stays only where it already exists; no new Radix-based component is added. Detail in §4.0. [NEEDS DECISION]

**The A2 amendment (smallest change).** Replace "Only the @shadcn registry." with:

> "Only the @shadcn registry and the sources listed as sanctioned in docs/design/component-sources.md. A sanctioned item is addressed as `owner/repo/item#<full commit SHA>` (or a namespace pinned in `components.json`), inspected with `yarn shadcn add <item> --dry-run` and `--diff` before any write, and rejected if it declares `envVars`, `font`, a `~/` target outside `packages/ui/**`, a `css` `@plugin` or `@layer base` rule, or `cssVars` not mapped in the product's tokens.md. Any new primitive still requires a justification in the package and a ruling per the product's `components.md`; propose, do not add." [PROPOSED]

The deltas to the existing review procedure are in §7. One prerequisite blocks everything: every registry fetch, including `@shadcn` itself from ui.shadcn.com, goes to a domain outside the sandbox allowlist (§7.5). [NEEDS DECISION — BLOCKING]

## 2. Method and coverage

- **Window.** All reads on 2026-10-03, from docs pages, GitHub repo pages, LICENSE files, release pages and registry schema docs. Nothing was installed, run or npx'd.
- **Labels.** verified (primary, dated) / secondary (named third party) / judgment (Quartermaster).
- **Pins.** Node 22, TypeScript 5.9.2, Next.js 16.3.8 App Router, React 19.2.8, Tailwind CSS 4.x.
- **Gates, in order.**
  - G0 "is a component source" [ASSUMPTION: pre-gate added so indexes, directories and theme tools are recorded rather than scored]
  - G1 React 19 + App Router
  - G2 release or meaningful commit within 12 months
  - G3 commercial-use licence, named
  - G4 Tailwind v4 or CSS-variable token-adaptable
  - G5 not archived or deprecated
- **G1 evidence rule.** [ASSUMPTION: G1 passes on (a) the library's own docs naming React 19 and Tailwind v4, (b) primary repo artefacts showing it serves the shadcn v4 style builds (`radix-vega`, `base-vega`), which target the React 19 / Tailwind v4 core, or (c) being a primitive that shadcn core v4 ships for both styles. Anything less is recorded as "G1 not verified", not as an incompatibility.] TypeScript 5.9 compatibility was not stated by any source read; marked not found throughout.
- **Coverage.** 75 rows found; 6 short-listed; 15 comparison only; 10 composed dependencies not screened separately; 44 screened out, each with its gate.
- **Research limits.** The search budget ran out before every seeded library was opened; the registry index file was refused by the fetch tool.
- **Scoring.** 0 fails, 1 weak, 2 sound, 3 best in class. Stars and downloads are not used for any grade.
- **React Native.** Out of scope; seen only shadcn-vue and Svelte ports and an MCP mirror flag.

## 3. Universe

Counts: found 75 · short-listed 6 · comparison only 15 · dependency 10 · screened out 44 (G0: 5, G1: 35, G2: 1, G3: 3, G4: 0, G5: 0).

| ID | Library | Owner / domain (verified 2026-10-03 unless noted) | Category | Status | Gate / evidence |
|---|---|---|---|---|---|
| LIB-01 | shadcn/ui core | shadcn (Vercel), ui.shadcn.com\[15\] | Components + CLI | Short-listed | Passes G1–G5 |
| LIB-02 | shadcn.io | Azencot LLC; states it is not affiliated with shadcn/ui\[16\] | Community registry | Screened out | G3: licence terms not read |
| LIB-03 | awesome-shadcn-ui | awesome-shadcn-ui.vercel.app; owner not established | Awesome list | Screened out | G0: index; not reached |
| LIB-04 | Bundui | bundui.io; in shadcn directory (secondary: Grokipedia)\[17\] | Registry | Screened out | G1 not verified |
| LIB-05 | Dice UI | Sadman Sakib (sadmann7), diceui.com\[9\]\[18\] | Registry | Short-listed | Passes G1(b)–G5 |
| LIB-06 | tablecn | Sadman Sakib (sadmann7), tablecn.com\[18\] | Data table registry | Short-listed | Passes G1(b)–G5 |
| LIB-07 | Origin UI (legacy) | Cal.com / coss.com; legacy snapshot\[19\]\[20\] | Copy-paste | Screened out | G1 not verified; limited support\[19\] |
| LIB-08 | coss ui | Cal.com (coss.com/ui)\[19\]\[21\] | Base UI components\[22\] | Screened out | G1 not verified |
| LIB-09 | Magic UI | magicuidesign\[23\] | Animated registry | Screened out | G1 not verified (only third-party magicui.net claims React 19)\[24\]\[25\] |
| LIB-10 | Aceternity UI | Aceternity Solutions Private Limited\[26\] | Animated registry | Screened out | G1 not verified |
| LIB-11 | Kibo UI | Shadcnblocks (acquired Oct 2025 from Hayden Bleasel)\[27\]\[28\] | Registry | Screened out | G1 not verified |
| LIB-12 | ReUI | KeenThemes Inc.\[29\] | Registry + paid Pro | Short-listed | Passes G1(b)–G5 |
| LIB-13 | Animate UI | Elliot Sutton (imskyleen) | Animated registry | Screened out | G1 not verified; MIT + Commons Clause\[30\]\[31\] |
| LIB-14 | Motion Primitives | — | Motion | Screened out | G1 not verified |
| LIB-15 | Cult UI | — | Animated registry | Screened out | G1 not verified |
| LIB-16 | Eldora UI | — | Animated | Screened out | G1 not verified |
| LIB-17 | Smooth UI | — | Animated | Screened out | G1 not verified |
| LIB-18 | React Bits | David Haz (DavidHDev) | Animated | Screened out | G1 not verified; MIT + Commons Clause v1.0\[32\] |
| LIB-19 | Kokonut UI | listed on registry.directory\[33\] | Registry | Screened out | G1 not verified |
| LIB-20 | Shadcnblocks | Shadcnblocks (Rob Austin)\[28\] | Paid blocks registry | Screened out | G1 not verified; Bearer-key registry\[34\] |
| LIB-21 | Launch UI | — | Marketing blocks | Screened out | G1 not verified |
| LIB-22 | tweakcn | — | Theme editor | Screened out | G0: theme tool |
| LIB-23 | Plate | "@plate" on shadcnregistry.com (secondary)\[35\] | Rich text | Screened out | G1 not verified |
| LIB-24 | Novel | — | Rich text | Screened out | G1 not verified |
| LIB-25 | AI Elements | Vercel (vercel/ai-elements)\[36\] | AI chat registry\[36\] | Screened out | G3: licence not found. G2 passes if the year is 2026: the releases page lists ai-elements@1.9.0 as "Latest", released "12 Mar" with no year shown; 2026 is inferred from the 1.8.x releases on 2–5 Feb. G1 passes (a) |
| LIB-26 | assistant-ui | assistant-ui org; MIT, Base UI default (subagent, snippet)\[37\]\[38\] | AI chat\[33\] | Screened out | G1 not verified |
| LIB-27 | prompt-kit | — | AI chat | Screened out | G1 not verified |
| LIB-28 | Tremor | Vercel (acquired 2025-01-22)\[39\] | Charts / dashboards | Screened out | G2: latest commit not found |
| LIB-29 | JollyUI | — | React Aria + shadcn | Screened out | G1 not verified |
| LIB-30 | Intent UI | — | React Aria | Screened out | G1 not verified |
| LIB-31 | Park UI | — | Ark UI | Screened out | G1 not verified |
| LIB-32 | Supabase UI Library | — | Registry | Screened out | G1 not verified |
| LIB-33 | Radix Primitives | WorkOS | Headless base | Short-listed | Passes G1(c)–G5 |
| LIB-34 | Base UI | MUI | Headless base\[40\] | Short-listed | Passes G1(c)–G5 (G3: MIT per LICENSE) |
| LIB-35 | React Aria Components | Adobe | Headless base\[5\] | Screened out | G3: licence not read |
| LIB-36 | Ark UI | — | Headless base | Screened out | G1 not verified |
| LIB-37 | Headless UI | — | Headless base | Screened out | G1 not verified |
| LIB-38 | Ariakit | — | Headless base | Screened out | G1 not verified |
| LIB-39 | cmdk | core Command | Dependency | Not screened | Inherits LIB-01 |
| LIB-40 | vaul | core Drawer (Radix track) | Dependency | Not screened | Base UI Drawer stable since v1.3.0 (2026-03-12)\[6\] |
| LIB-41 | sonner | historically core | Dependency | Not screened | Absent from core sidebar 2026-10-03; core lists Toast\[3\]\[41\] |
| LIB-42 | input-otp | core Input OTP | Dependency | Not screened | Base UI OTPField preview since v1.4.0\[6\] |
| LIB-43 | react-day-picker | core Calendar | Dependency | Not screened | Inherits LIB-01 |
| LIB-44 | embla-carousel | core Carousel | Dependency | Not screened | Inherits LIB-01 |
| LIB-45 | react-resizable-panels | core Resizable | Dependency | Not screened | Inherits LIB-01 |
| LIB-46 | recharts | core Chart (`add chart` installs recharts; freeCodeCamp)\[42\] | Dependency | Not screened | Inherits LIB-01 |
| LIB-47 | MUI | MUI | Styled system | Comparison only | One vendor rule |
| LIB-48 | Mantine | — | Styled system | Comparison only | One vendor rule |
| LIB-49 | Chakra UI | — | Styled system | Comparison only | One vendor rule |
| LIB-50 | HeroUI | Apache 2.0 core, v3 on Tailwind v4 (secondary: LogRocket)\[43\] | Styled system | Comparison only | One vendor rule |
| LIB-51 | Ant Design | Pro on React 19 + Tailwind v4 (secondary: AdminLTE)\[44\] | Styled system | Comparison only | One vendor rule |
| LIB-52 | Radix Themes | WorkOS; updated 2026-04-11\[45\] | Styled system | Comparison only | One vendor rule |
| LIB-53 | daisyUI | v5 as Tailwind v4 plugin, MIT (secondary: LogRocket)\[43\] | Styled system | Comparison only | One vendor rule |
| LIB-54 | Flowbite | — | Styled system | Comparison only | One vendor rule |
| LIB-55 | Tailwind Plus / Catalyst | Tailwind Labs; commercial (secondary: LogRocket)\[43\] | Styled system | Comparison only | One vendor rule |
| LIB-56 | Untitled UI React | Untitled UI | Styled system | Comparison only | One vendor rule |
| LIB-57 | Fluent UI | — | Styled system | Comparison only | One vendor rule |
| LIB-58 | Carbon | — | Styled system | Comparison only | One vendor rule |
| LIB-59 | Primer | — | Styled system | Comparison only | One vendor rule |
| LIB-60 | Polaris | — | Styled system | Comparison only | One vendor rule |
| LIB-61 | React Spectrum | Adobe | Styled system | Comparison only | One vendor rule |
| LIB-62 | Shadcn Studio | Clevision Technologies; states not affiliated\[46\] | Free + Pro registry | Screened out | G1 not verified |
| LIB-63 | Shadcn UI Blocks | shadcn-ui-blocks.com; API-key registry\[47\] | Paid blocks | Screened out | G1 not verified |
| LIB-64 | RetroUI | retroui.dev\[48\] | Neo-brutalist registry | Screened out | G1 not verified |
| LIB-65 | ElevenLabs UI | listed on registry.directory | Audio / agent UI | Screened out | G1 not verified |
| LIB-66 | HextaUI | listed on registry.directory | Registry | Screened out | G1 not verified |
| LIB-67 | Pure UI (@PureUI) | kam-ui; directory issue #8899\[49\] | Base UI animated | Screened out | G1 not verified |
| LIB-68 | lucide-animated | pqoqubbw; directory issue #8931 | Animated icons\[50\] | Screened out | G1 not verified |
| LIB-69 | basecn | — | Base UI components | Screened out | G1 not verified |
| LIB-70 | Watermelon UI | ui.watermelon.sh\[20\] | Registry | Screened out | G1 not verified |
| LIB-71 | TanStack Table | composed by tablecn\[12\] | Dependency | Not screened | Inherits LIB-06 |
| LIB-72 | Motion | composed by animated registries | Dependency | Not screened | No animated source passed G1 |
| LIB-73 | registry.directory | codedthemes\[51\] | Index | Screened out | G0: index (86 registries in its metadata)\[33\] |
| LIB-74 | shoogle.dev directory | third party | Index | Screened out | G0: index; reports 418 registries (subagent)\[52\] |
| LIB-75 | shadcnregistry.com | third party | Index | Screened out | G0: index |

## 4. Ledger

### 4.0 The base decision: Radix versus Base UI

Facts (verified 2026-10-03 unless labelled):
- **shadcn default.** Changelog "July 2026 - Base UI as the Default": new projects, shadcn/create and the docs default to Base UI. Radix is not deprecated. Every update and new component ships for both, "unless a component only exists in Base UI".\[4\]
  - Registries should ship a `registry:base` to pin a library; items without one initialise as Base UI.\[4\]
  - Opt back into Radix with `shadcn init -b radix`.\[4\]
- **Base UI releases.** v1.0.0 shipped on 2025-12-11 after two years of development, with 35 accessible components, and renamed the package from `@base-ui-components/react` to `@base-ui/react` (secondary: InfoQ, 2026-02). v1.8.0 shipped on 2026-09-04 (releases page). Drawer stable since v1.3.0 (2026-03-12); OTPField preview since v1.4.0 (2026-04-13). v1.8.0 notes list a Combobox `createItems` API, popup mount/unmount performance work, and "many accessibility, performance, and bug fixes".\[6\]
- **Radix Primitives.** MIT, "maintained by @workos". Repo updated 2026-08-08; 206 open issues and 158 open PRs (org page, read 2026-10-03). Commits on 2026-07-02 and 2026-07-13 fix popper typing, form control, ContextMenu anchoring and RovingFocusGroup, mostly by one author.\[7\]
  - Secondary (shadcndeck, 2026-09): unified `radix-ui` at v1.6.1; 2026 update velocity "slower".\[53\]

What each base implies:
- **Registry compatibility.** Radix-only items need a Base build on a Base project. Vendors now serve both via the `{style}` placeholder: Shadcnblocks (changelog, 2026-09-10), ReUI `base-vega` (issue #129), Dice UI `radix-vega` (PR #290).\[8\]\[14\]\[54\]
- **Accessibility.** Both are WAI-ARIA headless primitives. Base UI ships accessibility fixes every month;\[6\] Radix's recent commits fix keyboard activation and roving focus.\[7\] Judgment: parity today, Base UI improving faster.
- **Maintenance and bus factor.** InfoQ (2026-02) reports Base UI is supported by MUI with engineers, designers and managers dedicated to the project, and the team's Show HN v1.0 post describes a full-time team of 7. Radix's recent commits come largely from one maintainer (judgment). Mixing both breaks one vendor per category.

Recommendation: adopt Base UI as the single primitive base. Pin `@base-ui/react` exactly and set `components.json` `style` to a `base-*` style. Add no new Radix primitives. Migrate existing Radix components when touched, using `--diff` against the base build. [NEEDS DECISION]

### LIB-01 — shadcn/ui core
- ui.shadcn.com · github.com/shadcn-ui/ui · shadcn (Vercel) · MIT (LICENSE.md, verified 2026-10-03)\[2\] · CLI copy-in, @shadcn registry · base: Base UI (default since 2026-07), Radix, React Aria (July 2026 changelog)\[1\]\[4\] · Tailwind v4, CSS variables (`--background`, `--foreground`, `--primary`, `--muted`, `--radius`, `--chart-1`…`--chart-5`)\[42\]
- Compatibility:
  - React 19: verified (changelog "React 19, October 2024").\[1\]
  - Next 16 App Router: secondary; CLI v4 `init --template` scaffolds Next.js (2026-03-06); "Next 16" not named on pages read.\[55\]
  - Tailwind 4: verified (changelog "Tailwind v4, February 2025").\[1\]
  - TS 5.9: not found.
- Last release: npm `shadcn` 4.21.0, latest tag, "published a month ago" (npm page, read 2026-10-03).\[56\] Cadence: monthly changelog posts through September 2026. Maintainers: 2 on npm (secondary: Socket).\[1\]\[57\]
- Accessibility: inherits the base. State coverage: Empty, Skeleton, Spinner, Progress and Toast exist; per-component states are not shown in docs (judgment). Client boundary: overlays are client components; Typography, Card, Badge, Table, Kbd and Separator can stay server-rendered (judgment).
- Supply chain:
  - `add` writes files to the `components.json` aliases, installs the item's npm dependencies, and may append CSS variables and rules.
  - `init` adds `@import "shadcn/tailwind.css"`\[58\] (May 2026), which `shadcn eject` inlines.\[58\]
  - Since September 2026, every core component imports `cn` from the `cn` package.\[1\]
  - All fetches go to ui.shadcn.com.
- Agent fluency: llms.txt, MCP server, skills, `info`/`docs` commands, registry JSON schema.\[3\]\[55\]\[59\] Tell risk: A-01 (presets, `registry:font`), A-14 (`shimmer` utility), A-18 (Spinner for page loads), A-10 (nested Card). Token-lint fit: mechanical rename onto tokens.md.
- Scores:
  - compatibility: 3 — React 19 and Tailwind v4 named by the vendor.
  - distribution: 3 — namespaced registry with schema, dry-run, diff.
  - primitive/a11y: 3 — choice of three maintained bases.
  - token fit: 2 — mechanical, but presets inject fonts and colours.
  - state coverage: 2 — state components exist; per-state docs uneven.
  - maintenance: 3 — monthly releases.
  - ownership/licence: 3 — MIT, Vercel-employed author.
  - supply chain: 2 — `cn` and `shadcn/tailwind.css` add dependencies; fetches leave the allowlist.
  - agent fluency: 3 — llms.txt, MCP, skills.
  - client-boundary cost: 2 — overlays are client by necessity.
  - tell risk: 2 — A-01, A-14, A-18, avoidable by policy.
- Proposed verdict [PROPOSED]: Adopt (baseline), with A1–A6 plus the §8 rulings on `cn` and `shadcn/tailwind.css`.
- Exit cost: low per component; medium for the base switch. Re-score when: CLI 5.x ships or the default base changes.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| Data Table | J-01 | core | Base UI / Radix | not read | yes | not read | table semantics | ui.shadcn.com/docs/components/base/data-table | 2026-10-03 |
| Combobox | J-22 | core | Base UI / Radix | not read | yes | not read | listbox pattern | ui.shadcn.com/docs/components/base/combobox | 2026-10-03 |
| Date Picker | J-12 | core | Base UI / Radix | react-day-picker | yes | not read | grid navigation | ui.shadcn.com/docs/components/base/date-picker | 2026-10-03 |
| Alert Dialog | J-31 | core | Base UI / Radix | none read | yes | not read | focus trap, alertdialog role | ui.shadcn.com/docs/components/base/alert-dialog | 2026-10-03 |
| Empty | J-36 | core | none | none read | no (judgment) | empty | native semantics | ui.shadcn.com/docs/components/base/empty | 2026-10-03 |
| Message / Message Scroller / Bubble / Attachment | J-40 | core (June 2026)\[60\] | Base UI / Radix | @shadcn/react, @shadcn/helpers | yes | not read | live region not verified | ui.shadcn.com/docs/components/base/message | 2026-10-03 |
| Chart | J-34 | core | none | recharts | yes | not read | not read | ui.shadcn.com/docs/components/base/chart | 2026-10-03 |

### LIB-34 — Base UI
- base-ui.com · github.com/mui/base-ui · MUI · licence MIT per github.com/mui/base-ui/blob/master/LICENSE ("Copyright (c) 2019 Material-UI SAS"); re-read the file at the pinned commit before adoption · npm `@base-ui/react` · unstyled, data attributes; expects no token names
- Compatibility:
  - React 19: secondary (Untitled UI, 2026-09: React 17, 18, 19).\[5\]
  - Next 16 App Router: secondary via the shadcn default.
  - Tailwind 4: N/A (unstyled).
  - TS 5.9: not found.
- Last release: v1.8.0, 2026-09-04 (verified). Cadence: monthly (v1.1.0 2026-01-15, v1.2.0 2026-02-12, v1.3.0 2026-03-12, v1.4.0 2026-04-13, v1.4.1 2026-04-20).\[6\] Maintainers: MUI team (secondary: InfoQ).\[40\]
- Accessibility: ARIA/WCAG-based (secondary); recent fixes cover label association and roving focus.\[61\]\[62\] State coverage: N/A. Client boundary: interactive parts are client.
- Supply chain: one npm package; no registry fetch.
- Agent fluency: release notes "View as Markdown".\[6\] Tell risk: none by default. Token-lint fit: N/A.
- Scores:
  - compatibility: 2 — React 19 support is secondary.
  - distribution: 2 — npm, stable since v1.0.
  - primitive/a11y: 3 — active accessibility fixes.
  - token fit: 3 — unstyled.
  - state coverage: 2 — data-state hooks; stories are house work.
  - maintenance: 3 — monthly releases.
  - ownership/licence: 3 — company-backed; MIT per LICENSE.
  - supply chain: 3 — single package.
  - agent fluency: 2 — Markdown docs.
  - client-boundary cost: 2 — interactive parts only.
  - tell risk: 3 — no visual defaults.
- Proposed verdict [PROPOSED]: Adopt as primitive base, after edits: read the LICENSE at the pinned commit; pin an exact version in tech-stack.md by decision record.
- Exit cost: high. Re-score when: v2.0 ships or the licence reads other than permissive.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| Combobox (createItems) | J-22 | core internals, Base track | Base UI | none | yes | data-list-empty | NVDA fix v1.1.0\[6\]\[63\] | base-ui.com/react/overview/releases | 2026-10-03 |
| Drawer | J-30 | replaces vaul, Base track | Base UI | none | yes | not read | SwipeArea part\[6\] | base-ui.com/react/overview/releases | 2026-10-03 |
| OTPField (preview) | J-15 | replaces input-otp, Base track | Base UI | none | yes | not read | Ctrl/Cmd shortcuts\[6\] | base-ui.com/react/overview/releases | 2026-10-03 |
| NumberField | J-14 | no core equivalent | Base UI | none | yes | not read | Persian digits\[6\] | base-ui.com/react/overview/releases | 2026-10-03 |
| Autocomplete | J-21 | no core equivalent | Base UI | none | yes | data-list-empty | loopFocus prop\[63\] | base-ui.com/react/overview/releases | 2026-10-03 |

### LIB-33 — Radix Primitives
- radix-ui.com · github.com/radix-ui/primitives · WorkOS · MIT (org page, verified 2026-10-03)\[45\] · npm (`radix-ui` unified package since February 2026, shadcn changelog)\[1\] · unstyled, `data-state`
- Compatibility: React 19 verified via shadcn core, G1(c); Next 16 secondary via shadcn; Tailwind N/A; TS 5.9 not found.
- Last activity: commits 2026-07-13; repo updated 2026-08-08 (verified).\[7\]\[64\] Cadence irregular; mostly one author (judgment). 206 issues, 158 PRs (org page, read 2026-10-03).
- Accessibility: mature. Supply chain: npm only. Agent fluency: docs site, no llms.txt seen. Tell risk: none. Token-lint fit: N/A.
- Scores:
  - compatibility: 3 — runs shadcn core today.
  - distribution: 2 — npm.
  - primitive/a11y: 3 — mature.
  - token fit: 3 — unstyled.
  - state coverage: 2 — headless.
  - maintenance: 1 — slower, PR backlog.\[53\]
  - ownership/licence: 2 — MIT. Per dev.to ("Is Your Shadcn UI Project at Risk?"), many of the original maintainers have left, and WorkOS is now investing in maintenance, with Chance among those working through open issues.
  - supply chain: 3 — npm only.
  - agent fluency: 1 — no machine docs seen.
  - client-boundary cost: 2 — interactive parts only.
  - tell risk: 3 — no visual defaults.
- Proposed verdict [PROPOSED]: Defer. Keep for existing Radix components until touched. Re-open if Radix clears its PR backlog in a release or shadcn drops Radix parity.
- Exit cost: medium (asChild to render rewrites). Re-score when: shadcn changes Radix parity.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| ContextMenu | J-27 | core, Radix track | Radix | none | yes | N/A | anchoring fix 2026-07-02\[7\] | github.com/radix-ui/primitives/commits | 2026-10-03 |
| RovingFocusGroup | J-23 | core internals, Radix track | Radix | none | yes | N/A | auto-focus fix 2026-07-02\[7\] | github.com/radix-ui/primitives/commits | 2026-10-03 |

### LIB-05 — Dice UI
- diceui.com · github.com/sadmann7/diceui · Sadman Sakib (individual)\[9\] · MIT (LICENSE, verified 2026-10-03)\[9\] · shadcn registry (`@diceui`, PR #290) and copy-paste · shadcn styles (`radix-vega` observed; Base build not verified)\[8\] · Tailwind, shadcn variables (judgment)
- Compatibility: React 19 and Tailwind 4 secondary under G1(b) (PR #290, 2026-10); Next 16 not found; TS 5.9 not found.
- Last activity: PRs #308 and #309 merged 2026-10-02 (verified).\[10\]\[65\] One primary maintainer (bus factor 1, judgment).
- Accessibility: self-described "accessible", not audited.\[9\]\[66\] State coverage and client boundary: not read.
- Supply chain: fetches diceui.com. Data-table and data-grid items, style-prefixed paths and `use-data-grid-*` hooks 301-redirect to tablecn.com (PRs #290, #308, #309).\[8\]\[10\]\[65\] One `@diceui/...` add can therefore pull from a second domain (verified 2026-10-03).
- Agent fluency: registry JSON. Tell risk: not assessed. Token-lint fit: mechanical rename expected (judgment).
- Scores:
  - compatibility: 2 — v4 style builds, no explicit statement.
  - distribution: 3 — namespaced registry.
  - primitive/a11y: 2 — shadcn primitives.
  - token fit: 2 — shadcn variables.
  - state coverage: 1 — not shown.
  - maintenance: 2 — active, single maintainer.
  - ownership/licence: 2 — MIT, individual.
  - supply chain: 1 — cross-domain redirects.
  - agent fluency: 2 — registry JSON.
  - client-boundary cost: 1 — undocumented.
  - tell risk: 2 — low expected for utilities (judgment).
- Proposed verdict [PROPOSED]: Adopt after edits.
  - Install by GitHub address pinned to a full SHA, never via `@diceui`.
  - Exclude every data-table and data-grid item (take those from LIB-06).
  - Rename tokens to house names.
  - Write a story per state before merge.
- Exit cost: low. Re-score when: maintainer count or registry domain changes.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| data-table, data-grid (redirected) | J-01 | adds; served by tablecn | shadcn | see LIB-06 | yes | see LIB-06 | see LIB-06 | diceui.com/r/ to tablecn.com/r/ | 2026-10-03 |
| use-mobile, use-as-ref, use-lazy-ref | — | adds hooks\[8\] | none | not read | yes | N/A | N/A | github.com/sadmann7/diceui/pull/290 | 2026-10-03 |

### LIB-06 — tablecn
- tablecn.com · github.com/sadmann7/tablecn · Sadman Sakib · MIT (LICENSE.md, verified 2026-10-03)\[11\] · shadcn registry (`/r/`) and reference app\[67\] · shadcn/ui base · Tailwind, shadcn variables
- Compatibility: React 19 and Tailwind 4 secondary under G1(b) (Dice UI PR #309); README names Next.js, version not read;\[12\] TS 5.9 not found.
- Last activity: "updated Jun 2026" (secondary: finds.dev);\[67\] registry live 2026-10-02 (redirect target in Dice UI PRs). One primary maintainer. Issue #1142 (hook 404, fixed by redirect).\[8\]
- Features (README, verified): server-side pagination, sorting and filtering; column-derived filters; Notion-style advanced and Linear-style filter menus; row-selection action bar; virtualised infinite scroll; real-time collaboration.\[12\]
- Stack (README): TanStack Table, TanStack DB, Drizzle, Zod, PartyKit.\[12\] Only UI items are in scope.
- Accessibility: not audited. State coverage: not read. Client boundary: TanStack Table grids are client (judgment).
- Supply chain: fetches tablecn.com; items depend on TanStack Table. Demo dependencies (Drizzle, Postgres, PartyKit) must not arrive with items; check with `--dry-run`.
- Agent fluency: registry JSON. Tell risk: A-14 if rows animate (not verified); real-time collaboration invites flash highlights (judgment). Token-lint fit: mechanical rename (judgment).
- Scores:
  - compatibility: 2 — inferred from style builds.
  - distribution: 3 — registry.
  - primitive/a11y: 2 — shadcn table semantics.
  - token fit: 2 — shadcn variables.
  - state coverage: 1 — not shown.
  - maintenance: 2 — active, single maintainer.
  - ownership/licence: 2 — MIT, individual.
  - supply chain: 2 — one domain; demo dependencies to exclude.
  - agent fluency: 2 — registry JSON.
  - client-boundary cost: 1 — large client grid.
  - tell risk: 2 — A-14 manageable by edits.
- Proposed verdict [PROPOSED]: Adopt after edits, for J-01 to J-05 only.
  - Pin by GitHub SHA.
  - Strip row animation and flash highlights; keep numbers tabular and right-aligned.
  - Remove real-time collaboration items.
  - Write a story per state (empty, skeleton without shimmer, error, partial).
- Exit cost: medium (columns couple to TanStack Table). Re-score when: TanStack Table major version or maintainer change.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| data-table | J-01 | replaces core Data Table recipe | shadcn | TanStack Table | yes | not read | not audited | tablecn.com/r/ | 2026-10-03 |
| data-table-filter-list | J-03 | adds | shadcn | TanStack Table | yes | not read | not audited | tablecn.com/r/ | 2026-10-03 |
| data-grid | J-04 | no core equivalent | shadcn | TanStack Table | yes | not read | not audited | tablecn.com/r/ | 2026-10-03 |
| use-data-grid-undo-redo | J-04 | no core equivalent | none | not read | yes | N/A | N/A | tablecn.com/r/use-data-grid-undo-redo.json\[8\] | 2026-10-03 |

### LIB-12 — ReUI
- reui.io · github.com/keenthemes/reui · KeenThemes Inc. · MIT for the open repo (README, via subagent 2026-10-03); proprietary Pro/Ultimate one-time licences at reui.io/legal/license\[13\]\[29\] · `@reui` registry with `{style}` paths (`base-vega`); some items need a Bearer licence key (issue #129)\[14\] · shadcn primitives (Base build observed) · Tailwind, shadcn variables
- Compatibility: React 19 and Tailwind 4 secondary under G1(b); Next 16 not found; TS 5.9 not found.
- Last activity: org page "Updated Sep 16, 2026" (secondary snippet).\[68\] Company-maintained. Issues #129 and #144 open on registry behaviour.\[14\]\[69\]
- Supply chain: fetches reui.io. Pro items need an `Authorization` header from an environment variable.\[14\] Vendor claims 1,105 free components in 74 categories (not verified):\[13\] a broad surface for accidental adds.
- Agent fluency: registry JSON. Tell risk: Pro motion icons (A-13, judgment). Token-lint fit: blocks need rework (judgment).
- Scores:
  - compatibility: 2 — Base builds served.
  - distribution: 2 — registry, free and paid mixed.
  - primitive/a11y: 2 — shadcn primitives.
  - token fit: 1 — blocks need rework.
  - state coverage: 1 — not shown.
  - maintenance: 2 — company-run.
  - ownership/licence: 1 — MIT and proprietary in one namespace.
  - supply chain: 1 — authenticated items, large surface.
  - agent fluency: 2 — registry JSON.
  - client-boundary cost: 1 — undocumented.
  - tell risk: 1 — motion icons, marketing blocks.
- Proposed verdict [PROPOSED]: Mine, not install. Read the MIT data-grid and date-selector as references; rebuild on core plus tablecn. Never configure `@reui`.
- Exit cost: none if mined. Re-score when: free and paid namespaces are separated.

| Component | Job ID | vs shadcn core | Base | New deps | Client? | States shown | A11y note | Link | Verified |
|---|---|---|---|---|---|---|---|---|---|
| data-grid | J-04 | competes with tablecn | shadcn | not read | yes | not read | not audited | reui.io/r/base-vega/ | 2026-10-03 |
| data-grid-i18n | J-04 | adds | shadcn | not read | yes | not read | licence key required\[14\] | reui.io/r/base-vega/data-grid-i18n.json | 2026-10-03 |
| date-selector | J-12 | competes with core Date Picker | shadcn | not read | yes | not read | not audited | issue #144\[69\] | 2026-10-03 |

## 5. Job index

| Job ID | Task type | Job | shadcn core answer | Ecosystem alternatives (ranked, reason) | Headless fallback | If nothing fits |
|---|---|---|---|---|---|---|
| J-01 | Table | Show a sortable, paginated records table | Data Table, Table, Pagination | 1. LIB-06 data-table (server-side) | — | — |
| J-02 | Table | Act on several selected rows at once | Data Table + Checkbox | 1. LIB-06 action bar on selection | Checkbox | — |
| J-03 | Search / filter | Filter a long list by several facets | Combobox, Command, Popover | 1. LIB-06 filter-list (column-derived) | Combobox | — |
| J-04 | Data entry (repeated) | Edit many cells inline in a grid | none | 1. LIB-06 data-grid + undo/redo; 2. LIB-12 data-grid (mine only) | — | none: domain component for spreadsheet semantics |
| J-05 | Table | Scroll a very long list without lag | Scroll Area | 1. LIB-06 virtualised infinite scroll | — | — |
| J-06 | Document diff / compare | Compare two versions side by side | Resizable | none | — | none: domain component |
| J-07 | Audit trail / log | Read a chronological event log | Table, Item | none | — | none: domain component |
| J-08 | Form | Lay out a labelled field with help and error text | Field, Label, Input | none | — | — |
| J-09 | Form | Validate and submit with one schema | Field + form integration docs | none | — | — (vendor choice, §8) |
| J-10 | Form | Choose one option from a short set | Radio Group, Select, Native Select | none | Select | — |
| J-11 | Form | Toggle a setting on or off | Switch, Checkbox | none | Checkbox | — |
| J-12 | Form | Pick a date or a date range | Date Picker, Calendar | 1. LIB-12 date-selector (mine only) | — | — |
| J-13 | Form | Enter text with a prefix, suffix or inline action | Input Group | none | InputGroup parts | — |
| J-14 | Form | Enter a bounded number | Input | none | NumberField | — |
| J-15 | Onboarding | Enter a one-time code | Input OTP | none | OTPField (preview) | — |
| J-16 | Onboarding | Step through a guided questionnaire | Questionnaire | none | — | — |
| J-17 | Onboarding | Take a product tour | none | none | Popover | none: domain component |
| J-18 | Navigation | Move between app sections | Sidebar, Navigation Menu, Breadcrumb | none | NavigationMenu | — |
| J-19 | Navigation | Switch views within a page | Tabs, Toggle Group | none | — | — |
| J-20 | Navigation | Jump anywhere by keyboard | Command, Kbd | none | — | — |
| J-21 | Search / filter | Search with suggestions as you type | Combobox, Command | none | Autocomplete | — |
| J-22 | Search / filter | Pick one or many from a long list | Combobox | none | Combobox (createItems) | — |
| J-23 | Navigation | Act from a toolbar | Button Group, Toggle Group | none | — | — |
| J-24 | Dashboard | Show a headline figure with context | Card | none | — | — (avoid A-09) |
| J-25 | Dashboard | Show a trend over time | Chart | none | — | — |
| J-26 | Settings | Show more detail on hover or focus | Hover Card, Tooltip | none | PreviewCard, Tooltip | — |
| J-27 | Settings | Act on an item from a context menu | Context Menu, Dropdown Menu | none | ContextMenu | — |
| J-28 | Settings | Group settings into collapsible sections | Accordion, Collapsible | none | Accordion | — |
| J-29 | Settings | Adjust a value along a range | Slider | none | Slider | — |
| J-30 | Navigation | Open a secondary panel on mobile | Drawer, Sheet | none | Drawer | — |
| J-31 | Destructive action | Confirm a destructive action | Alert Dialog | none | — | — |
| J-32 | Long-running process / loading | Show progress of a known-length task | Progress | none | — | — |
| J-33 | Long-running process / loading | Hold layout while content loads | Skeleton (no shimmer, A-14) | none | — | — |
| J-34 | Report / export | Visualise a report figure | Chart | none | — | — |
| J-35 | Error state | Explain a failure and offer recovery | Alert, Empty | none | — | — |
| J-36 | Empty state | Explain an empty view and the next step | Empty | none | — | — |
| J-37 | Long-running process / loading | Confirm a background result without blocking | Toast | none | — | — |
| J-38 | Map or canvas interaction | Pan and select on a map | none | none | — | none: domain component |
| J-39 | Map or canvas interaction | Connect nodes on a canvas | none | none | — | none: domain component |
| J-40 | Long-running process / loading | Stream a conversational response | Message, Message Scroller, Bubble, Attachment | none (LIB-25, LIB-26 screened out) | — | — |
| J-41 | Data entry (repeated) | Attach files to a record | Attachment | none | — | none: domain component for upload pipelines |
| J-42 | Data entry (repeated) | Edit rich text | none | none (LIB-23, LIB-24 screened out) | — | none: domain component |

## 6. Starter kits by profile

| Profile | Core components | Ecosystem additions (LIB) | Avoid, and why |
|---|---|---|---|
| Data-dense product app | Data Table, Table, Pagination, Combobox, Command, Field, Select, Date Picker, Alert Dialog, Skeleton, Empty, Sidebar, Kbd | LIB-06 data-table, filter-list, data-grid; LIB-34 NumberField | Chart animation and shimmer (A-14); LIB-12 data-grid (second grid vendor) |
| Consumer mobile-first app | Drawer, Sheet, Tabs, Input OTP, Toast, Empty, Skeleton, Avatar | LIB-34 Drawer, OTPField | Animated registries (A-13); glass overlays (A-12) |
| Internal admin tool | Sidebar, Data Table, Field, Native Select, Switch, Alert Dialog, Breadcrumb, Empty | LIB-06 data-table; LIB-05 hooks after edits | Marketing blocks from LIB-20, LIB-62 (A-03, A-07) |
| AI product surface | Message, Message Scroller, Bubble, Attachment, Questionnaire, Spinner (inline only) | none admitted; LIB-25, LIB-26 are re-screen candidates | "Thinking" theatre (A-20); page-load spinners (A-18); `shimmer` on text (A-14) |
| Docs site | Typography, Navigation Menu, Command, Breadcrumb, Tabs, Collapsible | none (apps/docs pins react-markdown, remark-gfm, @tailwindcss/typography) | shadcn/typeset (second typography vendor) |
| Marketing register in code | Button, Card, Navigation Menu, Accordion | none (no animated source passed G1) | LIB-09, LIB-10, LIB-13, LIB-18 defaults (A-02, A-03, A-12, A-13, A-14); may be routed to Framer by a separate ruling, not resolved here [NEEDS DECISION] |

## 7. Registry posture

Verified 2026-10-03 against ui.shadcn.com docs; CLI version npm `shadcn` 4.21.0 (latest tag that day).

**7.1 Namespaces and configuration.**
- `components.json` `registries` maps a namespace to a URL template (`"@acme": "https://…/{name}.json"`) or to an object with `url` and `headers`. Headers interpolate environment variables (`"Authorization": "Bearer ${REGISTRY_TOKEN}"`).\[70\]\[71\]
- Addresses: `@namespace/item`; `owner/repo/item` (GitHub registries since June 2026, private repos since August 2026); full URL; local path.\[1\]\[3\]\[72\]
- The open-source index (`ui.shadcn.com/r/registries.json`, built from `apps/v4/registry/directory.json`) is consulted automatically on `add` and `search`, and a namespace found there is written into `components.json`.\[41\]
- Index entries publish on PR merge; "Registry Health" monitoring "does not delay or gate publication".\[41\]

**7.2 What an item may write** (`registry-item.json` fields):
- **Files with `target`.** Required for `registry:page` and `registry:file`. `~` means project root; the docs' own example writes `~/.env`. Placeholders `@ui/`, `@components/`, `@lib/`, `@hooks/` resolve to aliases; unknown placeholders become plain paths.\[72\] GitHub registries are documented as distributing AGENTS.md, editor settings and CI workflows.\[3\] Items can therefore write outside the components folder.\[3\]
- **`dependencies` / `devDependencies`.** Arbitrary npm packages, optionally versioned.\[72\]
- **`registryDependencies`.** Core names, namespaces, GitHub refs, URLs, local files. Refs are not inherited, so a pinned item can pull unpinned dependencies.\[72\]
- **`cssVars`** (theme, light, dark) and **`css`** (`@plugin`, `@layer base`, `@utility`, `@keyframes`).\[72\]
- **`envVars`.** Appended to `.env.local` or `.env`; existing keys not overwritten.\[72\]
- **`font`** (`registry:font`, Google provider), **`docs`** (install message), **`registry:base`** (pins a primitive library). `tailwind` is deprecated in favour of `cssVars.theme`.\[72\]

**7.3 Risks (judgment).**
- Dotfile, CI and agent-instruction writes via `~/` targets: the same risk class as skill hooks.
- Token and global-CSS injection (`css`, `cssVars`, `font`) bypassing the token lint (A-01, A-11).
- Unpinned transitive pulls across domains (Dice UI to tablecn).
- Silent `components.json` edits via the index; credential exposure via header interpolation.
- Mutable bytes behind a namespace URL, unlike a commit SHA.

**7.4 Deltas to the existing review procedure** (procedure not restated):
1. Archive the resolved `yarn shadcn add <item> --dry-run` (and `--view`) payload with the SHA or URL and read date in the provenance header.
2. Reject items declaring `envVars`, `font`, `registry:file`/`registry:page` types, any `~/` target, any target outside `packages/ui/**`, `css` with `@plugin` or `@layer base`, or `cssVars` not mapped in tokens.md.
3. Resolve the full `registryDependencies` tree; every node pinned to a SHA or the review fails.
4. Diff `components.json` after every `add`, `search` or `view`; revert unsanctioned index-inserted namespaces.
5. Every new npm dependency goes through one-vendor-per-category and a tech-stack decision record before merge.
6. Prefer SHA-pinned GitHub addresses; never configure a namespace with `headers`.
7. Re-review on any SHA change, not only on version bumps.

**7.5 Network.**
- The allowlist includes github.com, codeload.github.com, raw.githubusercontent.com and api.github.com. SHA-pinned GitHub addresses are the only in-allowlist path, if the CLI resolves them through those hosts (not verified).
- Every namespaced fetch leaves the allowlist: `@shadcn` (ui.shadcn.com), `@diceui` (diceui.com), tablecn.com, reui.io.
- Options: (a) add ui.shadcn.com alone and use SHA-pinned GitHub addresses for sanctioned third parties; (b) vendor registry JSON into the repo and install from local paths. Quartermaster recommends (a). [NEEDS DECISION — BLOCKING]

## 8. Conflicts with house law

| Library | Collision | Type | Cheapest resolution |
|---|---|---|---|
| LIB-01 | Core imports `cn` from the `cn` package (September 2026);\[1\] house pins clsx + tailwind-merge | One vendor / pin | Rewrite to the `@pem/ui` `cn` on copy-in, or adopt `cn` by decision record [NEEDS DECISION] |
| LIB-01 | `init` adds `@import "shadcn/tailwind.css"` | Pin | Run `shadcn eject` once into packages/ui CSS, or pin shadcn as a dependency\[58\] [NEEDS DECISION] |
| LIB-01 | Presets and `registry:font` bring fonts (A-01) | Canon | A2 delta rejects `font` items |
| LIB-01 | `shimmer` utility (A-14, A-20); Spinner for page loads (A-18) | Canon | Forbidden patterns in components.md; Spinner inline only |
| LIB-01 | Forms docs cover React Hook Form, TanStack Form, Formisch\[3\]\[72\] | One vendor | Pick one form library paired with Zod [NEEDS DECISION] |
| LIB-01 | Card composition invites nesting (A-10) | Canon | Forbidden pattern: Card inside Card |
| LIB-01 | Toast versus legacy sonner | One vendor | Core Toast only |
| LIB-01 / LIB-46 | Chart animation (A-14; recharts behaviour not verified) | Canon | Disable animation props on copy-in; reduced-motion story |
| LIB-33 / LIB-34 | Two primitive vendors if mixed | One vendor | §4.0 base decision |
| LIB-05 | Grid items redirect to tablecn\[8\] | Supply chain | Install by SHA; exclude grid items |
| LIB-06 | Possible row animation, real-time flash highlights (A-14) | Canon | Strip on copy-in; drop collaboration items |
| LIB-06 | Demo stack (Drizzle, PartyKit, TanStack DB)\[12\] | Pin | `--dry-run` must show TanStack Table only |
| LIB-06 / LIB-12 | Two data-grid vendors | One vendor | tablecn only; ReUI mined |
| LIB-12 | Paid items behind Bearer key; motion icons (A-13)\[13\]\[14\] | Licence / canon | Never configure `@reui` |
| All registries | `cssVars`/`css` inject tokens and global rules | Token lint | A2 delta rejects unmapped `cssVars` and `@layer base` |

## 9. Scout questions

| # | Mode | Question | Input needed | Answered in |
|---|---|---|---|---|
| Q1 | Project | Which project profile does this product match? | Brief | §6 |
| Q2 | Project | Which jobs does the first release need? | Brief, package | §5 |
| Q3 | Project | Does shadcn core cover each job? | Job list | §5, Appendix A |
| Q4 | Project | Which sanctioned additions does the profile allow? | Profile | §6, §1 |
| Q5 | Project | Which tells do the chosen defaults trip? | DESIGN.md, chosen components | §8, §4 |
| Q6 | Project | Do component variables map mechanically onto this brand's tokens? | tokens.md | §4, §8 |
| Q7 | Project | Which base does this product run on? | package (components.json) | §4.0 |
| Q8 | Project | Does any chosen item need a host outside the allowlist? | package | §7.5 |
| Q9 | Feature | Which job ID is missing, and which row almost serves it? | components.md, package | §5 |
| Q10 | Feature | Is there a core answer or a Base UI fallback? | Job ID | §5 |
| Q11 | Feature | Is there a short-listed alternative, and its verdict? | Job ID | §5, §4 |
| Q12 | Feature | Does the item pass the A2 deltas? | Item `--dry-run` payload | §7.2, §7.4 |
| Q13 | Feature | Does it add a second vendor in a category? | tech-stack.md, package | §8 |
| Q14 | Feature | Can every state be reached by story? | Candidate source | §4 |
| Q15 | Feature | If nothing fits, is it a domain component? | Job ID | §5 |
| Q16 | Both | Has the ledger entry's re-score condition been met? | Ledger date, upstream changelog | §4 |

## 10. Not found

- `ui.shadcn.com/r/registries.json` was refused by the fetch tool (2026-10-03), so the official namespace list and count are not found. shoogle.dev (third party) reports 418.\[52\]
- Seeded libraries never opened: Motion Primitives, Eldora UI, Smooth UI, Kokonut UI, Launch UI, tweakcn, Plate, Novel, prompt-kit, JollyUI, Intent UI, Park UI, Supabase UI Library, Ark UI, Headless UI, Ariakit, Bundui, awesome-shadcn-ui.
- No primary React 19 / Tailwind v4 statement read for Kibo UI, Magic UI, Aceternity UI, Animate UI, React Bits, coss ui, assistant-ui.
- AI Elements licence (latest release ai-elements@1.9.0, "12 Mar", year not shown on the releases page); Tremor latest commit; React Aria Components LICENSE file.
- TypeScript 5.9 compatibility for any library.
- Complete component lists for Dice UI, ReUI and tablecn.
- Whether the CLI resolves GitHub addresses via github.com or raw.githubusercontent.com.
- Specialist categories with no source read: colour pickers, phone input, tree view, PDF viewing, maps, node canvas, scheduler, kanban, product tours, code blocks, icons, file upload, drag and drop.

## 11. Open markers

| # | Marker | Location | Subject |
|---|---|---|---|
| M-01 | [NEEDS DECISION — BLOCKING] | §1, §7.5 | Network allowlist for registry fetches |
| M-02 | [NEEDS DECISION] | §1, §4.0 | Base UI as single primitive base |
| M-03 | [NEEDS DECISION] | §8 row 1 | `cn` package versus clsx + tailwind-merge |
| M-04 | [NEEDS DECISION] | §8 row 2 | `shadcn/tailwind.css`: eject or pin |
| M-05 | [NEEDS DECISION] | §8 row 5 | One form library |
| M-06 | [NEEDS DECISION] | §6 marketing row | Marketing register routing (Framer ruling) |
| M-07 | [ASSUMPTION: …] | §2 | G0 pre-gate |
| M-08 | [ASSUMPTION: …] | §2 | G1 evidence rule |
| M-09 | Closed (no marker remains) | §4 LIB-34 | Base UI licence: verified MIT per LICENSE file |
| M-10 | [PROPOSED] | §1 table (6), §1 A2 amendment (1) | Verdict summary and A2 text |
| M-11 | [PROPOSED] | §4 verdicts: LIB-01, LIB-34, LIB-33, LIB-05, LIB-06, LIB-12 | Ledger verdicts |

## 12. Sources

The numbered source list with read dates is attached by the publishing citation pass; every body claim names its source and read date inline.

## Appendix A. Full component lists

**LIB-01 shadcn/ui core** (Base UI docs sidebar, read 2026-10-03; 64 components): Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge, Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Direction, Drawer, Dropdown Menu, Empty, Field, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message, Message Scroller, Native Select, Navigation Menu, Pagination, Popover, Progress, Questionnaire, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography. Also listed: @shadcn/react, @shadcn/helpers, three form integrations, scroll-fade, shimmer.\[3\]

**LIB-34 Base UI** (parts named in release notes; full catalogue not read): Accordion, Autocomplete, Button, Checkbox, Combobox, Context Menu, Drawer, NavigationMenu, NumberField, OTPField (preview), Popover, PreviewCard, Select, Slider, Tooltip.\[6\]\[63\]

**LIB-33 Radix Primitives** (parts named in commits; full catalogue not read): ContextMenu, Popper, RovingFocusGroup, FocusScope, Form control.

**LIB-05 Dice UI** (verified only): data-table and data-grid items (redirected to tablecn); hooks use-mobile, use-as-ref, use-lazy-ref.

**LIB-06 tablecn** (verified only): data-table, data-table-filter-list, data-grid, use-data-grid-undo-redo.

**LIB-12 ReUI** (verified only): data-grid, data-grid-i18n (licence-key gated), date-selector.

---

Return this file to Claude Code in product-engineering-mastery. File it unchanged at `docs/research/design-tools/react-ui-libraries.md`; Plumb then distills it into `docs/design/component-sources.md`.

`[NEEDS DECISION]` items in priority order:
1. M-01 — Network allowlist for registry fetches (BLOCKING): add ui.shadcn.com and use SHA-pinned GitHub addresses, or vendor registry JSON.
2. M-02 — Base UI as the single primitive base for @pem/ui.
3. M-03 — `cn` package versus the pinned clsx + tailwind-merge.
4. M-04 — `shadcn/tailwind.css`: eject into packages/ui or pin shadcn as a dependency.
5. M-05 — One form library paired with Zod.
6. M-06 — Marketing register: code here or route per the Framer ruling.

## Sources

1. [Changelog - shadcn/ui](https://ui.shadcn.com/docs/changelog)
2. [ui/LICENSE.md at main · shadcn-ui/ui](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
3. [June 2026 - GitHub Registries](https://ui.shadcn.com/docs/changelog/2026-06-github-registries)
4. [July 2026 - Base UI as the Default - shadcn/ui](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
5. [Base UI vs. React Aria Components: Which Headless React Library Should You Use in 2026?](https://www.untitledui.com/blog/base-ui-vs-react-aria)
6. [Releases · Base UI](https://base-ui.com/react/overview/releases)
7. [Commits · radix-ui/primitives](https://github.com/radix-ui/primitives/commits)
8. [fix(docs): redirect use-data-grid-\* registry items to tablecn by Dtem4ik · Pull Request #290 · sadmann7/diceui](https://github.com/sadmann7/diceui/pull/290)
9. [GitHub - sadmann7/diceui: Accessible shadcn/ui components built with React, TypeScript, and Tailwind CSS. Copy-paste ready, and customizable. · GitHub](https://github.com/sadmann7/diceui)
10. [fix(docs): redirect style-prefixed data-grid and data-table items to tablecn by sadmann7 · Pull Request #309 · sadmann7/diceui](https://github.com/sadmann7/diceui/pull/309)
11. [GitHub - sadmann7/tablecn: Data table and data grid components built with shadcn/ui, featuring sorting, filtering, pagination, infinite scrolling, and real-time collaboration. · GitHub](https://github.com/sadmann7/tablecn)
12. [tablecn/README.md at main · sadmann7/tablecn](https://github.com/sadmann7/tablecn/blob/main/README.md)
13. [GitHub - keenthemes/reui: Design-forward shadcn kit for interfaces that stand out. 1000+ free patterns! · GitHub](https://github.com/keenthemes/reui)
14. [Data-Grid i18n behind required authorization · Issue #129 · keenthemes/reui](https://github.com/keenthemes/reui/issues/129)
15. [shadcn](https://shadcn.com/)
16. [The AI-Native shadcn/ui Component Library for React](https://www.shadcn.io/)
17. [List of shadcn/ui registries — Grokipedia](https://grokipedia.com/page/List_of_shadcnui_registries)
18. [sadmann7 (Sadman Sakib) · GitHub](https://github.com/sadmann7)
19. [GitHub - cosscom/coss: coss.com/ui is the official design system of Cal.com · GitHub](https://github.com/cosscom/coss)
20. [Origin UI Alternative After the Move to coss ui](https://ui.watermelon.sh/alternatives/origin-ui)
21. [GitHub - Thegreatsura/coss: coss.com is the new holding company of cal.com, the pioneers of open source scheduling infrastructure and cal.com continues to be the 'google search' of our alphabet. · GitHub](https://github.com/Thegreatsura/coss)
22. [DEV Community](https://dev.to/jqueryscript/basecn-shadcnui-components-built-on-base-ui-foundation-4ma7)
23. [GitHub - magicuidesign/magicui: UI Library for Design Engineers. Animated components and effects you can copy and paste into your apps. Free. Open Source. · GitHub](https://github.com/magicuidesign/magicui)
24. [Magic UI — UI library for Design Engineers](https://magicui.net/)
25. [About Magic UI](https://magicui.net/about/)
26. [Terms and Conditions](https://ui.aceternity.com/terms)
27. [GitHub - shadcnblocks/kibo: A custom registry of composable, accessible and extensible components designed for use with shadcn/ui. Free and open source, forever.](https://github.com/shadcnblocks/kibo)
28. [Kibo UI - React Component Library for shadcn](https://www.everydev.ai/tools/kibo-ui)
29. [License - ReUI](https://reui.io/legal/license)
30. [animate-ui/LICENSE.md at main · imskyleen/animate-ui](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md)
31. [Animate UI](https://www.shadcn.io/awesome/item/animate-ui)
32. [react-bits/LICENSE.md at main · DavidHDev/react-bits](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)
33. [registry.directory — The explorer for the shadcn registry ecosystem](https://registry.directory/)
34. [Shadcn Private Registry Access with Namespaced Registries - Shadcnblocks.com](https://www.shadcnblocks.com/blog/shadcn-private-registry-access-namespaced-registries)
35. [shadcn/ui Registry](https://shadcnregistry.com/)
36. [GitHub - vercel/ai-elements: AI Elements is a component library and custom registry built on top of shadcn/ui to help you build AI-native applications faster. · GitHub](https://github.com/vercel/ai-elements)
37. [GitHub - assistant-ui/assistant-ui: Typescript/React Library for AI Chat 💬🚀](https://github.com/assistant-ui/assistant-ui)
38. [assistant-ui · GitHub](https://github.com/assistant-ui)
39. [Vercel acquires Tremor to invest in open source React components - Vercel](https://translate.google.com/translate?u=https%3A%2F%2Fvercel.com%2Fblog%2Fvercel-acquires-tremor&hl=id&sl=en&tl=id&client=srp)
40. [MUI Releases Base UI 1 with 35 Accessible Components - InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/)
41. [Registry Directory](https://ui.shadcn.com/docs/registry/registry-index)
42. [How to Add shadcn Charts to a Next.js App Without Writing Recharts Boilerplate](https://freecodecamp.org/news/how-to-add-shadcn-ui-charts-to-nextjs)
43. [The 13 best Tailwind CSS component libraries - LogRocket Blog](https://blog.logrocket.com/13-best-tailwind-css-component-libraries/)
44. [21 Best Free React Templates 2026 + Premium Picks Worth Paying For](https://adminlte.io/blog/free-react-templates/)
45. [Radix · GitHub](https://github.com/radix-ui)
46. [Shadcn Studio - Shadcn UI Components, Blocks & Templates](https://shadcnstudio.com/)
47. [Changelog](https://www.shadcn-ui-blocks.com/changelog)
48. [Component Registries - Awesome shadcn/ui](https://www.shadcn.io/awesome/registries)
49. [\[Registry Directory\]: Pure UI · Issue #8899 · shadcn-ui/ui](https://github.com/shadcn-ui/ui/issues/8899)
50. [\[Registry Directory\]: lucide-animated · Issue #8931 · shadcn-ui/ui](https://github.com/shadcn-ui/ui/issues/8931)
51. [GitHub - codedthemes/registry.directory: Explore your favorite shadcn/ui registries. · GitHub](https://github.com/codedthemes/registry.directory)
52. [Shadcn Registry Directory - Awesome shadcn UI | shoogle.dev](https://shoogle.dev/directory)
53. [Radix vs Base UI: which headless React library should you use in 2026?](https://www.shadcndeck.com/blog/radix-vs-base-ui)
54. [Changelog - Shadcnblocks.com](https://www.shadcnblocks.com/changelog)
55. [March 2026 - shadcn/cli v4 - shadcn/ui](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
56. [shadcn - npm](https://www.npmjs.com/package/shadcn?activeTab=versions)
57. [shadcn - npm Package Security Analysis - Socket.dev](https://socket.dev/npm/package/shadcn)
58. [May 2026 - shadcn eject - shadcn/ui](https://ui.shadcn.com/docs/changelog/2026-05-shadcn-eject)
59. [MCP Server - shadcn/ui](https://ui.shadcn.com/docs/mcp)
60. [shadcn Release Notes & Changelog · July 2026 — releases.sh](https://releases.sh/shadcn/releases)
61. [Rita Iglesias on X: "Base UI stable release out 💥How cool is that? 💙" / X](https://x.com/rita_codes/status/1999436866232488255)
62. [Releases · mui/base-ui](https://github.com/mui/base-ui/releases)
63. [v1.1.0 · Base UI](https://base-ui.com/react/overview/releases/v1-1-0)
64. [radix-ui repositories · GitHub](https://github.com/orgs/radix-ui/repositories)
65. [fix(docs): redirect data-grid and data-table hooks to tablecn by sadmann7 · Pull Request #308 · sadmann7/diceui](https://github.com/sadmann7/diceui/pull/308)
66. [Dice UI](https://bestofjs.org/projects/diceui)
67. [sadmann7/tablecn — finds.dev](https://finds.dev/repo/sadmann7/tablecn)
68. [Keenthemes Inc · GitHub](https://github.com/keenthemes)
69. [\[RFC\] Add composable & accessible TimePicker component (@reui/time-picker) · Issue #144 · keenthemes/reui](https://github.com/keenthemes/reui/issues/144)
70. [components.json - shadcn/ui](https://ui.shadcn.com/docs/components-json)
71. [Namespaces - shadcn/ui](https://ui.shadcn.com/docs/registry/namespace)
72. [registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json)
