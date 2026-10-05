import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // The key and the tier arrive from the app's env.ts (codebase-conventions §5).
    // scripts/record.ts is a developer's tool and reads the key itself.
    files: ["src/**"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/ai never reads process.env; take the value as an argument from the app's env.ts.",
        },
      ],
    },
  },
];
