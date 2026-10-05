---
title: New project — branding, the files a brand lands in and the prompt for its thread
description: Open from step 3 or step 7 of the new-project guide. Holds the one table of files a brand must fill (words, logo, typeface, colour tokens, the product design layer) with the check each must pass, and the prompt printed for a separate branding thread when no brand material exists yet.
layer: runbooks
status: draft
thread: "PEM"
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when:
---

# Branding

> **Two readers.** The set-up thread fills the table itself when the operator attached complete brand material (step 3 of [`README.md`](README.md)). Otherwise it prints the prompt below at step 7, and a separate thread makes the brand and then fills the same table.
> **Support:** Hearth for what the brand is, Plumb for every token ruling, Gloss for the voice, Turner for the files.
> **Source.** The branding interview below is this guide's own. If the operator supplies a written branding process, that file is the source for the interview and this one keeps only the table.

## What the system expects

Colour, type and brand words each have one home. A value written anywhere else is a defect the checks catch.

- **Every raw colour value lives in `packages/config/tailwind/preset.css`**, in its first layer, the raw scale. Its second layer gives each role (`--background`, `--primary`, `--muted-foreground` and the rest) a raw step, once under `:root` for light and once under `.dark`. Its third layer exposes the roles to Tailwind and is not edited for a brand.
- **Colours are written in OKLCH.** A hex value from a brand guide is converted, and the conversion is checked by eye in both themes.
- **Two colours are mirrored**: `--primary` and `--primary-foreground`, light and dark, are repeated in `packages/brand/src/brand.ts` for the manifest and the social image. The brand package's test fails while the two files disagree.
- **Every text pair meets 4.5:1 and the focus ring 3:1**, in both themes. `yarn contrast-audit` reads the token file and fails on a pair that falls short. A failing pair is fixed by changing the raw step's lightness.
- **One typeface file feeds everything**: `packages/brand/src/font.ts` loads it and each app's layout puts it on the page. A product replaces the file and keeps its name.
- **Components never name a colour, a size or a shadow directly.** The token lint rejects it. A brand changes what the tokens hold, never the components.
- **The placeholder is a tell.** The starter's grey scale and its Geist typeface are neutral on purpose; shipping them is canon A-01, the default-typeface tell.

## The files a brand lands in

Fill in this order. Each row ends on a check.

| #   | File                                                                                                                          | What goes in it                                                                                                                                                                             | Check                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | `packages/brand/src/brand.ts`                                                                                                 | `name`, `shortName`, `description`, `urls`, `contact`. The site address per tier is not here; it is an environment variable.                                                                | `yarn check-types`                                     |
| 2   | `packages/brand/assets/logo.svg`, `packages/brand/assets/mark.svg`                                                            | The logo and the square mark, under the same file names. The mark is each app's icon.                                                                                                       | `yarn test` (every asset path has a file)              |
| 3   | `packages/brand/assets/fonts/brand-sans.woff2` and `LICENSE.txt` beside it                                                    | The typeface, as a variable font covering weights 400 to 600, with its licence. A static family instead lists its files in `packages/brand/src/font.ts`, which also holds the weight range. | `yarn build`                                           |
| 4   | `packages/brand/assets/fonts/brand-sans-image.ttf`                                                                            | The same typeface's regular weight as TTF, OTF or WOFF, under the same file name. The social image is drawn with it and cannot read `woff2`.                                                | `yarn build`                                           |
| 5   | `packages/config/tailwind/preset.css`, layer 1                                                                                | The brand's raw steps, for example `--brand-500`, and its neutral ramp if the brand's greys are warm or cool rather than pure                                                               | —                                                      |
| 6   | The same file, layer 2, both blocks                                                                                           | `--primary` and `--primary-foreground` pointed at the brand steps, light and dark. Any other role the brand changes (the ring, the sidebar, the charts), each in both blocks.               | `yarn contrast-audit`                                  |
| 7   | `packages/brand/src/brand.ts`, `theme`                                                                                        | The same four values as row 6, written out                                                                                                                                                  | `yarn test`                                            |
| 8   | `apps/web/docs/design/DESIGN.md`, from [`DESIGN.template.md`](../../design/templates/DESIGN.template.md)                      | The product in one sentence, its own principles, type, colour, density, voice and motion, as differences from the canon and never a restatement. About 600 tokens.                          | `yarn budget`                                          |
| 9   | `apps/web/docs/design/tokens.md`, from [`tokens.template.md`](../../design/templates/tokens.template.md)                      | Each token's role and reason: the colour roles with their contrast, the type styles, spacing, radius, elevation. Values stay in code.                                                       | Read against row 6: every role named here exists there |
| 10  | `apps/web/docs/design/anti-patterns.md`, from [`anti-patterns.template.md`](../../design/templates/anti-patterns.template.md) | Only when the brand names something it never does, beyond the canon's twenty                                                                                                                | —                                                      |

