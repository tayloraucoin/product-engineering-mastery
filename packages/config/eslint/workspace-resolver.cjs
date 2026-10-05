/**
 * Import resolver for `@pem/*` workspace specifiers (eslint-module-utils
 * interface v2), listed before `node` in boundaries.js.
 *
 * eslint-import-resolver-node ignores package.json `exports`, and no @pem
 * package has a `main` or root entry, so it resolves every `@pem/<subpath>`
 * to nothing and the boundaries matrix lets it through as unknown. Node's own
 * resolution reads `exports`, the same map the apps and packages build with.
 *
 * It fails closed: an `@pem/*` specifier that does not resolve throws, and
 * eslint-module-utils reports that as a "Resolve error" lint error: one per
 * file, at line 1, so a second bad specifier shows once the first is fixed.
 * Every other specifier falls through to the next resolver.
 *
 * It also resolves an app's `@/` alias (each app's tsconfig maps `@/*` to the
 * app's root). Unresolved, an `@/` import passed every boundary rule as
 * unknown, so `@/app/api/ai/ai` reached the AI route's client from any app
 * file (STK-17). It fails closed the same way.
 *
 * CommonJS because eslint-module-utils loads resolvers with `require`.
 */

const { existsSync, statSync } = require("node:fs");
const { createRequire } = require("node:module");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "../../..");
const ALIAS_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
];

/** Throws the error eslint-module-utils prints as a one-line "Resolve error". */
function fail(message) {
  const failure = new Error(message);
  // Under any other name, eslint-module-utils prints the stack, with this
  // machine's absolute paths, instead of the message.
  failure.name = "EslintPluginImportResolveError";
  throw failure;
}

/** `@/x` in a file under apps/<name>/: the file at apps/<name>/x, as TypeScript finds it. */
function resolveAppAlias(source, file) {
  const app = /^apps\/[^/]+/.exec(
    path.relative(REPO_ROOT, file).split(path.sep).join("/"),
  );
  if (!app) return { found: false };
  const base = path.join(REPO_ROOT, app[0], source.slice(2));
  const candidates = [
    base,
    ...ALIAS_EXTENSIONS.map((extension) => base + extension),
    ...ALIAS_EXTENSIONS.map((extension) =>
      path.join(base, `index${extension}`),
    ),
  ];
  const found = candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
  if (!found)
    fail(
      `${source} does not resolve to a file under ${app[0]}/ (the app's @/ alias).`,
    );
  return { found: true, path: found };
}

exports.interfaceVersion = 2;

exports.resolve = (source, file) => {
  if (source.startsWith("@/")) return resolveAppAlias(source, file);
  if (!source.startsWith("@pem/")) return { found: false };
  try {
    return { found: true, path: createRequire(file).resolve(source) };
  } catch (error) {
    fail(
      `${source} does not resolve through its package's exports (${error.code ?? error.message}). Import a subpath the package exports; add an export only for an edge codebase-conventions §4 allows.`,
    );
  }
};
