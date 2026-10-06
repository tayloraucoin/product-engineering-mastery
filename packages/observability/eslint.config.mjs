import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // A logger that read process.env would decide its own verbosity per host; the caller decides (codebase-conventions §5).
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/observability never reads process.env; take the value as an argument from the app's env.ts.",
        },
      ],
    },
  },
];
