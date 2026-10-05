/**
 * What this app hands `@pem/api` (D-STK-8): who a request's cookie session
 * and a bearer token belong to, both through the one request seam, and the
 * RLS-scoped service context for a signed-in user. The runtime database
 * client is held here and in seeds only (`@pem/db/client`).
 */

import "server-only";

import type { ApiContextSources } from "@pem/api/server";
import { getDb } from "@pem/db/client";
import { createServiceContext } from "@pem/services/context";

import { env } from "../../env";
import { getAuthContext, getBearerAuthContext } from "../supabase/context";

function requireDb() {
  const url = env.DATABASE_URL;
  if (!url)
    throw new Error(
      "DATABASE_URL is not set for this tier (or its _LOCAL or _STAGING form); see .env.example.",
    );
  return getDb({ url, tier: env.DATABASE_ENVIRONMENT });
}

export const apiContextSources: ApiContextSources = {
  fromCookies: getAuthContext,
  fromBearer: getBearerAuthContext,
  serviceContextFor: (user) => createServiceContext(requireDb(), user),
};
