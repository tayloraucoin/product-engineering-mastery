/**
 * The local database `yarn db:local` starts: the Supabase CLI's own Postgres
 * image (pinned by the CLI version in package.json), which carries the auth
 * schema and the anon, authenticated and service_role roles the policies
 * name. The project id is supabase/config.toml's, read here so it is written
 * once; the port and password are that file's and the CLI's defaults, and the
 * password is a synthetic local value.
 */

import { readFileSync } from "node:fs";

const configToml = readFileSync(
  new URL("../supabase/config.toml", import.meta.url),
  "utf8",
);
const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(configToml)?.[1];
if (!projectId) {
  throw new Error("packages/db/supabase/config.toml sets no project_id.");
}

export const LOCAL_PROJECT_ID = projectId;
export const LOCAL_CONTAINER = `supabase_db_${LOCAL_PROJECT_ID}`;
/** The container STK-9's `db:local` ran before the CLI; it holds the same port. */
export const LEGACY_CONTAINER = "pem-db-local";
export const LOCAL_PORT = 54322;
export const LOCAL_IMAGE_URL = `postgresql://postgres:postgres@127.0.0.1:${LOCAL_PORT}/postgres`;
