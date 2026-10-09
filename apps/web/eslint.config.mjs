import { nextJsConfig } from "@pem/config/eslint/next-js";
import { tokensConfig } from "@pem/config/eslint/tokens";

/** WEB-15: the sandbox slug check exists once; a copy drifts from the column. */
const SLUG_COPY =
  "The sandbox slug check lives in lib/sandbox/shared/slug.ts: call isSandboxSlug or use SANDBOX_SLUG.";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  ...tokensConfig,
  {
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
];
