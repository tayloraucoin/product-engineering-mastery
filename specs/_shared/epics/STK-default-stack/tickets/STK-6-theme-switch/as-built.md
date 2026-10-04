# As-built — STK-6

## Shipped against the contract

- C1: `packages/config/tailwind/preset.css` holds three layers: a raw neutral scale (`--neutral-0` to `--neutral-950`), semantic names on `:root` with their dark values under `.dark`, and the `@theme inline` bridge that exposes the semantic names to Tailwind. `@custom-variant dark` reads the class; the `prefers-color-scheme` block is gone. `packages/config/eslint/tokens.js` now also rejects colour functions (`oklch(`, `rgb(` and the rest) outside the preset; `yarn lint` passes.
- C2: `ThemeProvider` (`@pem/ui/theme`) is mounted inside `<body>` of both apps' root layouts, with `suppressHydrationWarning` on `<html>`; types and build pass for both. The criterion is `yarn verify`, run once at batch close.
- C3, C4: the demo home captured in dark and in light, each switched through the toggle (`evidence/dark.png`, `evidence/light.png`).
- C5: `evidence/C5.md`: the class-only CSS, next-themes' blocking script ahead of all content, and the render-blocking stylesheet; after a reload with dark stored, the page is dark whether the system says dark or light.
- C6: `ThemeToggle` (`@pem/ui/theme-toggle`) is one radio group of light, dark and system: one tab stop, arrow keys, Home and End, and a visible focus ring (`evidence/toggle-states.png`). It sits in the demo home's header.

## Deviations

- **devs_call, settled:** the toggle sits in a header in `apps/web/app/layout.tsx`, top right; the raw scale is named `--neutral-<step>` on Tailwind's step numbers.
- **The toggle's labels pass 4.5:1 in light mode** after a fix (`0c2605e`): the track sits on the background and the selection on the accent surface.
- **next-themes 0.4.6, exact and unpatched** (verified 2026-10-03), recorded in `tech-stack.md` per D-STK-17.
- **C3 to C6 were re-recorded at batch close without retaking the images.** They went stale only because `tech-stack.md` and `yarn.lock` changed (STK-9's rows and lockfile range merges). No version changed and no UI file changed since the captures (`git diff 930129e HEAD` over the preset, `packages/ui`, both apps' `app/` and `tokens.js` is empty).
- [ASSUMPTION] The docs app mounts the provider but shows no toggle; the contract asks for the toggle only on the demo home.

## Not verified

- C5 is a reading of the mechanism and post-load DOM, not a frame-by-frame watch: nobody watched a throttled hard reload.
- The toggle's stories land in STK-8 (its non-negotiable 4).

## Next

STK-7 sets brand colours on the same three layers; STK-8 adds one story per toggle state.
