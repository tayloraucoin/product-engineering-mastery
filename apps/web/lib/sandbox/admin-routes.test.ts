/**
 * C6 (LAB-8, S12a): no /admin page, layout or action trusts another to have
 * checked the role. Every file under app/admin is read and parsed with the
 * TypeScript compiler, and must take one of these shapes:
 *
 * - `page.tsx`: the default export (and `generateMetadata`, when present)
 *   opens with `await requireTeamPage(<path>)`, imported from admin-guard.
 *   Only reading the `params` or `searchParams` it is handed may come first.
 *   The path is never `null`.
 * - `layout.tsx`: the same, except it may pass `null`, and then its very next
 *   statement is `if (!member) return children;`.
 * - `loading.tsx`: awaits nothing.
 * - A `"use server"` file: every exported action opens with
 *   `const member = await requireTeamAction(...)` and then
 *   `if (isTeamActionRefusal(member)) return member;`. Under people/ the call
 *   passes `{ adminOnly: true }`. No re-exports.
 * - Nothing else outside a `_private` folder: no route handler, template or
 *   page of another extension (D-LAB-43: server actions only). No inline
 *   `"use server"` anywhere.
 *
 * Synthetic files that break each rule fail the same scan.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ADMIN_DIR = fileURLToPath(new URL("../../app/admin/", import.meta.url));

/** Route files the App Router serves that the scan knows how to check. */
const ROUTE_FILES = new Set([
  "page.tsx",
  "layout.tsx",
  "loading.tsx",
  "actions.ts",
]);

/** Props a route is handed as promises; awaiting them reads nothing. */
const ROUTE_PROPS = new Set(["params", "searchParams"]);

type RouteFile = { file: string; source: string };

function routeFiles(dir: string): RouteFile[] {
  const found: RouteFile[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) found.push(...routeFiles(full));
    else
      found.push({
        file: path.relative(ADMIN_DIR, full).split(path.sep).join("/"),
        source: readFileSync(full, "utf8"),
      });
  }
  return found;
}

function parse({ file, source }: RouteFile): ts.SourceFile {
  return ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    /\.(tsx|jsx)$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

const hasModifier = (node: ts.Node, kind: ts.SyntaxKind) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((m) => m.kind === kind);
const isExported = (node: ts.Node) =>
  hasModifier(node, ts.SyntaxKind.ExportKeyword);
const isDefault = (node: ts.Node) =>
  hasModifier(node, ts.SyntaxKind.DefaultKeyword);

const isDirective = (node: ts.Node, text: string) =>
  ts.isExpressionStatement(node) &&
  ts.isStringLiteral(node.expression) &&
  node.expression.text === text;

/** The names a file imports from lib/sandbox/admin-guard. */
function guardImports(sf: ts.SourceFile): Set<string> {
  const names = new Set<string>();
  for (const node of sf.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      !/(^|\/)admin-guard(\.ts)?$/.test(node.moduleSpecifier.text)
    )
      continue;
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings))
      for (const el of bindings.elements)
        if (!el.propertyName) names.add(el.name.text);
  }
  return names;
}

type Fn = { name: string; body: ts.Block };

function functionOf(node: ts.Node, fallback: string): Fn | null {
  if (ts.isFunctionDeclaration(node) && node.body)
    return { name: node.name?.text ?? fallback, body: node.body };
  if (ts.isVariableStatement(node))
    for (const decl of node.declarationList.declarations) {
      const init = decl.initializer;
      if (
        init &&
        (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) &&
        ts.isBlock(init.body)
      )
        return { name: decl.name.getText(), body: init.body };
    }
  return null;
}

/** `name` declared at the top of the file as a function, for `export default name`. */
function localFunction(sf: ts.SourceFile, name: string): Fn | null {
  for (const node of sf.statements) {
    const fn = functionOf(node, name);
    if (fn?.name === name) return fn;
  }
  return null;
}

function defaultExport(sf: ts.SourceFile): Fn | null {
  for (const node of sf.statements) {
    if (isExported(node) && isDefault(node)) return functionOf(node, "default");
    if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression))
      return localFunction(sf, node.expression.text);
  }
  return null;
}

