/**
 * The web sandbox's slug check (WEB-15), bound to the column's own pattern and
 * cap from @pem/db/sandbox, so the app never accepts a slug the table refuses.
 * Route files (the experiment registry) reach the constants through here,
 * since only lib/sandbox may import @pem/db/sandbox. The check repeats
 * @pem/db's own, because a function cannot leave that module.
 */

import { SANDBOX_SLUG, SANDBOX_SLUG_MAX } from "@pem/db/sandbox";

export { SANDBOX_SLUG, SANDBOX_SLUG_MAX };

export function isSandboxSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= SANDBOX_SLUG_MAX &&
    SANDBOX_SLUG.test(value)
  );
}
