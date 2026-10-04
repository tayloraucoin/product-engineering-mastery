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
 * eslint-module-utils reports that as a "Resolve error" lint error. Every
 * other specifier falls through to the next resolver.
 *
 * CommonJS because eslint-module-utils loads resolvers with `require`.
 */

const { createRequire } = require("node:module");

exports.interfaceVersion = 2;

exports.resolve = (source, file) => {
  if (!source.startsWith("@pem/")) return { found: false };
  try {
    return { found: true, path: createRequire(file).resolve(source) };
  } catch (error) {
    throw new Error(
      `${source} does not resolve through its package's exports (${error.code ?? error.message}). Import a subpath the package exports; add an export only for an edge codebase-conventions §4 allows.`,
    );
  }
};