function namedExport(sf: ts.SourceFile, name: string): Fn | null {
  for (const node of sf.statements) {
    if (!isExported(node)) continue;
    const fn = functionOf(node, "");
    if (fn?.name === name) return fn;
  }
  return null;
}

/** The call inside `await <call>` or `const x = await <call>`, with the bound name. */
function awaitedCall(
  statement: ts.Statement,
): { call: ts.CallExpression; bound: string | null } | null {
  let expr: ts.Expression | undefined;
  let bound: string | null = null;
  if (ts.isExpressionStatement(statement)) expr = statement.expression;
  else if (
    ts.isVariableStatement(statement) &&
    statement.declarationList.declarations.length === 1
  ) {
    const decl = statement.declarationList.declarations[0]!;
    expr = decl.initializer;
    bound = ts.isIdentifier(decl.name) ? decl.name.text : null;
  }
  if (!expr || !ts.isAwaitExpression(expr)) return null;
  const call = expr.expression;
  return ts.isCallExpression(call) ? { call, bound } : null;
}

/** `const … = await params` (or `searchParams`, or `props.params`): reads nothing. */
function isRoutePropRead(statement: ts.Statement): boolean {
  if (!ts.isVariableStatement(statement)) return false;
  return statement.declarationList.declarations.every((decl) => {
    const init = decl.initializer;
    if (!init || !ts.isAwaitExpression(init)) return false;
    const target = init.expression;
    if (ts.isIdentifier(target)) return ROUTE_PROPS.has(target.text);
    return (
      ts.isPropertyAccessExpression(target) && ROUTE_PROPS.has(target.name.text)
    );
  });
}

const calls = (call: ts.CallExpression, name: string, imported: Set<string>) =>
  ts.isIdentifier(call.expression) &&
  call.expression.text === name &&
  imported.has(name);

/** `if (!name) return …;` */
function isBareReturn(statement: ts.Statement | undefined, name: string) {
  if (!statement || !ts.isIfStatement(statement)) return false;
  const cond = statement.expression;
  const then = ts.isBlock(statement.thenStatement)
    ? statement.thenStatement.statements[0]
    : statement.thenStatement;
  return (
    ts.isPrefixUnaryExpression(cond) &&
    cond.operator === ts.SyntaxKind.ExclamationToken &&
    ts.isIdentifier(cond.operand) &&
    cond.operand.text === name &&
    !!then &&
    ts.isReturnStatement(then)
  );
}

function pageProblems(
  file: string,
  fn: Fn | null,
  imported: Set<string>,
  isLayout: boolean,
): string[] {
  if (!fn) return [`${file}: no exported function to check`];
  const statements = [...fn.body.statements];
  let i = 0;
  while (i < statements.length && isRoutePropRead(statements[i]!)) i++;
  const guard = statements[i] ? awaitedCall(statements[i]!) : null;
  const bad = `${file}: ${fn.name} must open with await requireTeamPage(<path>) from admin-guard`;
  if (!guard || !calls(guard.call, "requireTeamPage", imported)) return [bad];
  const arg = guard.call.arguments[0];
  if (!arg) return [bad];
  if (arg.kind === ts.SyntaxKind.NullKeyword) {
    if (!isLayout)
      return [`${file}: ${fn.name} is a page and may not pass null`];
    if (!guard.bound || !isBareReturn(statements[i + 1], guard.bound))
      return [
        `${file}: ${fn.name} passes null and must next return its children bare when no member comes back`,
      ];
  }
  return [];
}

