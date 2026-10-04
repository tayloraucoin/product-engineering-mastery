# STK-1 C4 — re-read at batch close

Re-read by the builder (claude-opus-5-5, Claude Code) on 2026-10-03, at `0c215e8`, because the planned paths changed after the first reading (`evidence/C4.md`, recorded at `0dcce4c`). Command: `git diff 0dcce4c 0c215e8 -- <the planned paths>`.

## What changed since the first reading

| File | Change | Owner |
| --- | --- | --- |
| `docs/decisions/ledger.md` | PR-13, PR-14, PR-15 added to §8 | PJ (process rulings) |
| `docs/decisions/changelog.md` | four 2026-10-03 PJ entries above STK-1's | PJ |
| `docs/engineering/codebase-conventions.md` | rule 6 and §5 now describe `apps/web/env.ts` and `@pem/env` as built; the `@pem/env` row is built, May import `config`; `apps/*` may import `env` | STK-4 |
| `docs/engineering/tech-stack.md` | `next-themes` and `@t3-oss/env-nextjs`/`zod` rows added; the Env row deleted from "Deliberately absent" | STK-6, STK-4 |
| `docs/engineering/codebase-conventions.md` (again, `0c215e8`) | the `@pem/db` row is built, May import `config`, `env`; `apps/*` may import every package above; a paragraph states D-STK-16's one owner per vendor SDK | STK-9 |
| `docs/engineering/tech-stack.md` (again, `0c215e8`) | `drizzle-orm`, `drizzle-kit`, `postgres` and the local image pinned; the Database row deleted from "Deliberately absent" | STK-9 |

Record 0010, `docs/decisions/records/README.md` and the directory map's STK-1 lines are unchanged.

## Does C4 still hold

- **Record 0010** still states the decision, the three options and the revisit trigger (unchanged file).
- **Rule 9** still reads "A seam ships with a default consumer or a README that states its convention."
- **§4** still carries the D-STK-1 graph string unchanged; `services` still reads undecided. The `@pem/env` and `@pem/db` rows turning built is STK-4 and STK-9 doing what §4 says ("the ticket that builds it adds them and turns its row to built"); each May import cell matches `PACKAGE_IMPORTS` in `boundaries.js`, and `db` sits above `env` as D-STK-1 orders. The SDK-owner paragraph is D-STK-16, which D-STK-1 does not contradict. Every other unbuilt row still names its ticket.
- **§5** still states D-STK-3: the switch, its default and "never defaults to production", the suffix grammar, location derived and never set, the pure picker, the two kinds of reader. STK-4 added how the location is derived (`VERCEL_ENV`) and the client-bundle check; both are within D-STK-3. Nothing unbuilt is described as built.
- **Ledger and changelog:** EN-06 to EN-10 and the five STK-1 changelog bullets are unchanged. The added lines are PJ's own rulings, each with its own changelog entry.

## Verdict

PASS.
