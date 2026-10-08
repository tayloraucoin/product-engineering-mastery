/**
 * The sandbox slug check, once (WEB-15): the column's own pattern and cap
 * (columns.ts), so a function never accepts a slug the table refuses. Each
 * caller keeps its own refusal. A function cannot leave @pem/db/sandbox (the
 * isolation suite files every exported function as gate or viewer), so the
 * package exports the constants and apps/web/lib/sandbox/slug.ts binds its own
 * check to them.
 */

import {
  SANDBOX_SLUG_MAX,
  SANDBOX_SLUG_PATTERN,
} from "../schema/sandbox/columns.ts";

export { SANDBOX_SLUG_MAX };

/** Lower-case words joined by single hyphens; no `g` flag, so `test` holds no state. */
export const SANDBOX_SLUG = new RegExp(SANDBOX_SLUG_PATTERN);

export function isSandboxSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= SANDBOX_SLUG_MAX &&
    SANDBOX_SLUG.test(value)
  );
}
