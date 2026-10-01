import { nextJsConfig } from "@pem/config/eslint/next-js";
import { tokensConfig } from "@pem/config/eslint/tokens";

/** @type {import("eslint").Linter.Config[]} */
export default [...nextJsConfig, ...tokensConfig];
