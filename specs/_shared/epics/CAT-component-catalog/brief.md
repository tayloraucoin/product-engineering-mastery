---
epic: CAT
status: draft
---

# Brief — The component kit and the catalog

> Framed in the Plumb thread of 2026-10-04 from Taylor's brain dump and the returned P-M research (`docs/research/design-tools/react-ui-libraries.md`, filed by CAT-1). Evidence for the past-repo claims is [`research/prior-repos-components.md`](research/prior-repos-components.md). Taylor approved the four recommendations (Base UI, per-command registry access, Vega, catalogue by job) on 2026-10-04.

## Job

- **Trigger:** "A new brand or project starts, or a feature needs a component: show me every component worth considering, from shadcn and the ecosystem and what I have built before, filter by where it comes from, and let me take the code."
- **Baseline:** each product re-copies shadcn by hand and rebuilds the same custom components. The survey found the same jobs built in three to five repos each (a sortable list in five, a responsive sheet in three, an overflow menu in four), each copy drifting from the last, with no place to see the options side by side.

## User

- Taylor, at the start of a product or when a feature's package names a job the inventory lacks, browsing the local workshop on a laptop with a coding agent doing the copying.

## Metric

- **Signal:** a qualitative bar, named plainly: every shadcn Base-track component is in `@pem/ui` with a story per state and zero axe errors, and the catalog shows each ruled source and the custom lifts, filterable by source in the sidebar.
- **By when:** the next product started from the starter.
- **Kill criterion:** the first new product copies components from somewhere other than the kit or the catalog because the catalog did not have what it needed or could not be trusted.

## Evidence

- Five repos surveyed on 2026-10-04 (verified, read from the code): the stack moved from shadcn `default` on Radix with Tailwind 3 (agora, 2024) to a shared ui package with Storybook (cho-verse, 2026-04), the primitives/composed split (Conscious Connections, 2026-05), and the formalised layout this repo uses (Synapse, 2026-09). Twenty-nine custom jobs were built more than once.
- The P-M research (2026-10-03): shadcn core moved its default base to Base UI in July 2026; only six of 75 sources passed its gates, most on thin evidence rather than known defects.
- Counter-evidence: a shelf of components no product uses is code to maintain, and most ecosystem defaults trip canon tells (A-13, A-14). Answered by keeping the shelf apart from the kit, catalogued by job, mapped to tokens or recorded link-only.

## Appetite

- Big batch: the kit (about ten tickets) first; the catalog grows ticket by ticket after it.

## Mode

- Production.

## Decision this unblocks

- The scout step for a new brand (which components a product keeps) and for a feature (which source serves a missing job). Plumb rules each promotion from the shelf into the kit.
