/**
 * Import-boundary rules (codebase-conventions §4).
 *
 * Enforced via eslint-plugin-boundaries at the repo root (eslint.config.mjs).
 * Layer order (low → high), the built part of codebase-conventions §4:
 *   config → constants, env, brand, observability → db → auth → email → ui → apps
 *
 * `ui-workshop` is `packages/ui/.storybook/`, the component workshop
 * (D-STK-10): it reads @pem/brand for fonts and assets, which @pem/ui's own
 * components never do. It is listed before `ui` because the first match wins.
 *
 * `catalog` is `packages/catalog`, the shelf (CS-07, record 0011): it may
 * import `config` and `ui`, and nothing may import it. No package lists it
 * and apps are kept off it below; the workshop reaches its stories by a glob.
 *
 * - apps/* → apps/*: hard ban
 * - packages/* → apps/*: hard ban
 *
 * Zones are matched by path pattern, so a package added later only needs a
 * line in ELEMENTS and an entry in PACKAGE_IMPORTS — every edge it does not
 * declare is disallowed by default.
 *
 * Each vendor SDK in SDK_OWNERS has one owner (D-STK-16): only that element's
 * files may import it, so the rest of the repo reaches the vendor through the
 * owner's own exports.
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
  workspacePackage("constants", "constants"),
  workspacePackage("env", "env"),
  workspacePackage("brand", "brand"),
  workspacePackage("observability", "observability"),
  workspacePackage("db", "db"),
  workspacePackage("auth", "auth"),
  workspacePackage("email", "email"),
  {
    type: "ui-workshop",
    pattern: ["packages/ui/.storybook/**"],
    mode: "full",
  },
  workspacePackage("ui", "ui"),
  workspacePackage("catalog", "catalog"),
];

/** Each package may import only these lower-layer types. */
const PACKAGE_IMPORTS = {
  config: [],
  constants: ["config"],
  env: ["config"],
  brand: ["config"],
  observability: ["config"],
  db: ["config", "env"],
  auth: ["config", "db", "observability"],
  email: ["config", "env", "brand", "observability"],
  ui: ["config"],
  "ui-workshop": ["config", "brand", "ui"],
  catalog: ["config", "ui"],
};

/** Vendor SDK → the one element type allowed to import it (D-STK-16). */
const SDK_OWNERS = {
  postgres: "db",
  "drizzle-kit": "db",
  "@supabase/*": "auth",
  resend: "email",
};

const APP_TYPES = ELEMENTS.map((element) => element.type).filter((type) =>
  type.startsWith("app-"),
);

/** Apps import packages, never a package's workshop, and never the shelf. */
const NOT_FOR_APPS = new Set(["ui-workshop", "catalog"]);
const APP_IMPORTS = Object.keys(PACKAGE_IMPORTS).filter(
  (type) => !NOT_FOR_APPS.has(type),
);

const SOURCE_FILES = "**/*.{ts,tsx,js,jsx,mjs,cjs}";

/** A relative path into another workspace bypasses its `exports`. */
const WORKSPACE_PATH_PATTERN = {
  group: ["**/packages/*/**", "**/apps/*/**"],
  message:
    "Import a workspace by its package name (@pem/<name>), never by relative path (codebase-conventions §4).",
};

/** no-restricted-imports for files in `owner` (or in no owner): every SDK owned elsewhere is banned. */
function restrictedImports(owner) {
  const sdkPatterns = Object.entries(SDK_OWNERS)
    .filter(([, sdkOwner]) => sdkOwner !== owner)
    .map(([sdk, sdkOwner]) => ({
      group: [sdk, `${sdk}/*`],
      message: `${sdk} is owned by @pem/${sdkOwner} (D-STK-16); import what you need from @pem/${sdkOwner}.`,
    }));
  return ["error", { patterns: [WORKSPACE_PATH_PATTERN, ...sdkPatterns] }];
}

/** One override per SDK owner, so its own files may import what it owns. */
function ownerOverrides() {
  const owners = [...new Set(Object.values(SDK_OWNERS))];
  return owners.map((owner) => {
    const element = ELEMENTS.find((candidate) => candidate.type === owner);
    if (!element) throw new Error(`SDK owner ${owner} is not in ELEMENTS`);
    return {
      files: element.pattern
        .filter((pattern) => !pattern.startsWith("node_modules/"))
        .map((pattern) => pattern.replace(/\*\*$/, SOURCE_FILES)),
      rules: { "no-restricted-imports": restrictedImports(owner) },
    };
  });
}

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
    rules.push({
      from: { type: appType },
      allow: { to: { type: APP_IMPORTS } },
    });
    for (const otherApp of APP_TYPES) {
      if (otherApp !== appType) {
        rules.push({
          from: { type: appType },
          disallow: { to: { type: otherApp } },
        });
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
      // Tried in order, first found wins. An unresolved import passes on
      // `isUnknown`, so resolution is what the whole rule set stands on.
      // - workspace-resolver: `@pem/*` through each package's `exports`,
      //   which the node resolver ignores; an unresolvable one is a lint
      //   error, never unknown.
      // - node: relative imports and third-party packages. Without the
      //   extensions it tries only .js/.json/.node; workspace sources are .ts.
      "import/resolver": {
        [resolve(configDir, "workspace-resolver.cjs")]: {},
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
      // An SDK owned by another element is banned here too (D-STK-16).
      "no-restricted-imports": restrictedImports(null),
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
  ...ownerOverrides(),
];
