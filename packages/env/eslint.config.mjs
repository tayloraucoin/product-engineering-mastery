import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // The picker is pure: an app's env.ts reads process.env and hands it the values (D-STK-3).
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/env never reads process.env; take the value as an argument from the app's env.ts.",
        },
      ],
    },
  },
];
