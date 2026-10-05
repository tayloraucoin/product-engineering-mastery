/**
 * Which Sentry project a tier reports to (STK-18 NN4). Unlike `pickTiered`,
 * a tier reads only its own variable and never falls back to production's:
 * staging without NEXT_PUBLIC_SENTRY_DSN_STAGING reports nothing rather than
 * into the production project, and the local tier sends nothing unless
 * NEXT_PUBLIC_SENTRY_DSN_LOCAL is set on purpose.
 */

import { tierName, type EnvSource } from "@pem/env/pick";
import type { Tier } from "@pem/env/tier";

export const SENTRY_DSN = "NEXT_PUBLIC_SENTRY_DSN";

/** The tier's own DSN, trimmed; undefined when unset or empty. */
export function resolveSentryDsn(
  source: EnvSource,
  tier: Tier,
): string | undefined {
  const value = source[tierName(SENTRY_DSN, tier)]?.trim();
  return value ? value : undefined;
}
