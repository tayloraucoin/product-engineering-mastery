Venue: Claude Code, in product-engineering-mastery, branch agent/STK

# STK technical — The default stack, its removal protocol and the new-project guide

**Model:** deepest available.

**Role.** Read `docs/roles/engineering/mason-cto-principal-dev.md` first, with `docs/prompts/shared-context.md`. You are Mason. Use plan mode before writing: this stage changes package boundaries and adds decision records.

**Support.** Quartermaster (`docs/roles/engineering/quartermaster-stack-migration-engineer.md`) for pins and each new dependency. Warden (`docs/roles/engineering/warden-security-privacy-engineer.md`) for the environment seam, auth and what reaches a browser bundle. Usher (`docs/roles/engineering/usher-developer-experience-onboarding-lead.md`) for the new-project guide and the removal runbooks. Turner (`docs/roles/engineering/turner-design-engineer.md`) for the brand source and the component workshop. Loom (`docs/roles/engineering/loom-ai-systems-architect.md`) for the AI package. Consult, never co-pilot.

**Attached.**

| File                                                                                                        | Reason                                                                                                            |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `specs/_shared/epics/STK-default-stack/brief.md`                                                            | The frame                                                                                                         |
| `specs/_shared/epics/STK-default-stack/research/prior-repos-audit.md`                                       | What the three product repos do, by area                                                                          |
| `specs/_shared/epics/STK-default-stack/research/api-layer.md`, `error-monitoring.md`, `local-auth-users.md` | The three research notes; if one is missing, mark its calls `[NEEDS DECISION — BLOCKING]` and proceed on the rest |
| `docs/engineering/codebase-conventions.md`                                                                  | Placement and the package graph being amended                                                                     |
| `docs/engineering/tech-stack.md`                                                                            | The pins and the "Deliberately absent" table being retired                                                        |
| `docs/decisions/records/0005-two-packages-and-boundaries-lint.md`                                           | The record being superseded                                                                                       |
| `toolkit.json`                                                                                              | Reviewer rows, `migrationsDir`, and where a `stack` block would live                                              |
| `docs/engineering/templates/technical.template.md`                                                          | What this stage writes                                                                                            |

**No UX level.** This epic adds no user-facing surface, so no `ux/` files exist. `[NEEDS DECISION]` whether Taylor waives the UX level for this epic or the component workshop and the starter's default pages get a surface file; recommended default: waive, and say so in `technical.md`.

**Decision served.** The placement, package graph, environment contract, removal protocol and ticket order for the default stack, with every one-way door routed to Taylor.

## Rulings already made by Taylor (2026-10-03). Do not reopen; build on them

1. **The starter ships the default stack.** This reverses EN-05 and conventions rule 9 as written. A seam whose content is project-specific may ship as a folder holding only a README that states its convention. Needs a new record that supersedes 0005 and an amended rule 9.
2. **A product is made by duplicating the whole repo, then removing.** The guide's protocol includes removing the demo content and whatever of the practice a product does not keep. This replaces the README's "copies selected pieces, never the demo app".
3. **One tier switch, `local | staging | production`, never defaulting to production.** Every other key follows it: database URLs, the Supabase project, Stripe keys, site URLs.
4. **Stripe keys are selected by the tier switch and nothing else.**
5. **Supabase is the default for database and for auth, and each is removable on its own.** The new-project documentation has one document for a product without Supabase Auth and one for a product without the Supabase database, each with the full list of files to change or delete, so removal leaves nothing behind.
6. **Billing (Stripe) is a default and removable by the same protocol. Email (Resend) is locked in:** sign-up needs it either way.
7. **Stripe webhooks: one file per event handler** behind a small dispatcher, as in Conscious Connections. Modular, not elaborate.
8. **Email:** Resend. Templates are usually designed in Resend; a plain, well-made default HTML template in code is acceptable. Keep it simple.
9. **The brand has one source of truth.** Colours and fonts are named tokens; no hard-coded brand value in a manifest, layout, email or story.
10. **Single brand only.** The multi-brand pipeline from cho-verse is not carried.
11. **The AI package is a default,** with the standard use cases pre-configured.
12. **A logger with a set convention is a default. Analytics is a placeholder only:** PostHog is coming through the measurement layer (prompt P-G), so spend nothing on the emitter here.
13. **Error monitoring becomes standard,** on the tool the research note recommends.
14. **Drizzle, not Prisma.**
15. **The component workshop must open on localhost with one command.** Its home and version are the stage's call.
16. **Light and dark mode stay** as the existing class-based theme switch.
17. **`constants` ships as a package.** `types`, `utils` and `hooks` ship only if the stage finds a default consumer; otherwise as README-only seams.
18. **Local development supports both hosted staging sign-in with local data, and fully local.** The local-user mimicry lives in one dedicated file.
19. **Not carried:** env pull tooling, the generated schema reference, the "no tests" and "no branches" slice rules, the old spec-track files.

