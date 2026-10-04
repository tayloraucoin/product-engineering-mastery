# As-built — STK-7

## Shipped against the contract

- C1: `packages/brand/src/brand.ts` holds the name, short name, description, URLs, contact, asset paths and the two theme colours (`primary`, `primaryForeground`, light and dark, in OKLCH). `src/brand.test.ts` reads `@pem/config/tailwind/preset.css`, follows `var()` through the raw scale for `:root` and `.dark`, and requires each value to equal `--primary` and `--primary-foreground`. Two more tests change a preset raw step and a brand.ts value and expect a named mismatch; a fourth requires every asset path to exist. `packages/brand/turbo.json` adds the preset to the test's inputs, so a preset change is never a cache hit. `src/color.test.ts` covers the OKLCH to hex conversion. `yarn test` PASS, 47 tests.
- C2: `@pem/brand` sits beside `env` in `packages/config/eslint/boundaries.js` (may import `config`); apps import it through `APP_IMPORTS`. `yarn lint:boundaries` PASS.
- C3: `apps/web/app/manifest.ts`, `apps/web/app/opengraph-image.tsx`, both apps' `layout.tsx` metadata and `<html>` font class, and both apps' icon read `@pem/brand`. `yarn verify` PASS (run on its own, after the race noted below).
- C4: `evidence/og.png` is the built Open Graph image: the brand name and description in `primaryForeground` on `primary`. `evidence/manifest.webmanifest` is the built manifest: name, short name, description, `theme_color` `#171717` and `background_color` `#fafafa` (the light theme colours as hex) and the mark as its icon.
- Non-negotiables. Logos and the font are files in `packages/brand/assets/`. No brand string, hex or asset path remains in the manifest or either layout; there are no emails or stories yet (STK-15, STK-8). The font loads once per app, through `next/font/local`, in `@pem/brand/font`; the preset's `--font-sans` reads its `--font-brand-sans` variable, with the system stack as fallback. The guide's brand step (`docs/runbooks/new-project.md` step 3) edits `brand.ts` and `assets/`, and the two preset steps behind the colours (see Deviations). In the browser pane, `yarn web:dev` served the font, `/manifest.webmanifest` and the icon (`200 image/svg+xml`), with no console errors.

## Deviations

- **devs_call, settled: formats.** Logo and mark are SVG; the mark carries a `prefers-color-scheme` block so the favicon follows the colour scheme. The font is one variable woff2 file. Hex appears only inside the SVG files and as computed output.
- **devs_call, settled: icons.** `@pem/brand/icon` imports `assets/mark.svg` as a static asset; each app's bundler copies it and returns its hashed URL, which the layouts' `icons` and the manifest use. `apps/web/app/icon.svg` was tried as a symlink to the mark and Next 16.3.8 failed the build (`no direct app page entry found for /icon.svg`, 2026-10-04), so no `icon.svg` file exists and no copy can drift. No PNG icons are generated.
- **[ASSUMPTION] The brand step also edits the preset.** The non-negotiable says the step edits `brand.ts` and assets only; D-STK-9 keeps the colour tokens in `preset.css`, and an accepted decision outranks the contract. The step sets the colours in both files, and the test fails until they agree.
- **[ASSUMPTION] The two theme colours are `--primary` and `--primary-foreground`,** the pair the guide's briefing already asks for. The manifest uses the light values; the OG image draws `primaryForeground` on `primary`.
- **[ASSUMPTION] The placeholder font is Geist (latin, variable 400 to 600, SIL OFL 1.1),** copied from Next 16.3.8's own bundle with its licence from the Geist repository, both on 2026-10-04. It is canon A-01 if a product keeps it, so the briefing gains a "Typeface and its reason" input and step 3 says so. The file is named `brand-sans.woff2`, so a product replaces it without editing `font.ts`.
- **[ASSUMPTION] The OG image's layout values are constants outside the JSX,** because the image renderer reads only inline styles and no preset tokens; colours come from `@pem/brand`. The token lint bans literals inside `style={…}` only. Its font is next/og's built-in Geist Regular.
- **Paths added before building:** both apps' `package.json` and `next.config.ts` (dependency and `transpilePackages`), `apps/docs/app/layout.tsx` (its title named the brand), the preset (the `--font-sans` token), `yarn.lock`, `tech-stack.md` and `codebase-conventions.md`. `apps/web/app/icon.svg` and `apps/web/public/**` were planned and not used.
- **`yarn.lock`'s `@pem/brand` entries were committed by the STK-11 thread** (59707f4), which shares this branch.
- **Two OKLCH converters now exist:** `@pem/brand/color` and `tooling/contrast-audit.ts` (STK-19). Packages cannot import `tooling/`, and moving the audit onto the package is outside this ticket.
- **`metadataBase` is `env.NEXT_PUBLIC_SITE_URL`,** so the OG URL follows the tier; `brand.urls` holds only fixed public addresses.
- **Proving:** the first `contract:run STK-7` failed C3 because `yarn verify`'s `check-specs` saw C1's and C2's logs rewritten in the same run before `results.json` was. C3 run alone passed.

## Not verified

- The OG image as a link preview on a real platform; only the built PNG was checked.
- The docs app in a browser: it builds with the font class and the icon, but no one has opened it.

## Next

STK-8 builds the workshop on `@pem/brand` assets, and STK-15's email template reads `brand.ts`.
