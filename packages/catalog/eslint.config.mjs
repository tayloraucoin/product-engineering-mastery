import { config } from "@pem/config/eslint/react-internal";
import { tokensConfig } from "@pem/config/eslint/tokens";

/** @type {import("eslint").Linter.Config[]} */
export default [...config, ...tokensConfig];
