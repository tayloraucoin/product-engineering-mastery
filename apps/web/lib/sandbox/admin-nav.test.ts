import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  activeAdminHref,
  ADMIN_METADATA,
  ADMIN_NAV,
  adminNavFor,
  adminShellView,
  SHELL_STATE_KEYS,
} from "./admin-nav.ts";
import { readSandboxState, SANDBOX_STATE_KEYS } from "./state.ts";

const titles = (entries: { title: string }[]) => entries.map((e) => e.title);

test("C3: a developer's nav has Experiments and Data and no People; an admin's has all three", () => {
  assert.deepEqual(titles(adminNavFor("developer")), ["Experiments", "Data"]);
  assert.deepEqual(titles(adminNavFor("admin")), [
    "Experiments",
    "People",
    "Data",
  ]);
});

test("C3: each entry is { title, href, icon, ready }, People is the one admin-only entry", () => {
  for (const entry of ADMIN_NAV) {
    assert.equal(typeof entry.title, "string");
    assert.match(entry.href, /^\/admin\/[a-z]+$/);
    assert.equal(typeof entry.icon, "string");
    assert.equal(typeof entry.ready, "boolean");
  }
  assert.deepEqual(
    ADMIN_NAV.filter((e) => e.adminOnly).map((e) => e.href),
    ["/admin/people"],
  );
});

test("the active entry is the one the path sits under", () => {
  assert.equal(activeAdminHref("/admin/experiments"), "/admin/experiments");
  assert.equal(
    activeAdminHref("/admin/experiments/pricing-2026/codes"),
    "/admin/experiments",
  );
  assert.equal(activeAdminHref("/admin/peoplex"), null);
  assert.equal(activeAdminHref("/admin"), null);
});

test("C5: the shared metadata is noindex and nofollow", () => {
  assert.deepEqual(ADMIN_METADATA.robots, { index: false, follow: false });
});

test("C5: the admin layout exports the shared metadata, so every /admin page inherits it", () => {
  const layout = readFileSync(
    new URL("../../app/admin/layout.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    layout,
    /export const metadata(: Metadata)? = ADMIN_METADATA;/,
    "layout.tsx must export ADMIN_METADATA as its metadata",
  );
  assert.match(
    layout,
    /import \{[^}]*\bADMIN_METADATA\b[^}]*\} from "[^"]*admin-nav"/,
  );
});

test("every shell state key is registered as team, and renders only for the team", () => {
  for (const key of SHELL_STATE_KEYS) {
    assert.equal(SANDBOX_STATE_KEYS[key], "team", key);
    assert.equal(readSandboxState(key, "team"), key);
    assert.equal(readSandboxState(key, "reviewer"), null);
    assert.equal(readSandboxState(key, "guest"), null);
  }
});

test("each shell state key shows what shell.md says", () => {
  const admin = adminShellView("shell-admin", "developer");
  assert.deepEqual(titles(admin.nav), ["Experiments", "People", "Data"]);
  assert.ok(admin.nav.every((e) => e.ready));

  const developer = adminShellView("shell-developer", "admin");
  assert.deepEqual(titles(developer.nav), ["Experiments", "Data"]);

  const notReady = adminShellView("shell-not-ready", "admin");
  assert.deepEqual(
    notReady.nav.filter((e) => !e.ready).map((e) => e.title),
    ["People"],
  );

  assert.equal(adminShellView("shell-collapsed", "admin").collapsed, true);
  assert.equal(adminShellView("shell-phone", "admin").sheetOpen, true);
  assert.equal(adminShellView("shell-not-found", "admin").notFound, true);

  const real = adminShellView(null, "developer");
  assert.deepEqual(titles(real.nav), ["Experiments", "Data"]);
  assert.deepEqual(
    [real.collapsed, real.sheetOpen, real.notFound],
    [false, false, false],
  );
  assert.deepEqual(adminShellView("people-empty", "developer"), real);
});
