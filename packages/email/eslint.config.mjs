import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // The key, the tier and any template id arrive from the app's env.ts (codebase-conventions §5).
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/email never reads process.env; take the value as an argument from the app's env.ts.",
        },
      ],
    },
  },
];
