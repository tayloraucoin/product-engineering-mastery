/**
 * yarn contrast-audit (STK-19, D-STK-19): checks the preset's token pairs
 * against WCAG 2.2 AA, in both themes, and exits 1 when any pair falls short.
 *
 *   node tooling/contrast-audit.ts [preset.css]
 *
 * Reads every `:root` block as the light theme and layers `.dark` over it for
 * the dark theme, follows `var()` references, and converts `oklch()`, `rgb()`
 * and hex values to sRGB. Text pairs need 4.5:1 (SC 1.4.3); the focus ring
 * needs 3:1 against the surfaces it is drawn on (SC 1.4.11). The `--border`
 * role is decorative and is not audited; `--input`, a control's boundary, is.
 *
 * A product that adds a semantic token, or puts text on a new surface, adds
 * the pair to PAIRS. A failing pair is fixed in preset.css by changing the raw
 * step's lightness, never by dropping the pair.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./lib/docs.ts";

const TEXT = 4.5;
const NON_TEXT = 3;

/**
 * `tint` paints `bg` at that opacity over `--background`, as a `bg-x/10`
 * class does (CAT batch review B4); `themes` limits a pair to the themes
 * whose classes use that tint.
 */
type Pair = {
  fg: string;
  bg: string;
  min: number;
  use: string;
  tint?: number;
  themes?: Array<"light" | "dark">;
};

const PAIRS: Pair[] = [
  { fg: "--foreground", bg: "--background", min: TEXT, use: "body text" },
  {
    fg: "--foreground",
    bg: "--muted",
    min: TEXT,
    use: "text on a muted panel",
  },
  {
    fg: "--muted-foreground",
    bg: "--background",
    min: TEXT,
    use: "muted text",
  },
  {
    fg: "--muted-foreground",
    bg: "--muted",
    min: TEXT,
    use: "muted text on a muted panel",
  },
  {
    fg: "--muted-foreground",
    bg: "--accent",
    min: TEXT,
    use: "muted text on a hovered row",
  },
  {
    fg: "--primary-foreground",
    bg: "--primary",
    min: TEXT,
    use: "primary button label",
  },
  {
    fg: "--accent-foreground",
    bg: "--accent",
    min: TEXT,
    use: "selected or hovered label",
  },
  // CAT-2: the surfaces and roles shadcn's Vega style puts text on.
  { fg: "--card-foreground", bg: "--card", min: TEXT, use: "text on a card" },
  {
    fg: "--muted-foreground",
    bg: "--card",
    min: TEXT,
    use: "a card's description",
  },
  {
    fg: "--popover-foreground",
    bg: "--popover",
    min: TEXT,
    use: "a menu or popover item",
  },
  {
    fg: "--muted-foreground",
    bg: "--popover",
    min: TEXT,
    use: "a menu shortcut or hint",
  },
  {
    fg: "--secondary-foreground",
    bg: "--secondary",
    min: TEXT,
    use: "secondary button label",
  },
  {
    fg: "--destructive",
    bg: "--background",
    min: TEXT,
    use: "destructive text and error messages",
  },
  {
    fg: "--destructive",
    bg: "--popover",
    min: TEXT,
    use: "a destructive menu item",
  },
  {
    fg: "--sidebar-foreground",
    bg: "--sidebar",
    min: TEXT,
    use: "sidebar text",
  },
  {
    fg: "--sidebar-accent-foreground",
    bg: "--sidebar-accent",
    min: TEXT,
    use: "the active sidebar item",
  },
  {
    fg: "--sidebar-primary-foreground",
    bg: "--sidebar-primary",
    min: TEXT,
    use: "a sidebar's primary mark",
  },
  // The destructive Button: its label on its own tint, at rest and on hover.
  {
    fg: "--destructive",
    bg: "--destructive",
    tint: 0.1,
    themes: ["light"],
    min: TEXT,
    use: "destructive button label",
  },
  {
    fg: "--destructive",
    bg: "--destructive",
    tint: 0.2,
    themes: ["light"],
    min: TEXT,
    use: "destructive button label, hovered",
  },
  {
    fg: "--destructive",
    bg: "--destructive",
    tint: 0.2,
    themes: ["dark"],
    min: TEXT,
    use: "destructive button label",
  },
  {
    fg: "--destructive",
    bg: "--destructive",
    tint: 0.3,
    themes: ["dark"],
    min: TEXT,
    use: "destructive button label, hovered",
  },
  // CAT-5: a checkbox, radio or switch is found by its `--input` boundary alone (WCAG 1.4.11).
  {
    fg: "--input",
    bg: "--background",
    min: NON_TEXT,
    use: "a control's boundary",
  },
  // Focus changes a control's boundary from --input to --ring: the change itself must show.
  {
    fg: "--ring",
    bg: "--input",
    min: NON_TEXT,
    use: "a focused control's boundary against its resting one",
  },
  // A pressed toggle's fill against the page (CAT-5 review B4).
  {
    fg: "--primary",
    bg: "--background",
    min: NON_TEXT,
    use: "a pressed toggle's fill",
  },
  // Dark fields fill with --muted at half opacity; their placeholder sits on it.
  {
    fg: "--muted-foreground",
    bg: "--muted",
    tint: 0.5,
    themes: ["dark"],
    min: TEXT,
    use: "a placeholder in a dark field",
  },
  { fg: "--ring", bg: "--background", min: NON_TEXT, use: "focus ring" },
  {
    fg: "--ring",
    bg: "--muted",
    min: NON_TEXT,
    use: "focus ring on a muted panel",
  },
];

