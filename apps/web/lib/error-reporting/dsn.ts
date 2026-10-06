/**
 * Which Sentry project a tier reports to and uploads into (STK-18 NN4).
 * Unlike `pickTiered`, a tier reads only its own variable and never falls
 * back to production's: staging without NEXT_PUBLIC_SENTRY_DSN_STAGING
 * reports nothing rather than into the production project, staging without
 * SENTRY_PROJECT_STAGING uploads nothing rather than into production's
 * release history, and the local tier sends nothing unless
 * NEXT_PUBLIC_SENTRY_DSN_LOCAL is set on purpose.
 */

import { tierName, type EnvSource } from "@pem/env/pick";
import type { Tier } from "@pem/env/tier";

export const SENTRY_DSN = "NEXT_PUBLIC_SENTRY_DSN";
export const SENTRY_PROJECT = "SENTRY_PROJECT";

/** `name`'s value for the tier's own form only, trimmed; undefined when unset or empty. */
function ownTierValue(
  source: EnvSource,
  name: string,
  tier: Tier,
): string | undefined {
  const value = source[tierName(name, tier)]?.trim();
  return value ? value : undefined;
}

/** The tier's own DSN. */
export function resolveSentryDsn(
  source: EnvSource,
  tier: Tier,
): string | undefined {
  return ownTierValue(source, SENTRY_DSN, tier);
}

/** The tier's own project slug, which the build uploads source maps into. */
export function resolveSentryProject(
  source: EnvSource,
  tier: Tier,
): string | undefined {
  return ownTierValue(source, SENTRY_PROJECT, tier);
}
