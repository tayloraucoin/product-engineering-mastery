/**
 * `yarn db:seed-users`: creates the synthetic local users in Mode B, through
 * the local auth server. Refuses when the auth URL is not loopback.
 */

import { authSettings, authUrlName } from "./env.ts";
import { seedLocalUsers } from "./local-users.ts";

const { url, serviceRoleKey } = authSettings();
try {
  const outcomes = await seedLocalUsers({
    authUrl: url,
    serviceRoleKey,
    authUrlName: authUrlName(),
  });
  for (const { email, result } of outcomes)
    console.log(`  ${email}: ${result}`);
  console.log("db:seed-users — done");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
