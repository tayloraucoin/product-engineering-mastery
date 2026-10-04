/**
 * Token lint — canon C-P06 ("everything visual is a token"), rubric C-R08.
 *
 * Rejects raw design values in class strings and inline styles on product
 * surfaces: arbitrary Tailwind values, palette utilities that bypass the
 * semantic tokens, raw hex or colour functions (oklch, rgb, hsl, …), the
 * default shadow scale (elevation is a token scale), and raw durations or
 * ease-in (motion comes from motion tokens).
 * The one home for raw values is packages/config/tailwind/preset.css.
 *
 * Applied by apps/web and packages/ui. apps/docs is the toolkit's reader,
 * not a product surface (.claude/rules/ui.md).
 */

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|placeholder|shadow";

/** Each rule: a regex over a class string, and the message that cites the canon. */
const RULES = [
  {
    pattern: String.raw`(^|\s)[\w:/.-]*-\[[^\]]+\]`,
    message: "Arbitrary Tailwind value — use a token (canon C-P06, rubric C-R08).",
  },
  {
    pattern: String.raw`(^|[\s:])(${COLOR_UTILITIES})-((${PALETTE})-\d{2,3}|black|white)\b`,
    message: "Palette utility bypasses the semantic color tokens — use a role token such as bg-primary (canon C-P05, C-P06).",
  },
  {
    pattern: String.raw`#[0-9a-fA-F]{3,8}\b`,
    message: "Raw hex color — colors live only in packages/config/tailwind/preset.css (canon C-P06).",
  },
  {
    pattern: String.raw`\b(oklch|oklab|lch|lab|rgba?|hsla?|hwb|color)\(`,
    message: "Raw color function — colors live only in packages/config/tailwind/preset.css (canon C-P06).",
  },
  {
    pattern: String.raw`(^|[\s:])shadow-(sm|md|lg|xl|2xl|inner)\b`,
    message: "Default shadow scale — elevation comes from the named levels in tokens (canon C-P06, rubric C-R07).",
  },
  {
    pattern: String.raw`(^|[\s:])(duration|delay)-\d+\b`,
    message: "Raw duration — durations come from motion tokens (canon C-P11, rubric C-R12).",
  },
  {
    pattern: String.raw`(^|[\s:])ease-in(?!-out)\b`,
    message: "ease-in is banned; enter and exit use ease-out (canon C-P11).",
  },
];

/**
 * Where class strings live. className matches only its direct string or
 * template, so a literal inside cn() inside className is reported once.
 */
const LITERAL_CONTEXTS = [
  "JSXAttribute[name.name='className'] > Literal",
  "JSXAttribute[name.name='className'] > JSXExpressionContainer > Literal",
  "CallExpression[callee.name=/^(cn|cva|clsx|twMerge)$/] Literal",
];
const TEMPLATE_CONTEXTS = [
  "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral > TemplateElement",
  "CallExpression[callee.name=/^(cn|cva|clsx|twMerge)$/] TemplateElement",
];

const syntax = RULES.flatMap(({ pattern, message }) => [
  ...LITERAL_CONTEXTS.map((context) => ({ selector: `${context}[value=/${pattern}/]`, message })),
  ...TEMPLATE_CONTEXTS.map((context) => ({ selector: `${context}[value.raw=/${pattern}/]`, message })),
]);

syntax.push({
  selector: "JSXAttribute[name.name='style'] Property > Literal",
  message: "Inline style value bypasses tokens — use a token class or a CSS variable from the preset (canon C-P06).",
});

/** @type {import("eslint").Linter.Config[]} */
export const tokensConfig = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...syntax],
    },
  },
];
