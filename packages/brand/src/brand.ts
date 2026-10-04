/**
 * The brand's one source (D-STK-9): name, URLs, contact, asset paths and the
 * two theme colours. The manifest, metadata, Open Graph image, emails and
 * stories read it; none of them writes a brand value of its own.
 *
 * Placeholder values. A product sets its own in the new-project guide's
 * brand step, which edits this file and `assets/` (docs/runbooks/new-project.md).
 *
 * The theme colours mirror `--primary` and `--primary-foreground` in
 * `packages/config/tailwind/preset.css`, which stays the home of every colour
 * token. `brand.test.ts` fails when the two disagree.
 */

export const brand = {
  name: "Product Engineering Mastery",
  shortName: "PEM",
  description:
    "A product-engineering toolkit, and the demo app that proves it.",

  /** Fixed public addresses. The tiered site URL is the app's env.ts, never here. */
  urls: {
    home: "https://example.com",
    support: "https://example.com/support",
  },

  contact: {
    email: "hello@example.com",
    support: "support@example.com",
  },

  /**
   * Files in this package, relative to its root, served as `@pem/brand/assets/*`.
   * `@pem/brand/font` and `@pem/brand/image-font` load the font and
   * `@pem/brand/icon` serves the mark;
   * each needs its path as a literal, so each writes it once more.
   */
  assets: {
    logo: "assets/logo.svg",
    mark: "assets/mark.svg",
    font: "assets/fonts/brand-sans.woff2",
    imageFont: "assets/fonts/brand-sans-image.ttf",
  },

  /** The two theme colours, per colour scheme, in the preset's own OKLCH. */
  theme: {
    primary: {
      light: "oklch(0.205 0 0)",
      dark: "oklch(0.922 0 0)",
    },
    primaryForeground: {
      light: "oklch(0.985 0 0)",
      dark: "oklch(0.205 0 0)",
    },
  },
} as const;

export type Brand = typeof brand;
export type ThemeColour = keyof Brand["theme"];
