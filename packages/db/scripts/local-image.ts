/**
 * The local Supabase image `yarn db:local` runs: Supabase's own Postgres build,
 * which carries the auth schema and the anon, authenticated and service_role
 * roles the policies name. Its port is the Supabase CLI's local database port.
 * The password is a synthetic local value; the image is never exposed beyond
 * 127.0.0.1.
 */

export const LOCAL_IMAGE = "supabase/postgres:17.11.0.003";
export const LOCAL_CONTAINER = "pem-db-local";
export const LOCAL_PORT = 54322;
export const LOCAL_IMAGE_URL = `postgresql://postgres:postgres@127.0.0.1:${LOCAL_PORT}/postgres`;
