/**
 * The local database `yarn db:local` starts: the Supabase CLI's own Postgres
 * image (pinned by the CLI version in package.json), which carries the auth
 * schema and the anon, authenticated and service_role roles the policies
 * name. The project id, port and password are supabase/config.toml's and the
 * CLI's defaults; the password is a synthetic local value.
 */

export const LOCAL_PROJECT_ID = "pem";
export const LOCAL_CONTAINER = `supabase_db_${LOCAL_PROJECT_ID}`;
/** The container STK-9's `db:local` ran before the CLI; it holds the same port. */
export const LEGACY_CONTAINER = "pem-db-local";
export const LOCAL_PORT = 54322;
export const LOCAL_IMAGE_URL = `postgresql://postgres:postgres@127.0.0.1:${LOCAL_PORT}/postgres`;
