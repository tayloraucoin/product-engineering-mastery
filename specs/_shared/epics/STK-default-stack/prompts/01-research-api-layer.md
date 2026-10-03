Venue: general Claude thread, with web research on

# STK research 1 — What the API layer does, and when tRPC is the right tool

**Model:** deepest available.

**Role.** Read `docs/roles/engineering/mason-cto-principal-dev.md` first, with `docs/prompts/shared-context.md`. You are Mason, teaching as well as ruling: the reader is the owner, who has shipped two products on tRPC and no longer remembers what it is for.

**Support.** Quartermaster (`docs/roles/engineering/quartermaster-stack-migration-engineer.md`), consulted for the dependency's health and upgrade cost only. Wainwright (`docs/roles/engineering/wainwright-mobile-engineer.md`), consulted for what a React Native client needs from the server only. Consult, never co-pilot.

**Attached.**

| File                                                                  | Reason                                                                                 |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/brief.md`                      | Knowledge gap 1, the question as asked                                                 |
| `specs/_shared/epics/STK-default-stack/research/prior-repos-audit.md` | How the two recent products lay out `api`, `validators`, `hooks` and the server caller |
| `docs/engineering/tech-stack.md`                                      | The standing house choice: "tRPC, thin procedures over services"                       |
| `docs/workflows/templates/research-note.template.md`                  | What this thread writes                                                                |

**Decision served.** Whether `@pem/api` on tRPC ships in the starter by default, ships as a removable module, or is left out until a product needs it. Taylor decides; the Technical stage acts on it.

**The ask.**

1. Explain, in a systems-design mental model a product engineer can redraw from memory, what sits between a screen and the database in a Next.js App Router app: Server Components reading data directly, Server Actions, Route Handlers, and tRPC. One diagram in text, one paragraph each, and the one sentence that says what problem each solves.
2. State what tRPC adds on top of Server Actions plus a shared Zod schema as of the versions current today, dated, and what it costs: packages, boilerplate per endpoint, bundle, learning load, upgrade history.
3. Make the case for tRPC as the house default, then the case against, each at full strength.
4. Name the use cases where it is plainly the correct tool and those where it is overkill. Cover at least: a marketing site; a single web app; a web app plus a second web app sharing procedures; a web app plus a React Native app; public or third-party API consumers; webhooks; streaming AI responses; background jobs and cron.
5. Say what the service layer (`services/<domain>/`) is independent of the transport, and whether the starter can keep services and validators while making the transport a later choice.
6. Recommend one of: default, removable module, absent. Give the revisit trigger.

**Writes.** `specs/_shared/epics/STK-default-stack/research/api-layer.md`, from `docs/workflows/templates/research-note.template.md`. Print the full note in the thread so it can be saved by hand.

**Gate.** The note answers question 6 with one recommendation, or says what was not found. Taylor reads it.

**Handoff.** Print: "Save this note at the path above, then open `prompts/03-technical.md`."

**Evidence rules.** Primary sources (the tRPC, Next.js and React docs, release notes) over comparisons. Every version, capability and deprecation claim carries its date. Label each claim verified, secondary or judgment. Not found is marked, never filled.

**Not wanted.**

- A tutorial on writing tRPC routers.
- GraphQL, REST framework or backend-as-a-service comparisons beyond one line each.
- A recommendation that depends on team size the owner does not have.
- Code beyond the smallest snippet that shows a difference.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example. Every claim about tool behaviour carries the version and date it was verified on.
