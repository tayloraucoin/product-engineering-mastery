# As-built — STK-7

## Shipped against the contract

- C1: `packages/brand/src/brand.ts` holds the name, short name, description, URLs, contact, asset paths and the two theme colours (`primary`, `primaryForeground`, light and dark, in OKLCH). `src/brand.test.ts` reads `@pem/config/tailwind/preset.css`, follows `var()` through the raw scale for `:root` and `.dark`, and requires each value to equal `--primary` and `--primary-foreground`. Two more tests change a preset raw step and a brand.ts value and expect a named mismatch; a fourth requires every asset path to exist. `packages/brand/turbo.json` adds the preset to the test's inputs, so a preset change is never a cache hit. `src/color.test.ts` covers the OKLCH to hex conversion. `yarn test` PASS, 47 tests.
- C2: `@pem/brand` sits beside `env` in `packages/config/eslint/boundaries.js` (may import `config`); apps import it through `APP_IMPORTS`. `yarn lint:boundaries` PASS.
- C3: `apps/web/app/manifest.ts`, `apps/web/app/opengraph-image.tsx`, both apps' `layout.tsx` metadata and `<html>` font class, and both apps' icon read `@pem/brand`. `yarn verify` PASS (run on its own, after the race noted below).
- C4: `evidence/og.png` is the built Open Graph image: the brand name and description in `primaryForeground` on `primary`, drawn with the brand's own font file (`@pem/brand/image-font`). `evidence/manifest.webmanifest` is the built manifest: name, short name, description, `theme_color` `#171717` and `background_color` `#fafafa` (the light theme colours as hex) and the mark as its icon.
- Non-negotiables. Logos and the font are files in `packages/brand/assets/`. No brand string, hex or asset path remains in the manifest or either layout; there are no emails or stories yet (STK-15, STK-8). The font loads once per app, through `next/font/local`, in `@pem/brand/font`; the preset's `--font-sans` reads its `--font-brand-sans` variable, with the system stack as fallback. The guide's brand step (`docs/runbooks/new-project.md` step 3) edits `brand.ts` and `assets/`, and the two preset steps behind the colours (see Deviations). In the browser pane, `yarn web:dev` served the font, `/manifest.webmanifest` and the icon (`200 image/svg+xml`), with no console errors.

## Deviations

- **devs_call, settled: formats.** Logo and mark are SVG; the mark carries a `prefers-color-scheme` block so the favicon follows the colour scheme. The font is one variable woff2 file. Hex appears only inside the SVG files and as computed output.
- **devs_call, settled: icons.** `@pem/brand/icon` imports `assets/mark.svg` as a static asset; each app's bundler copies it and returns its hashed URL, which the layouts' `icons` and the manifest use. `apps/web/app/icon.svg` was tried as a symlink to the mark and Next 16.3.8 failed the build (`no direct app page entry found for /icon.svg`, 2026-10-04), so no `icon.svg` file exists and no copy can drift. No PNG icons are generated.
- **Ruled by Taylor, 2026-10-04: the brand step also edits the preset.** The non-negotiable says the step edits `brand.ts` and assets only. D-STK-9 keeps the colour tokens in `preset.css` and non-negotiable 3 tests the two against each other, so the preset edit is unavoidable. D-STK-9 is in `technical.md`, the same precedence rung as this contract, not an accepted record, so neither outranks the other. Taylor accepted it as built: the step sets the two colours in both files, and the test fails until they agree (batch review S3).
- **[ASSUMPTION] The two theme colours are `--primary` and `--primary-foreground`,** the pair the guide's briefing already asks for. The manifest uses the light values; the OG image draws `primaryForeground` on `primary`.
- **[ASSUMPTION] The placeholder font is Geist (latin, variable 400 to 600, SIL OFL 1.1),** copied from Next 16.3.8's own bundle with its licence from the Geist repository, both on 2026-10-04. It is canon A-01 if a product keeps it, so the briefing gains a "Typeface and its reason" input and step 3 says so. The file is named `brand-sans.woff2`, so a product replaces it without editing `font.ts`. The Open Graph image cannot read woff2, so the same typeface ships again as `brand-sans-image.ttf` (Geist Regular, from next/og's bundle in Next 16.3.8, 2026-10-04), read by `@pem/brand/image-font`; step 3 replaces both (batch review S2).
- **The OG image's inline styles carry one stated lint exception:** a file-level `eslint-disable no-restricted-syntax` with its reason, because next/og renders inline styles only and no preset token can reach the image. Colours and font come from `@pem/brand` (batch review nit 6).
- **Paths added before building:** both apps' `package.json` and `next.config.ts` (dependency and `transpilePackages`), `apps/docs/app/layout.tsx` (its title named the brand), the preset (the `--font-sans` token), `yarn.lock`, `tech-stack.md` and `codebase-conventions.md`. `apps/web/app/icon.svg` and `apps/web/public/**` were planned and not used.
- **`yarn.lock`'s `@pem/brand` entries were committed by the STK-11 thread** (59707f4), which shares this branch.
- **Two OKLCH converters now exist:** `@pem/brand/color` and `tooling/contrast-audit.ts` (STK-19). Packages cannot import `tooling/`, and moving the audit onto the package is outside this ticket.
- **The manifest's `background_color` is `primaryForeground` (light),** the lighter of the two brand colours, not the `--background` token (batch review nit 7); commented in `manifest.ts`.
- **The brand step's check skips `apps/web/app/page.tsx`,** the demo page that step 5 replaces (batch review S1).
- **`metadataBase` is `env.NEXT_PUBLIC_SITE_URL`,** so the OG URL follows the tier; `brand.urls` holds only fixed public addresses.
- **Proving:** the first `contract:run STK-7` failed C3 because `yarn verify`'s `check-specs` saw C1's and C2's logs rewritten in the same run before `results.json` was. C3 run alone passed.

## Not verified

- The OG image as a link preview on a real platform; only the built PNG was checked.
- The docs app in a browser: it builds with the font class and the icon, but no one has opened it.
- C2 proves less than it reads: probed on 2026-10-04, `yarn lint:boundaries` catches an upward import by relative path but not `import "@pem/db/client"` from `packages/ui` or `@pem/brand/brand` from `packages/env`, because the node resolver ignores `exports` (batch review finding 4). Repo-wide, not this ticket's code.
- Installability: the manifest's only icon is the SVG mark; no PNG or `apple-icon` is generated.

## Next

STK-8 builds the workshop on `@pem/brand` assets, and STK-15's email template reads `brand.ts`. Taylor agreed on 2026-10-04 that a later ticket generates PNG and `apple-icon` icons from the mark, so a product installs with its own icon; it needs a contract (`/tk-contract`). The boundaries lint fix (batch review finding 4) runs as its own task.