type Rgba = { r: number; g: number; b: number; a: number };
type Vars = Record<string, string>;

/** Collects the custom properties of every block whose selector is exactly `selector`. */
function readBlocks(css: string, selector: string): Vars {
  const vars: Vars = {};
  const uncommented = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blockRe = /([^{};]+)\{([^{}]*)\}/g;
  for (const block of uncommented.matchAll(blockRe)) {
    if (block[1]!.trim() !== selector) continue;
    for (const decl of block[2]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      vars[decl[1]!] = decl[2]!.trim();
    }
  }
  return vars;
}

function resolveVar(value: string, vars: Vars, depth = 0): string | null {
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (!ref) return value;
  const next = vars[ref[1]!];
  if (next === undefined || depth > 20) return null;
  return resolveVar(next, vars, depth + 1);
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** sRGB-encoded channel (0 to 1) to linear light. */
const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** Linear light to an sRGB-encoded channel (0 to 1). */
const toEncoded = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;

/** Number or percentage, scaled so 100% is `full`. */
function amount(token: string, full: number): number {
  return token.endsWith("%")
    ? (Number.parseFloat(token) / 100) * full
    : Number.parseFloat(token);
}

/**
 * Parses a colour into sRGB-encoded channels (0 to 1), the space browsers
 * composite in, or null when it is not one this audit reads.
 */
function parseColor(raw: string): Rgba | null {
  const value = raw.trim().toLowerCase();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits =
      hex[1]!.length === 3
        ? [...hex[1]!].map((d) => d + d)
        : hex[1]!.match(/../g)!;
    const [r, g, b] = digits.map((d) => Number.parseInt(d, 16) / 255);
    return { r: r!, g: g!, b: b!, a: 1 };
  }

  const fn = value.match(/^(oklch|rgba?)\(([^)]+)\)$/);
  if (!fn) return null;
  const [channels, alphaPart] = fn[2]!.split("/");
  const parts = channels!.trim().split(/[\s,]+/);
  const commaAlpha =
    fn[1] !== "oklch" && parts.length === 4 ? parts.pop() : undefined;
  if (parts.length !== 3) return null;
  const alphaToken = alphaPart?.trim() ?? commaAlpha;
  const a = alphaToken === undefined ? 1 : amount(alphaToken, 1);

  if (fn[1] === "oklch") {
    const L = amount(parts[0]!, 1);
    const C = amount(parts[1]!, 0.4);
    const h = (Number.parseFloat(parts[2]!) * Math.PI) / 180;
    const A = C * Math.cos(Number.isNaN(h) ? 0 : h);
    const B = C * Math.sin(Number.isNaN(h) ? 0 : h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return {
      r: toEncoded(
        clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      ),
      g: toEncoded(
        clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      ),
      b: toEncoded(
        clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
      ),
      a,
    };
  }

  const [r, g, b] = parts.map((p) => clamp(amount(p, 255) / 255));
  return { r: r!, g: g!, b: b!, a };
}

