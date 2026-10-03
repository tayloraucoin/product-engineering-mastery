Venue: general Claude thread, with web research on

# STK research 2 — The house default for error monitoring

**Model:** deepest available.

**Role.** Read `docs/roles/engineering/millwright-platform-engineer.md` first, with `docs/prompts/shared-context.md`. You are Millwright: you will operate whatever is chosen.

**Support.** Quartermaster (`docs/roles/engineering/quartermaster-stack-migration-engineer.md`), consulted for the vendor scorecard and exit cost only. Warden (`docs/roles/engineering/warden-security-privacy-engineer.md`), consulted for what leaves the app in an error payload only. Wainwright (`docs/roles/engineering/wainwright-mobile-engineer.md`), consulted for React Native and Expo coverage only. Consult, never co-pilot.

**Attached.**

| File                                                                                                                                                                                         | Reason                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/brief.md`                                                                                                                                             | Knowledge gap 2, the question as asked                                                               |
| `specs/_shared/epics/STK-default-stack/research/prior-repos-audit.md`                                                                                                                        | The starting point: no product has error monitoring; the logger and the analytics emitter that exist |
| `docs/research/process/staging-branches-customer-testing.md` `[research: the only existing house material on PostHog, including its automatic exception event and the pay-as-you-go ruling]` | Do not re-research what it settles                                                                   |
| `docs/workflows/templates/research-note.template.md`                                                                                                                                         | What this thread writes                                                                              |

**Context the files do not hold.** Product analytics is moving to PostHog (ledger PU-06). The stack is Next.js 16 App Router on Vercel, Supabase Postgres, a Yarn and Turborepo monorepo, usually one developer, products at pre-launch or early traffic. A React Native app will share the monorepo later.

**Decision served.** Which error-monitoring tool the starter wires by default, and how it is removed. Taylor decides; the Technical stage acts on it.

**The ask.**

1. Compare, as of today and dated: Sentry, PostHog error tracking, and at most two other candidates that earn a place. For each: Next.js App Router coverage (server components, route handlers, server actions, proxy, edge), source maps on Vercel, React Native and Expo coverage, alerting, release and environment tagging, free allowance and the first paid step, data region options.
2. Answer directly: is PostHog error tracking enough on its own for an early product that already runs PostHog, or does a dedicated tool earn its second vendor? State what would be lost each way.
3. Specify the minimum wiring for the recommended tool: which files exist, which environment variables, what is captured by default, what is scrubbed before it leaves (personal data, request bodies, auth headers), and how the house logger hands an error to it.
4. Specify how the three tiers behave: local sends nothing or sends to a separate project; staging and production are tagged apart.
5. List every file, variable and dependency the wiring adds, so removal is a checklist.
6. Recommend one tool. Give the kill criterion and the revisit trigger.

**Writes.** `specs/_shared/epics/STK-default-stack/research/error-monitoring.md`, from `docs/workflows/templates/research-note.template.md`. Print the full note in the thread so it can be saved by hand.

**Gate.** The note names one tool and its wiring list, or says what was not found. Taylor reads it.

**Handoff.** Print: "Save this note at the path above, then open `prompts/03-technical.md`."

**Evidence rules.** Vendor docs and pricing pages over comparisons. Every price, allowance and capability carries the date it was read. Label each claim verified, secondary or judgment. Not found is marked, never filled.

**Not wanted.**

- Full observability: tracing, metrics, log aggregation, uptime checks.
- Session replay or product analytics choices; those are settled or belong to the measurement layer.
- A tool chosen for a scale the products do not have.
- Setup code beyond the file list and one config sketch.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example. Every claim about tool behaviour carries the version and date it was verified on.
