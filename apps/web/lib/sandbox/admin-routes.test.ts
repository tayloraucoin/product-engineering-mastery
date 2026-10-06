/**
 * C6 (LAB-8, S12a): no /admin page, layout or action trusts another to have
 * checked the role. The route files are read as text and parsed:
 *
 * - every `page.tsx` and `layout.tsx` under app/admin awaits
 *   `requireTeamPage(...)` before any other await (awaiting the `params` or
 *   `searchParams` the route is handed is not a read, and may come first);
 * - every exported function of a `"use server"` file there calls
 *   `requireTeamAction(...)` in its first statement, except `signOutAdmin`.
 *
 * A synthetic page and action without the guard fail the same scan.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ADMIN_DIR = fileURLToPath(new URL("../../app/admin/", import.meta.url));

/** The one /admin action that may skip the team check: it only ends the caller's own session. */
const UNGUARDED_ACTIONS = new Set(["signOutAdmin"]);

/** Props a route is handed as promises; awaiting them reads nothing. */
const ROUTE_PROPS = new Set(["params", "searchParams"]);

type RouteFile = { file: string; source: string };

function routeFiles(dir: string): RouteFile[] {
  const found: RouteFile[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) found.push(...routeFiles(full));
    else if (/\.(ts|tsx)$/.test(name))
      found.push({
        file: path.relative(ADMIN_DIR, full),
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
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

const isExported = (node: ts.Node) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword,
  );

const isDefault = (node: ts.Node) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some(
    (m) => m.kind === ts.SyntaxKind.DefaultKeyword,
  );

/** The awaits in a body, in source order, not descending into nested functions. */
function awaitsIn(body: ts.Node): ts.AwaitExpression[] {
  const found: ts.AwaitExpression[] = [];
  const visit = (node: ts.Node) => {
    if (node !== body && ts.isFunctionLike(node)) return;
    if (ts.isAwaitExpression(node)) found.push(node);
    ts.forEachChild(node, visit);
  };
  visit(body);
  return found.sort((a, b) => a.getStart() - b.getStart());
}

/** The name a call is made through: `requireTeamPage(...)` or `x.requireTeamPage(...)`. */
function calleeName(node: ts.Expression): string | null {
  if (!ts.isCallExpression(node)) return null;
  const callee = node.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  return null;
}

function isRouteProp(node: ts.Expression): boolean {
  if (ts.isIdentifier(node)) return ROUTE_PROPS.has(node.text);
  if (ts.isPropertyAccessExpression(node))
    return ROUTE_PROPS.has(node.name.text);
  return false;
}

type FunctionBody = { name: string; body: ts.Block };

function functionBody(
  node: ts.Node,
  fallbackName: string,
): FunctionBody | null {
  if (ts.isFunctionDeclaration(node) && node.body)
    return { name: node.name?.text ?? fallbackName, body: node.body };
  if (ts.isVariableStatement(node)) {
    for (const decl of node.declarationList.declarations) {
      const init = decl.initializer;
      if (
        init &&
        (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) &&
        ts.isBlock(init.body)
      )
        return { name: decl.name.getText(), body: init.body };
    }
  }
  return null;
}

/** The default export's body: `export default function`, or `export default Name` for a function in the file. */
function defaultExportBody(sf: ts.SourceFile): FunctionBody | null {
  for (const node of sf.statements) {
    if (isExported(node) && isDefault(node))
      return functionBody(node, "default");
    if (ts.isExportAssignment(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      for (const other of sf.statements) {
        const found = functionBody(other, name);
        if (found?.name === name) return found;
      }
    }
  }
  return null;
}

/** Problems with one page or layout: no default export, or an await before the guard. */
function pageProblems(route: RouteFile): string[] {
  const found = defaultExportBody(parse(route));
  if (!found) return [`${route.file}: no default export function to check`];
  const first = awaitsIn(found.body).find((a) => !isRouteProp(a.expression));
  if (!first || calleeName(first.expression) !== "requireTeamPage")
    return [
      `${route.file}: ${found.name} must await requireTeamPage before any other await`,
    ];
  return [];
}

const isUseServer = (sf: ts.SourceFile) => {
  const first = sf.statements[0];
  return (
    !!first &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === "use server"
  );
};

/** Problems with one "use server" file: an exported action whose first statement is not the guard. */
function actionProblems(route: RouteFile): string[] {
  const sf = parse(route);
  if (!isUseServer(sf)) return [];
  const problems: string[] = [];
  for (const node of sf.statements) {
    if (!isExported(node)) continue;
    const found = functionBody(node, "default");
    if (!found) {
      if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node))
        problems.push(`${route.file}: an exported action could not be checked`);
      continue;
    }
    if (UNGUARDED_ACTIONS.has(found.name)) continue;
    const firstStatement = found.body.statements[0];
    const firstAwait = firstStatement ? awaitsIn(firstStatement)[0] : undefined;
    if (
      !firstAwait ||
      calleeName(firstAwait.expression) !== "requireTeamAction"
    )
      problems.push(
        `${route.file}: ${found.name} must call requireTeamAction in its first statement`,
      );
  }
  return problems;
}

function scanProblems(routes: RouteFile[]): string[] {
  const problems: string[] = [];
  for (const route of routes) {
    const base = path.basename(route.file);
    if (base === "page.tsx" || base === "layout.tsx")
      problems.push(...pageProblems(route));
    problems.push(...actionProblems(route));
  }
  return problems;
}

test("C6: every /admin page and layout awaits requireTeamPage first, and every action calls requireTeamAction first", () => {
  const routes = routeFiles(ADMIN_DIR);
  const pages = routes.filter((r) => /(^|\/)(page|layout)\.tsx$/.test(r.file));
  assert.ok(pages.length >= 3, "the scan found the /admin pages");
  assert.deepEqual(scanProblems(routes), []);
});

test("C6: a synthetic page or layout without the guard, or with a read before it, fails the scan", () => {
  const routes: RouteFile[] = [
    {
      file: "unguarded/page.tsx",
      source: `export default async function Page() { const rows = await listRows(); return rows; }`,
    },
    {
      file: "late/page.tsx",
      source: `export default async function Page() { const rows = await listRows(); await requireTeamPage("/admin/late"); return rows; }`,
    },
    {
      file: "nested/layout.tsx",
      source: `export default async function Layout({ children }) { return children; }`,
    },
    {
      file: "ok/[slug]/page.tsx",
      source: `export default async function Page({ params }) { const { slug } = await params; await requireTeamPage("/admin/x/" + slug); return null; }`,
    },
    {
      file: "named/page.tsx",
      source: `async function Page() { await getRows(); } export default Page;`,
    },
  ];
  assert.deepEqual(scanProblems(routes), [
    "unguarded/page.tsx: Page must await requireTeamPage before any other await",
    "late/page.tsx: Page must await requireTeamPage before any other await",
    "nested/layout.tsx: Layout must await requireTeamPage before any other await",
    "named/page.tsx: Page must await requireTeamPage before any other await",
  ]);
});

test("C6: a synthetic action without the guard, or with work before it, fails the scan; signOutAdmin alone is exempt", () => {
  const routes: RouteFile[] = [
    {
      file: "synthetic/actions.ts",
      source: [
        `"use server";`,
        `export async function guarded(input) { const member = await requireTeamAction(); return member; }`,
        `export async function unguarded(input) { await deleteEverything(); }`,
        `export async function late(input) { await deleteEverything(); const m = await requireTeamAction(); }`,
        `export const arrow = async (input) => { await deleteEverything(); };`,
        `export async function signOutAdmin() { await endSession(); }`,
      ].join("\n"),
    },
    {
      file: "synthetic/not-actions.ts",
      source: `export async function helper() { await anything(); }`,
    },
  ];
  assert.deepEqual(scanProblems(routes), [
    "synthetic/actions.ts: unguarded must call requireTeamAction in its first statement",
    "synthetic/actions.ts: late must call requireTeamAction in its first statement",
    "synthetic/actions.ts: arrow must call requireTeamAction in its first statement",
  ]);
});