function actionProblems(
  file: string,
  sf: ts.SourceFile,
  imported: Set<string>,
): string[] {
  const problems: string[] = [];
  for (const node of sf.statements) {
    if (ts.isExportDeclaration(node)) {
      problems.push(`${file}: a "use server" file may not re-export`);
      continue;
    }
    if (!isExported(node)) continue;
    const fn = functionOf(node, "default");
    if (!fn) {
      if (!ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node))
        problems.push(`${file}: an export that is not an action`);
      continue;
    }
    const [first, second] = fn.body.statements;
    const guard = first ? awaitedCall(first) : null;
    const ok =
      !!guard?.bound &&
      calls(guard.call, "requireTeamAction", imported) &&
      !!second &&
      ts.isIfStatement(second) &&
      ts.isCallExpression(second.expression) &&
      calls(second.expression, "isTeamActionRefusal", imported) &&
      second.expression.arguments[0]?.getText() === guard.bound &&
      ts.isReturnStatement(
        ts.isBlock(second.thenStatement)
          ? (second.thenStatement.statements[0] ?? second.thenStatement)
          : second.thenStatement,
      );
    if (!ok) {
      problems.push(
        `${file}: ${fn.name} must open with const member = await requireTeamAction() and return its refusal`,
      );
      continue;
    }
    if (file.startsWith("people/")) {
      const opts = guard.call.arguments[0];
      const adminOnly =
        opts &&
        ts.isObjectLiteralExpression(opts) &&
        opts.properties.some(
          (p) =>
            ts.isPropertyAssignment(p) &&
            p.name.getText() === "adminOnly" &&
            p.initializer.kind === ts.SyntaxKind.TrueKeyword,
        );
      if (!adminOnly)
        problems.push(
          `${file}: ${fn.name} is a People action and must pass { adminOnly: true }`,
        );
    }
  }
  return problems;
}

