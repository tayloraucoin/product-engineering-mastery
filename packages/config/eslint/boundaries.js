/**
 * Import-boundary rules (codebase-conventions §4).
 *
 * Enforced via eslint-plugin-boundaries at the repo root (eslint.config.mjs).
 * Layer order (low → high), the built part of codebase-conventions §4:
 *   config → env → ui → apps
 *
 * - apps/* → apps/*: hard ban
 * - packages/* → apps/*: hard ban
 *
 * Zones are matched by path pattern, so a package added later only needs a
 * line in ELEMENTS and an entry in PACKAGE_IMPORTS — every edge it does not
 * declare is disallowed by default.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

const configDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(configDir, "../../..");

/** Yarn workspaces symlink @pem/* into node_modules — match both paths. */
function workspacePackage(type, folder) {
  return {
    type,
    pattern: [`packages/${folder}/**`, `node_modules/@pem/${folder}/**`],
    mode: "full",
  };
}

function workspaceApp(type, folder) {
  return {
    type,
    pattern: [`apps/${folder}/**`, `node_modules/${folder}/**`],
    mode: "full",
  };
}

const ELEMENTS = [
  workspaceApp("app-web", "web"),
  workspaceApp("app-docs", "docs"),
  workspacePackage("config", "config"),
  workspacePackage("env", "env"),
  workspacePackage("ui", "ui"),
];

/** Each package may import only these lower-layer types. */
const PACKAGE_IMPORTS = {
  config: [],
  env: ["config"],
  ui: ["config"],
};

const APP_TYPES = ELEMENTS.map((element) => element.type).filter((type) =>
  type.startsWith("app-"),
);

const APP_IMPORTS = Object.keys(PACKAGE_IMPORTS);

function buildDependencyRules() {
  const rules = [
    // Relative imports inside one element, and imports within the same type.
    { allow: { dependency: { relationship: { to: "internal" } } } },
    { allow: { from: { type: "{{to.type}}" }, to: { type: "{{from.type}}" } } },
    // Third-party modules (see flag-as-external below).
    { allow: { to: { isUnknown: true } } },
    { allow: { to: { origin: "external" } } },
  ];

  for (const [from, allowed] of Object.entries(PACKAGE_IMPORTS)) {
    if (allowed.length > 0) {
      rules.push({ from: { type: from }, allow: { to: { type: allowed } } });
    }
  }

  for (const appType of APP_TYPES) {
    rules.push({ from: { type: appType }, allow: { to: { type: APP_IMPORTS } } });
    for (const otherApp of APP_TYPES) {
      if (otherApp !== appType) {
        rules.push({ from: { type: appType }, disallow: { to: { type: otherApp } } });
      }
    }
  }

  rules.push({
    from: { type: Object.keys(PACKAGE_IMPORTS) },
    disallow: { to: { type: APP_TYPES } },
  });

  return rules;
}

/** @type {import("eslint").Linter.Config[]} */
export const boundariesConfig = [
  {
    files: [
      "packages/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "apps/**/*.{ts,tsx,js,jsx,mjs,cjs}",
    ],
    plugins: { boundaries },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      "boundaries/root-path": repoRoot,
      // Without this, eslint-import-resolver-node only tries .js/.json/.node,
      // every `@pem/*` specifier resolves to null, and the whole rule set
      // silently passes on `isUnknown`. Workspace entry points are .ts.
      "import/resolver": {
        node: {
          extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
        },
      },
      "boundaries/include": [
        "packages/**/*",
        "apps/**/*",
        "node_modules/@pem/**/*",
        ...APP_TYPES.map((type) => `node_modules/${type.slice(4)}/**/*`),
      ],
      "boundaries/ignore": ["**/.next/**", "**/dist/**", "**/*.d.ts"],
      "boundaries/flag-as-external": {
        unresolvableAlias: true,
        // false, so a `@pem/*` import — which Yarn resolves through the
        // node_modules symlink — stays local and keeps matching its element
        // zone. Third-party packages then resolve outside every zone and are
        // allowed by the `isUnknown` rule.
        inNodeModules: false,
        outsideRootPath: false,
      },
      "boundaries/elements": ELEMENTS,
    },
    rules: {
      // A relative path into another workspace bypasses its `exports` and
      // lands in an allowed zone, so the matrix below would let it through.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/packages/*/**", "**/apps/*/**"],
              message:
                "Import a workspace by its package name (@pem/<name>), never by relative path (codebase-conventions §4).",
            },
          ],
        },
      ],
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          checkAllOrigins: true,
          message:
            "{{from.type}} must not import {{to.type}} (codebase-conventions §4). Refactor — do not suppress.",
          rules: buildDependencyRules(),
        },
      ],
    },
  },
];
