/**
 * Token lint — canon C-P06 ("everything visual is a token"), rubric C-R08.
 *
 * Rejects raw design values in class strings and inline styles on product
 * surfaces: arbitrary Tailwind values holding a literal length, time or
 * curve, palette utilities that bypass the semantic tokens, raw hex or colour
 * functions (oklch, rgb, hsl, …), the default shadow scale (elevation is the
 * four named levels, CS-11), and raw durations or ease-in (motion comes from
 * the --motion-* tokens, CS-12).
 * The one home for raw values is packages/config/tailwind/preset.css.
 *
 * Each class is split into its variant prefix and its utility (CS-13): a
 * variant selector such as `data-[size=sm]:` or `has-[>svg]:` is a selector,
 * never a value, so only the utility after the last top-level `:` is judged.
 * An arbitrary value made of variables, `--spacing()`, keywords, `%`, `ch`,
 * `lh` or viewport units is structure, not a design value, and passes; one
 * holding px, rem, em, ms or s (the 1px and 2px hairlines aside) or a
 * cubic-bezier is rejected.
 *
 * Applied by apps/web and packages/ui. apps/docs is the toolkit's reader,
 * not a product surface (.claude/rules/ui.md).
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|placeholder|shadow";

const MESSAGES = {
  arbitrary:
    "Arbitrary value holds a raw length, time or curve — use a token (canon C-P06, rubric C-R08).",
  palette:
    "Palette utility bypasses the semantic color tokens — use a role token such as bg-primary (canon C-P05, C-P06).",
  hex: "Raw hex color — colors live only in packages/config/tailwind/preset.css (canon C-P06).",
  colorName:
    "Raw colour name — colors live only in packages/config/tailwind/preset.css; use a role token such as bg-primary (canon C-P06).",
  fontFamily:
    "Raw font family — the typeface comes from the font token, as font-sans (canon C-P06).",
  colorFunction:
    "Raw color function — colors live only in packages/config/tailwind/preset.css (canon C-P06).",
  shadow:
    "Default shadow scale — elevation is shadow-resting, -raised, -overlay or -modal (canon C-P06, rubric C-R07, CS-11).",
  duration:
    "Raw duration — use a motion token, as duration-(--motion-duration-base) (canon C-P11, rubric C-R12, CS-12).",
  easeIn: "ease-in is banned; enter and exit use ease-out (canon C-P11).",
  inlineStyle:
    "Inline style value bypasses tokens — use a token class or a CSS variable from the preset (canon C-P06).",
};

const PALETTE_RE = new RegExp(
  String.raw`^-?(${COLOR_UTILITIES})-((${PALETTE})-\d{2,3}|black|white)\b`,
);
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FUNCTION_RE = /\b(oklch|oklab|lch|lab|rgba?|hsla?|hwb|color)\(/;
const SHADOW_RE = /^shadow-(2xs|xs|sm|md|lg|xl|2xl|inner)\b/;
const DURATION_RE = /^(duration|delay)-\d+\b/;
const EASE_IN_RE = /^ease-in(?!-out)\b/;
/** A length or time literal, in any case; Tailwind's `_` (a space) is read as a space first. */
const LITERAL_UNIT_RE =
  /(?<![\w.-])-?(?:\d*\.)?\d+(?:px|rem|em|ms|s|pt|pc|in|cm|mm|q)(?![\w-])/gi;
const HAIRLINE_RE = /^-?[12]px$/i;
/** Zero in any unit (a fallback such as var(--x, 0px)) is not a design value. */
const ZERO_RE = /^-?0*\.?0+[a-z]+$/i;
/** A colour utility whose arbitrary value is a bare word: a CSS colour name. */
const COLOR_NAME_RE = new RegExp(
  String.raw`^-?(${COLOR_UTILITIES})-\[([a-z]+)\]`,
  "i",
);
const COLOR_KEYWORDS = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "none",
]);
/** A font family in an arbitrary value: anything but a variable or a weight. */
const FONT_FAMILY_RE = /^font-\[(?!var\(|--|\d+\])/;

/** The utility of one class: what follows the last `:` outside brackets. */
export function utilityOf(token) {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    else if (ch === ":" && depth === 0) last = i;
  }
  return token.slice(last + 1).replace(/^!/, "");
}

/** Whether an arbitrary value's brackets hold a raw design value. */
function rawArbitrary(utility) {
  const open = utility.indexOf("[");
  if (open === -1) return false;
  const inner = utility
    .slice(open + 1, utility.lastIndexOf("]"))
    .replaceAll("_", " ");
  if (/cubic-bezier\(/.test(inner)) return true;
  return [...inner.matchAll(LITERAL_UNIT_RE)].some(
    (match) => !HAIRLINE_RE.test(match[0]) && !ZERO_RE.test(match[0]),
  );
}

/** The message ids a class string breaks, one per offending class. */
export function classProblems(value) {
  const problems = [];
  if (HEX_RE.test(value)) problems.push("hex");
  if (COLOR_FUNCTION_RE.test(value)) problems.push("colorFunction");
  for (const token of value.split(/\s+/).filter(Boolean)) {
    const utility = utilityOf(token);
    if (rawArbitrary(utility)) problems.push("arbitrary");
    const colorName = COLOR_NAME_RE.exec(utility)?.[2];
    if (colorName && !COLOR_KEYWORDS.has(colorName.toLowerCase()))
      problems.push("colorName");
    if (FONT_FAMILY_RE.test(utility)) problems.push("fontFamily");
    if (PALETTE_RE.test(utility)) problems.push("palette");
    if (SHADOW_RE.test(utility)) problems.push("shadow");
    if (DURATION_RE.test(utility)) problems.push("duration");
    if (EASE_IN_RE.test(utility)) problems.push("easeIn");
  }
  return [...new Set(problems)];
}

/**
 * Where class strings live. className matches only its direct string or
 * template; a literal inside cn() inside className is reported once.
 */
const CLASS_CALL = "CallExpression[callee.name=/^(cn|cva|clsx|twMerge)$/]";
const CONTEXTS = [
  "JSXAttribute[name.name='className'] > Literal",
  "JSXAttribute[name.name='className'] > JSXExpressionContainer > Literal",
  "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral > TemplateElement",
  `${CLASS_CALL} Literal`,
  `${CLASS_CALL} TemplateElement`,
];

/** @type {import("eslint").Rule.RuleModule} */
const noRawValues = {
  meta: { type: "problem", messages: MESSAGES, schema: [] },
  create(context) {
    const seen = new WeakSet();
    const check = (node) => {
      if (seen.has(node)) return;
      seen.add(node);
      const value =
        node.type === "TemplateElement" ? node.value.raw : node.value;
      if (typeof value !== "string") return;
      for (const messageId of classProblems(value))
        context.report({ node, messageId });
    };
    return {
      ...Object.fromEntries(CONTEXTS.map((selector) => [selector, check])),
      // A literal value in a style object; a key such as "--ratio" set from a variable is not one.
      "JSXAttribute[name.name='style'] Property"(node) {
        if (node.value.type === "Literal")
          context.report({ node: node.value, messageId: "inlineStyle" });
      },
    };
  },
};

/**
 * The plugin, exported so a config that never runs the rule (the root
 * boundaries pass) can still load it and read a waiver that names it.
 */
export const tokensPlugin = { rules: { "no-raw-values": noRawValues } };

/** @type {import("eslint").Linter.Config[]} */
export const tokensConfig = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "pem-tokens": tokensPlugin },
    rules: {
      "pem-tokens/no-raw-values": "error",
    },
  },
];