/** A `"use server"` directive anywhere but the top of a file. */
function inlineServerActions(file: string, sf: ts.SourceFile): string[] {
  const problems: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) {
      const body = (node as ts.FunctionLikeDeclarationBase).body;
      if (
        body &&
        ts.isBlock(body) &&
        body.statements.some((s) => isDirective(s, "use server"))
      )
        problems.push(`${file}: an inline "use server" action`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return problems;
}

function scanProblems(routes: RouteFile[]): string[] {
  const problems: string[] = [];
  for (const route of routes) {
    const base = route.file.split("/").pop()!;
    const isPrivate = route.file
      .split("/")
      .slice(0, -1)
      .some((dir) => dir.startsWith("_"));
    const sf = parse(route);
    const imported = guardImports(sf);
    problems.push(...inlineServerActions(route.file, sf));
    const useServer =
      !!sf.statements[0] && isDirective(sf.statements[0], "use server");
    if (useServer) problems.push(...actionProblems(route.file, sf, imported));
    if (isPrivate) continue;
    if (!ROUTE_FILES.has(base)) {
      problems.push(`${route.file}: not a route file the scan allows`);
      continue;
    }
    if (base === "page.tsx" || base === "layout.tsx") {
      const isLayout = base === "layout.tsx";
      problems.push(
        ...pageProblems(route.file, defaultExport(sf), imported, isLayout),
      );
      const meta = namedExport(sf, "generateMetadata");
      if (meta)
        problems.push(...pageProblems(route.file, meta, imported, false));
      if (namedExport(sf, "generateStaticParams"))
        problems.push(
          `${route.file}: generateStaticParams would prerender /admin`,
        );
    }
    if (base === "loading.tsx" && /\bawait\b/.test(route.source))
      problems.push(`${route.file}: a loading file awaits nothing`);
    if (base === "actions.ts" && !useServer)
      problems.push(`${route.file}: actions.ts must be a "use server" file`);
  }
  return problems;
}

const GUARD = `import { isTeamActionRefusal, requireTeamAction, requireTeamPage } from "../../lib/sandbox/admin-guard";`;

test("C6: every /admin route file opens with its guard", () => {
  const routes = routeFiles(ADMIN_DIR);
  assert.ok(
    routes.filter((r) => /(^|\/)(page|layout)\.tsx$/.test(r.file)).length >= 3,
    "the scan found the /admin pages",
  );
  assert.deepEqual(scanProblems(routes), []);
});

test("C6: a synthetic page or layout without the guard, with a read before it, or with a null path fails the scan", () => {
  const page = (file: string, body: string) => ({
    file,
    source: `${GUARD}\nexport default async function Page({ params, children }) { ${body} }`,
  });
  assert.deepEqual(
    scanProblems([
      page("a/page.tsx", `const rows = await listRows(); return rows;`),
      page(
        "b/page.tsx",
        `const rows = await listRows(); await requireTeamPage("/admin/b");`,
      ),
      page(
        "c/page.tsx",
        `const p = listRows(); await requireTeamPage("/admin/c");`,
      ),
      page("d/page.tsx", `if (x) await requireTeamPage("/admin/d"); return 1;`),
      page("e/page.tsx", `await requireTeamPage(null); return getRows();`),
      page(
        "f/layout.tsx",
        `const m = await requireTeamPage(null); return getRows();`,
      ),
      page("g/page.tsx", `await other.requireTeamPage("/admin/g");`),
      {
        file: "h/page.tsx",
        source: `const requireTeamPage = async () => {};\nexport default async function Page() { await requireTeamPage("/admin/h"); }`,
      },
      page(
        "ok/[slug]/page.tsx",
        `const { slug } = await params; await requireTeamPage("/admin/x/" + slug); return null;`,
      ),
      page(
        "ok/layout.tsx",
        `const member = await requireTeamPage(null); if (!member) return children; return 1;`,
      ),
      {
        file: "meta/page.tsx",
        source: `${GUARD}\nexport async function generateMetadata() { return { title: await getTitle() }; }\nexport default async function Page() { await requireTeamPage("/admin/meta"); }`,
      },
    ]),
    [
      "a/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "b/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "c/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "d/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "e/page.tsx: Page is a page and may not pass null",
      "f/layout.tsx: Page passes null and must next return its children bare when no member comes back",
      "g/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "h/page.tsx: Page must open with await requireTeamPage(<path>) from admin-guard",
      "meta/page.tsx: generateMetadata must open with await requireTeamPage(<path>) from admin-guard",
    ],
  );
});

test("C6: a synthetic action that skips the guard, works first, or drops the refusal fails the scan", () => {
  const actions = (file: string, ...fns: string[]) => ({
    file,
    source: [`"use server";`, GUARD, ...fns].join("\n"),
  });
  assert.deepEqual(
    scanProblems([
      actions(
        "x/actions.ts",
        `export async function guarded(f) { const member = await requireTeamAction(); if (isTeamActionRefusal(member)) return member; return go(); }`,
        `export async function unguarded(f) { await deleteEverything(); }`,
        `export async function late(f) { await deleteEverything(); const m = await requireTeamAction(); }`,
        `export async function dropped(f) { await requireTeamAction(); await setRole(f); }`,
        `export async function ignored(f) { const m = await requireTeamAction(); await setRole(f); }`,
        `export const arrow = async (f) => { await deleteEverything(); };`,
        `export { helper } from "./helper";`,
      ),
      actions(
        "people/actions.ts",
        `export async function changeRole(f) { const member = await requireTeamAction(); if (isTeamActionRefusal(member)) return member; }`,
      ),
      {
        file: "_components/form.tsx",
        source: `export function Form() { async function act() { "use server"; await deleteEverything(); } return null; }`,
      },
      {
        file: "y/route.ts",
        source: `export async function GET() { return new Response("x"); }`,
      },
      { file: "z/page.ts", source: `export default async function Page() {}` },
      {
        file: "w/loading.tsx",
        source: `export default async function Loading() { await getRows(); }`,
      },
    ]),
    [
      "x/actions.ts: unguarded must open with const member = await requireTeamAction() and return its refusal",
      "x/actions.ts: late must open with const member = await requireTeamAction() and return its refusal",
      "x/actions.ts: dropped must open with const member = await requireTeamAction() and return its refusal",
      "x/actions.ts: ignored must open with const member = await requireTeamAction() and return its refusal",
      "x/actions.ts: arrow must open with const member = await requireTeamAction() and return its refusal",
      'x/actions.ts: a "use server" file may not re-export',
      "people/actions.ts: changeRole is a People action and must pass { adminOnly: true }",
      '_components/form.tsx: an inline "use server" action',
      "y/route.ts: not a route file the scan allows",
      "z/page.ts: not a route file the scan allows",
      "w/loading.tsx: a loading file awaits nothing",
    ],
  );
});
