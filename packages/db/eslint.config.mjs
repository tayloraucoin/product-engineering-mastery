import { config } from "@pem/config/eslint/base";

/** WEB-15: the sandbox slug check exists once; a copy drifts from the column. */
const SLUG_COPY =
  "The sandbox slug check lives in src/sandbox/slug.ts: call isSandboxSlug or use SANDBOX_SLUG.";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["migrations/**"],
  },
  {
    // The pattern's one home is the column; slug.ts builds the check from it.
    ignores: ["src/schema/sandbox/columns.ts", "src/sandbox/slug.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'Literal[regex.pattern="^[a-z0-9]+(-[a-z0-9]+)*$"]',
          message: SLUG_COPY,
        },
        {
          selector: 'Literal[value="^[a-z0-9]+(-[a-z0-9]+)*$"]',
          message: SLUG_COPY,
        },
        {
          selector:
            'NewExpression[callee.name="RegExp"][arguments.0.name="SANDBOX_SLUG_PATTERN"]',
          message: SLUG_COPY,
        },
      ],
    },
  },
  {
    // One reader per workspace: scripts/env.ts reads process.env and hands the
    // values on (codebase-conventions §5; D-STK-3).
    ignores: ["scripts/env.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/db reads process.env only in scripts/env.ts; take the value as an argument.",
        },
      ],
    },
  },
];
