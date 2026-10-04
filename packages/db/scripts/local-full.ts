/**
 * `yarn db:local:full`: Mode B of D-STK-6. Starts the whole local Supabase
 * stack (`supabase start`) from the same supabase/config.toml, so sign-in runs
 * on this machine and Supabase Auth itself writes auth.users; the mirror's own
 * guard stays shut because Auth creates auth.identities. Selecting Mode B is
 * one config change: point NEXT_PUBLIC_SUPABASE_URL_LOCAL and
 * SUPABASE_SERVICE_ROLE_KEY_LOCAL at the values `supabase status` prints.
 */

import { isLoopbackUrl } from "../src/loopback.ts";
import { authSettings, authUrlName } from "./env.ts";
import {
  LOCAL_CONTAINER,
  LOCAL_PORT,
  LOCAL_PROJECT_ID,
} from "./local-image.ts";
import {
  isContainerRunning,
  preflight,
  supabase,
  waitForDatabase,
} from "./supabase-cli.ts";

const COMMAND = "db:local:full";

preflight(COMMAND);
// `supabase start` reports success and starts nothing while Mode A's database
// container runs alone, so that container is stopped first; its volume, and
// so its data, is kept. Auth then migrates it and the mirror's guard shuts.
if (
  isContainerRunning(LOCAL_CONTAINER) &&
  !isContainerRunning(`supabase_auth_${LOCAL_PROJECT_ID}`)
) {
  console.log(
    `${COMMAND} — stopping the Mode A database first; its data is kept, but Auth migrates it, so Mode A reopens only after yarn db:stop --no-backup`,
  );
  supabase(COMMAND, ["stop"]);
}
supabase(COMMAND, ["start"]);
await waitForDatabase(COMMAND);

const { url } = authSettings();
if (!url || !isLoopbackUrl(url)) {
  console.warn(
    `${COMMAND} — ${authUrlName()} does not point at this machine, so the app still signs in on hosted staging. For Mode B, set it and SUPABASE_SERVICE_ROLE_KEY_LOCAL from the API URL and service-role key above.`,
  );
}

console.log(
  `${COMMAND} — stack up, database at 127.0.0.1:${LOCAL_PORT} (Mode B); next: yarn db:migrate && yarn db:setup && yarn db:seed-users`,
);
