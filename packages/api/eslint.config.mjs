import { config } from "@pem/config/eslint/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    // The transport is handed its sources by the app's route; it reads no environment (codebase-conventions §5).
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "@pem/api never reads process.env; the app's route hands it the context sources, built from env.ts.",
        },
      ],
    },
  },
];
