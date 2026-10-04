import localFont from "next/font/local";

/**
 * The brand font, from this package's own file (brand.assets.font). Each app's
 * root layout puts `brandSans.variable` on <html> once; the preset's
 * `--font-sans` reads `--font-brand-sans`, so every utility follows it.
 * next/font needs the path as a literal, so it is written here, not read from
 * brand.ts. A product replaces the file under the same name; `weight` is the
 * variable font's range, and a static font lists its files instead.
 *
 * Placeholder: Geist (latin subset, variable 400 to 600, SIL OFL 1.1; licence
 * beside the file), copied from Next 16.3.8's own bundle on 2026-10-04.
 */
export const brandSans = localFont({
  src: "../assets/fonts/brand-sans.woff2",
  weight: "400 600",
  display: "swap",
  variable: "--font-brand-sans",
});