Left for later threads, by design: `components.md` belongs to the components thread ([`components.md`](components.md)); `states.md` and `coverage-gaps.md` start with the first surface.

**What has no home yet.** The token file holds colour, radius, elevation and motion. It has no named text styles and no spacing scale of the product's own. A brand's type scale is therefore recorded in rows 8 and 9 and applied through the typeface and its weights; a new token role is not invented in a branding thread. It is written into the product's `coverage-gaps.md` for Plumb to rule on.

**Proof for the whole table:** `yarn test`, `yarn contrast-audit`, `yarn lint` and `yarn build` exit 0, then `yarn verify`. Then look: `yarn ui:storybook`, one page of controls and one of text, in light and in dark, and the social image at the web app's `/opengraph-image` route.

## The prompt for a branding thread

Print this block whole. Fill the angle brackets from the interview before printing.

```text
Venue: Claude Code, in <the new repo's folder>, on the branch that is checked out.
Model: the deepest available (Fable 5.1 today). A smaller model picks safe defaults and the result looks like every other product.

Role: Hearth (brand strategist) leads. Support: Plumb rules on every token, Gloss owns the voice, Turner writes the files.

Context. <Product> was started from the product-engineering toolkit. Its brand is still the starter's placeholder: a grey scale and the Geist typeface. Your job is to settle the brand with me, then land it in the files the system reads, so that every component picks it up without being touched.

Read first: docs/runbooks/new-project/branding.md (the files and the checks; it is your contract), docs/design/canon.md, docs/design/templates/DESIGN.template.md and tokens.template.md, packages/config/tailwind/preset.css, packages/brand/src/brand.ts and font.ts.

What exists: <"nothing" / the name and these colours / the attachments, each named with what to take from it>.

Interview me first, with the question tool, options with your recommendation first, in as many rounds as it takes. Do not write a file until I have confirmed a summary. Cover at least:
1. Who the product is for, and the one feeling it should leave. Offer three directions that differ on one named axis, each as two sentences and three adjectives.
2. Products or brands I want to sit near, and ones I want to be told apart from. For each, the one thing to take and the one to ignore.
3. Colour: a primary colour and the text colour on it, for light and for dark. Show each candidate as its OKLCH value with its contrast ratio on the background and under white and dark text. Whether the greys are pure, warm or cool.
4. Type: one typeface for the interface, and the reason it is not the default. It must be a file we may ship, as a variable font covering weights 400 to 600, with a regular weight available as TTF or OTF. Name the licence.
5. The logo: do I have one, should you draft a wordmark and a square mark as SVG for now, or is a designer making it? A drafted mark is a placeholder and you say so.
6. Voice: three things the product says and three it never says. What the brand never does visually.
7. Dark mode: both themes from day one (the system's default), or one first.

Then produce every row of "The files a brand lands in", in its order, running each row's check before the next. Colours are OKLCH and live only in the token file; the two primary colours are mirrored in brand.ts. Change no component. Do not add a token role the file does not have: write the need into the product's coverage-gaps.md.

Boundaries: only the files in that table, plus coverage-gaps.md. No new dependency. Never push. Commit as "<work-id>: brand".

Done when: yarn test, yarn contrast-audit, yarn lint and yarn build pass, then one yarn verify; you have opened the component workshop and looked at controls and text in light and dark; and your report, six lines at most, lists the contrast ratio of each text pair, any drafted asset that is a placeholder, and each decision that waits for me.
```

## After the branding thread

The components thread ([`components.md`](components.md)) checks the kit against the brand as its last step. If it runs before the brand is settled, it prints the prompt above instead.
