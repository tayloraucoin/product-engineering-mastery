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
  colorFunction:
    "Raw color function — colors live only in packages/config/tailwind/preset.css (canon C-P06).",
  shadow:
    "Default shadow scale — elevation is shadow-control, -raised, -overlay or -floating (canon C-P06, rubric C-R07, CS-11).",
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
const LITERAL_UNIT_RE = /(?<![\w.-])-?(?:\d*\.)?\d+(?:px|rem|em|ms|s)\b/g;
const HAIRLINE_RE = /^-?[12]px$/;

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
  const inner = utility.slice(open + 1, utility.lastIndexOf("]"));
  if (/cubic-bezier\(/.test(inner)) return true;
  return [...inner.matchAll(LITERAL_UNIT_RE)].some(
    (match) => !HAIRLINE_RE.test(match[0]),
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
      "JSXAttribute[name.name='style'] Property > Literal"(node) {
        context.report({ node, messageId: "inlineStyle" });
      },
    };
  },
};

/** @type {import("eslint").Linter.Config[]} */
export const tokensConfig = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "pem-tokens": { rules: { "no-raw-values": noRawValues } } },
    rules: {
      "pem-tokens/no-raw-values": "error",
    },
  },
];
