# As-built — STK-19

## Shipped against the contract

- C1: `tooling/contrast-audit.ts` (`yarn contrast-audit`, in `yarn verify` before `test:tooling`) reads every `:root` block as light and layers `.dark` over it, follows `var()`, converts `oklch()`, `rgb()` and hex to sRGB, and checks 9 pairs per theme: 7 text pairs at 4.5:1 and the focus ring on `--background` and `--muted` at 3:1. A missing or unreadable token fails. `tooling/contrast-audit.test.ts` (5 tests) passes the repo's preset, measures black on white at 21:1, and fails a synthetic `#777777` on white (4.48:1), a dark ring under 3:1 and a missing token. `yarn test:tooling` PASS, 38 tests.
- C2: `yarn verify`, run at batch close.
- C3: `yarn web:dev:local` runs `tooling/print-local-urls.ts 3000` and then `turbo run dev --filter=web -- --hostname 0.0.0.0`. `apps/web/next.config.ts` sets `allowedDevOrigins: getLocalDevOrigins()` from `tooling/local-dev-origins.ts`. The LAN origin hydrates in the browser pane (`evidence/C3.md`); a phone has not opened it yet.
- Non-negotiables: `apps/web/vercel.json` runs `corepack enable && cd ../.. && yarn install --immutable` and `cd ../.. && yarn turbo run build --filter=web`. `.github/workflows/ci.yml` already runs `yarn verify` as its one step, so it is unchanged. `README.md` documents phone testing, the audit and the deploy.

Preset changes. The audit failed 4 light-theme pairs on the STK-6 preset. Each was fixed by changing one raw step's lightness only:

| Token           | Before             | After              | Pair it fixes                                                                       | Dark role kept                                            |
| --------------- | ------------------ | ------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `--neutral-500` | `oklch(0.556 0 0)` | `oklch(0.545 0 0)` | light `--muted-foreground` on `--muted` and `--accent`: 4.34 to 4.54:1              | dark `--ring` on `--muted`: 3.05:1 (was 3.19)             |
| `--neutral-400` | `oklch(0.708 0 0)` | `oklch(0.645 0 0)` | light `--ring` on `--background` (2.59 to 3.30:1) and on `--muted` (2.38 to 3.02:1) | dark `--muted-foreground` on `--muted`: 4.58:1 (was 5.83) |

## Deviations

- **devs_call, settled:** the helpers are `tooling/local-dev-origins.ts` and `tooling/print-local-urls.ts`, the names the audited repo used, ported to TypeScript. The audit is `tooling/contrast-audit.ts`, moved from the audited repo's `packages/config/scripts/` into `tooling/`, per the contract note. The audit reads oklch, because this preset uses it and the audited one used hex.
- **`apps/web/next.config.ts` imports `../../tooling/local-dev-origins`,** a relative import from an app into `tooling/`. The contract says the config reads the helper, and `tooling/` is not a workspace. `yarn lint:boundaries` passes.
- **No `apps/web/package.json` change:** `web:dev:local` passes `--hostname 0.0.0.0` through turbo to the app's existing `dev` script.
- **The margins are thin by design:** each step sits inside the window that keeps both of its roles passing. `--neutral-500` must stay between L 0.541 and 0.547, and `--neutral-400` between L 0.641 and 0.647. The audit guards both.
- [ASSUMPTION] The pair list is a judgment: text on every surface the components put it on (canon C-P01: muted text passes on every surface, in every theme), plus the focus ring at 3:1 (WCAG 2.2 SC 1.4.11). Borders are decorative and are not audited.
- **No `tech-stack.md` line became untrue:** the file names no deploy target or helper, so it is unchanged and not in `planned_paths`. The contract lists no `toolkit.json` entry or boundaries row for this ticket, so none was added.
- **No brand-mapped token was touched:** `@pem/brand` is STK-7.

## Not verified

- C3 (manual): nobody has opened the printed URL on a phone yet; `evidence/C3.md` holds the same-machine LAN-origin check and the step to finish it.
- `apps/web/vercel.json` has not been deployed from this repo. It matches the audited repo's working config for its own app, read 2026-10-04. That Vercel runs `corepack enable` in `installCommand` is not verified here.

## Next

Taylor opens the printed LAN URL on a phone and records C3; STK-7 sets brand colours, and the audit then checks them.
