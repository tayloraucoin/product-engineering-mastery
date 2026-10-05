/**
 * `yarn db:seed-users`: creates the synthetic local users in Mode B, through
 * the local auth server. Refuses an unset tier, and an auth URL that is not
 * loopback.
 */

import { authSettings, authUrlName } from "./env.ts";
import { seedLocalUsers } from "./local-users.ts";

try {
  const { url, serviceRoleKey } = authSettings();
  const outcomes = await seedLocalUsers({
    authUrl: url,
    serviceRoleKey,
    authUrlName: authUrlName(),
  });
  for (const { email, result } of outcomes)
    console.log(`  ${email}: ${result}`);
  console.log("db:seed-users — done");
} catch (error) {
  console.error(
    `db:seed-users — ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