## Quartermaster's recommendations from the framing thread. The stage rules on each

1. **Keep the switch named `DATABASE_ENVIRONMENT`,** documented as "which backing services this process talks to". Taylor's own reasoning argues against `APP_ENV`: running on a laptop against staging data is still local code. Two axes exist and only one is set by hand: the tier (data, auth project, payment keys) is the variable; where the code runs (localhost or deployed) is derived and decides the site URL and which Stripe webhook secret applies, as Synapse's fixed localhost URL and Conscious Connections' local webhook secret both show.
2. **Guard the payment keys at validation:** local and staging accept only test-mode keys, production only live-mode, checked by key prefix in `env.ts`, so a mis-set variable fails at boot.
3. **Do not pass server secrets through the `env` block of `next.config.ts`.** Collapse only `NEXT_PUBLIC_*` names there; server code reads secrets from the resolved `env` object at runtime.
4. **Brand source:** tokens stay in `packages/config/tailwind/preset.css`; one typed brand module holds the name, URLs, contact address, asset paths and the two theme-colour values a manifest needs, with a check that those two values equal the preset's. Logos and fonts live in one package and are served to apps and the workshop from there.
5. **Logic layer:** pure helpers in `utils`; server logic in `services/<domain>/` beside the API layer; headless React in `hooks`; no `lib` or `helpers` package. Row types are inferred from the Drizzle schema in `db`, so `types` holds only what has no schema.
6. **Component workshop:** stays in `packages/ui`, moves to the current Storybook major with the Vite-based Next.js framework, and gains interaction and accessibility checks in `yarn verify`. Verify the versions on the day; do not trust this line.
7. **Small helpers:** carry the LAN dev-origins helper (phone testing) and the contrast audit (it checks the token file); drop the rest.
8. **Removal protocol:** every module declares a manifest (files, environment variables, dependencies, boundaries entries, settings rules, docs) in a `stack` block of `toolkit.json`; each removal runbook is generated from or checked against it; a check fails when a removed module's files, variables or dependencies remain.

**The ask.**

1. Decide the package set and the amended import graph. One table: package, role, may import, default consumer or "README seam".
2. Write the environment contract: the switch, the suffix grammar, the generic per-tier picker, what `env.ts` validates, what `next.config.ts` may collapse, `turbo.json` entries, and the `.env.example` layout. Rule on recommendations 1 to 3.
3. Decide the database and auth design from the local-users note: schema layout, policy factories, the bridge, setup SQL, scripts, `migrationsDir`, and the agent permission rules for database commands.
4. Decide the API layer from its note.
5. Decide the brand source, the asset home, and how the manifest, metadata, icons, emails and the workshop read it. Rule on recommendation 4.
6. Decide the workshop's version, framework, checks and command. Rule on recommendation 6.
7. Decide billing, email, AI, logging and error-monitoring placement, each with its boundaries owner.
8. Specify the removal protocol and the module manifest. Rule on recommendation 8. Name each removal runbook and its path under `docs/runbooks/`.
9. Outline `docs/runbooks/new-project.md`: the steps an agent follows from a briefing to a configured product repo, including what of `docs/`, `specs/` and the demo a product keeps.
10. List every one-way door touched, each with its record or its ratification due.
11. Propose the ticket order, each ticket under half a day, with the guide and the environment module first.

**Writes.** `specs/_shared/epics/STK-default-stack/technical.md` (or `technical/` when over 2,000 tokens), from `docs/engineering/templates/technical.template.md`. Draft decision records under `docs/decisions/records/` for each one-way door, status proposed, with ledger lines and a `changelog.md` entry.

**Gate.** Taylor ratifies the routed calls, on the record. An unratified one-way door blocks the Tickets stage.

**Handoff.** Write the Tickets prompt to `prompts/04-tickets.md` from `docs/workflows/stages/tickets.md`, print it, and say: open a new thread with it.

**Evidence rules.** Claims about the product repos cite the audit note or a path. Version and capability claims carry the date verified. Label judgment as judgment. Not found is marked, never filled.

**Not wanted.**

- Any code in `apps/` or `packages/` in this thread.
- Copying a package wholesale from a product repo; each is re-scoped to `@pem/*` in its own ticket.
- A package or folder without either a default consumer or a README stating its convention.
- Reopening the nineteen rulings.
- Project-specific content from the product repos: domain schemas, routers, composed components, palettes.

**Markers.** `[ASSUMPTION: …]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[PROPOSED]` only.

**Standing rules.** No emoji. Synthetic data in every example. Every claim about tool behaviour carries the version and date it was verified on.
