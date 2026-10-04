# As-built — CAT-4

## Shipped against the contract

- C1: the Button is shadcn's Vega button on Base UI's Button, in `primitives/control/button/` (`button.tsx`, `button.variants.ts`, `index.ts`), with 17 stories (six variants, three sizes, leading and trailing icons, two icon sizes, three hover states, focus, invalid, disabled) tagged `source:shadcn`, `verdict:kit`, `layer:primitive`. The manifest holds 90 shadcn entries by ticket (CAT-4 to CAT-12; Typography link-only) and STATUS.md is current.
- C2: every story passes its interactions and axe (38 in @pem/ui, the catalog's included).
- C3: the kit and both apps type-check: `buttonVariants` keeps `outline`, `ghost` and `sm`, and `Button` keeps `type` and `disabled`.
- C4: the Button passes the token lint with no waiver: `shadow-control`, colour transitions on `--motion-duration-fast` and `--motion-ease-hover`, the house radius for xs and sm.
- C5: `check-ui-layout` passes; nothing was staged in `src/_shadcn/`.
- C6: `@base-ui/react` 1.8.0, `lucide-react` 1.48.0, `tw-animate-css` 1.4.0 and the `shadcn` CLI 4.21.0 are pinned exactly, each with its tech-stack row and in the `ui` module's dependencies.

## Deviations

- **The CLI writes nothing.** `yarn shadcn add <name> --dry-run --view` gives the resolved source, which the builder writes by hand: letting the CLI write would install the `cn` package (CS-05). The steps are in `component-sources.md`. `components.json` and the tsconfig `paths` exist so the CLI can resolve its aliases for `--view`.
- **`shadcn/tailwind.css` ejected to `src/styles/shadcn.css`** without the shimmer utilities, keyframes and properties (A-14), and imported by `globals.css` with `tw-animate-css`, which Vega's overlays need (`animate-in`, `fade-in-0`, `zoom-in-95`).
- **Vitest inlines `@base-ui/*`** (`.storybook/vitest.config.ts`, path added before the edit): the Next Storybook plugin aliases `react` to Next's compiled copy, which Node's ESM resolver rejects as a directory import.
- **The age gate was applied by hand.** `deps.md` says `.yarnrc.yml` holds one, but `npmMinimalAgeGate` is 0 and the file sets none. Each pin is at least a week old: lucide 1.48.0 rather than today's 1.52.0, the CLI 4.21.0 rather than 4.21.1. Raised to Taylor.
- **The manifest's kinds** follow the kind READMEs: label, kbd, skeleton and alert are display; popover, tooltip, hover card and the menus are feedback; drawer, sheet, card and field are layout; tabs is control. `direction` is a provider and is not a manifest entry; CAT-8 builds it in `providers/`. `sonner` (CS-04) and `form` (no form library yet) are left out, so 90 entries rather than 92.
- **check-refs:** `yarn shadcn` came out of `tooling/refs-pending.json` (path added), and an import step was reworded so it names no yarn subcommand as a script. Both were found by the STK-12 thread.

## Not verified

- The Button in the running workshop and in the two apps' pages; the stories and the type-check cover the API, not the look.

## Next

CAT-5 brings the wave-0 controls by the same path.
