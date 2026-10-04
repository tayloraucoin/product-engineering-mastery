import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["migrations/**"],
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