const luminance = ({ r, g, b }: Rgba) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

/** `top` at opacity `alpha` over `under`, in encoded sRGB as browsers blend. */
function over(top: Rgba, under: Rgba, alpha: number): Rgba {
  return {
    r: top.r * alpha + under.r * (1 - alpha),
    g: top.g * alpha + under.g * (1 - alpha),
    b: top.b * alpha + under.b * (1 - alpha),
    a: 1,
  };
}

/** A see-through foreground is composited over the surface first, in encoded sRGB as browsers do. */
function contrastRatio(fg: Rgba, bg: Rgba): number {
  const top = { ...bg };
  for (const k of ["r", "g", "b"] as const) {
    top[k] = fg[k] * fg.a + bg[k] * (1 - fg.a);
  }
  const [hi, lo] = [luminance(top), luminance(bg)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

function main(): void {
  const presetPath = path.resolve(
    process.argv[2] ??
      path.join(REPO_ROOT, "packages/config/tailwind/preset.css"),
  );
  const css = readFileSync(presetPath, "utf8");
  const light = readBlocks(css, ":root");
  const themes: Array<[string, Vars]> = [
    ["light", light],
    ["dark", { ...light, ...readBlocks(css, ".dark") }],
  ];

  const failures: string[] = [];
  let total = 0;
  for (const [theme, vars] of themes) {
    for (const pair of PAIRS) {
      if (pair.themes && !pair.themes.includes(theme as "light" | "dark"))
        continue;
      total++;
      const bgName = pair.tint
        ? `${pair.bg}/${Math.round(pair.tint * 100)}`
        : pair.bg;
      const label = `${theme} ${pair.fg} on ${bgName} (${pair.use})`;
      const fgValue = vars[pair.fg] && resolveVar(vars[pair.fg]!, vars);
      const bgValue = vars[pair.bg] && resolveVar(vars[pair.bg]!, vars);
      const surfaceValue =
        vars["--background"] && resolveVar(vars["--background"]!, vars);
      const fg = fgValue ? parseColor(fgValue) : null;
      const solid = bgValue ? parseColor(bgValue) : null;
      const surface = surfaceValue ? parseColor(surfaceValue) : null;
      const bg =
        pair.tint && solid && surface ? over(solid, surface, pair.tint) : solid;
      if (!fg || !bg || bg.a !== 1) {
        failures.push(
          `${label}: unresolved (${fgValue ?? "missing"} on ${bgValue ?? "missing"})`,
        );
        console.log(
          `ERROR ${label}: cannot resolve both colours to opaque sRGB`,
        );
        continue;
      }
      const ratio = contrastRatio(fg, bg);
      const pass = ratio >= pair.min;
      console.log(
        `${pass ? "PASS " : "FAIL "} ${label}: ${ratio.toFixed(2)}:1, needs ${pair.min}:1`,
      );
      if (!pass)
        failures.push(`${label}: ${ratio.toFixed(2)}:1, needs ${pair.min}:1`);
    }
  }

  if (failures.length > 0) {
    console.error(
      `\ncontrast-audit: ${failures.length} of ${total} pairs in ${path.relative(REPO_ROOT, presetPath)} fail WCAG 2.2 AA. Change the raw step's lightness in the preset:`,
    );
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`\ncontrast-audit: all ${total} pairs pass WCAG 2.2 AA.`);
}

main();
