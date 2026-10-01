/**
 * Shared Prettier options. The root `prettier.config.mjs` re-exports this
 * module, so there is exactly one copy of these values.
 *
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  // "" is a blank line between groups: external, workspace, app-alias, relative.
  importOrder: [
    "^server-only$",
    "",
    "<BUILTIN_MODULES>",
    "^react$",
    "^react/",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@pem/",
    "",
    "^@/",
    "",
    "^[./]",
  ],
  importOrderTypeScriptVersion: "5.0.0",
};

export default config;
