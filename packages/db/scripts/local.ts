/**
 * `yarn db:local`: Mode A of D-STK-6, the default. Starts the database
 * container only (`supabase db start`, with Supabase Auth switched off for
 * this run so its migrations never create auth.identities), then creates the
 * marker that opens the local auth mirror. Sign-in runs on hosted staging; the
 * mirror copies each signed-in user into this database. Reuses the container
 * when it exists. Needs Docker. Stop it with `yarn db:stop` (add `--no-backup`
 * to drop its data).
 */

import postgres from "postgres";

import { isLoopbackUrl } from "../src/loopback.ts";
import { authSettings, authUrlName } from "./env.ts";
import { markLocalAuthMirror } from "./local-auth-marker.ts";
import { LOCAL_CONTAINER, LOCAL_IMAGE_URL, LOCAL_PORT } from "./local-image.ts";
import {
  isPublishedBeyondLoopback,
  preflight,
  supabase,
  waitForDatabase,
} from "./supabase-cli.ts";

const COMMAND = "db:local";

preflight(COMMAND);
supabase(COMMAND, ["db", "start"], { SUPABASE_AUTH_ENABLED: "false" });
await waitForDatabase(COMMAND);

const client = postgres(LOCAL_IMAGE_URL, { max: 1, onnotice: () => {} });
try {
  const result = await markLocalAuthMirror(client);
  if (result === "auth-owned") {
    console.error(
      `${COMMAND} — this database was created by the full stack (Mode B): Supabase Auth owns its auth.users, so the mirror stays shut. To return to Mode A, run yarn db:stop --no-backup, then yarn db:local.`,
    );
    process.exitCode = 1;
  }
} finally {
  await client.end();
}

// The CLI publishes the port on every interface and has no setting for it.
if (isPublishedBeyondLoopback(LOCAL_CONTAINER, 5432)) {
  console.warn(
    `${COMMAND} — the database port ${LOCAL_PORT} is reachable from your network, password postgres, and in Mode A it holds mirrored staging emails. On a shared network, set "ip": "127.0.0.1" in Docker's daemon settings, then yarn db:stop and rerun.`,
  );
}

const { url } = authSettings();
if (url && isLoopbackUrl(url)) {
  console.warn(
    `${COMMAND} — ${authUrlName()} points at this machine (Mode B), but db:local starts no auth server; run yarn db:local:full instead, or point it at hosted staging.`,
  );
}

if (process.exitCode !== 1) {
  console.log(
    `${COMMAND} — ready at 127.0.0.1:${LOCAL_PORT} (Mode A: sign-in on staging, users mirrored here); next: yarn db:migrate && yarn db:setup`,
  );
}
