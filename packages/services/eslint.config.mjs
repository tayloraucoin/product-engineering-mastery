import { config } from "@pem/config/eslint/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // A service is handed its context and input; it reads no environment (codebase-conventions §5).
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/services never reads process.env; the transport builds ctx from the app's env.ts.",
        },
      ],
    },
  },
];
