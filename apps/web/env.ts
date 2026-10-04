/**
 * The app's only process.env reader (codebase-conventions §5; D-STK-3, D-STK-4).
 * Everything else imports `env`. Each raw value is read once, below; the tier
 * switch picks every tiered value through @pem/env, and t3-env validates the
 * result once, when this module loads (next.config.ts imports it, so a bad
 * value fails the build).
 *
 * Client code may read only `env.NEXT_PUBLIC_*`. In a bundle, Next inlines
 * NEXT_PUBLIC_SITE_URL from next.config.ts's env block, which holds the
 * collapsed value; a server value read in the browser throws.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { nextPublicEnv } from "@pem/env/next-public";
import { pickTiered } from "@pem/env/pick";
import { isDeployed, resolveSiteUrl } from "@pem/env/site-url";
import { parseTier, TIERS } from "@pem/env/tier";

/** This app's origin outside a deployment: the port `yarn web:dev` serves. */
const LOCAL_ORIGIN = "http://localhost:3000";

/** Every variable this app reads, and nothing else; each is in .env.example and turbo.json. */
const raw = {
  DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
  VERCEL_ENV: process.env.VERCEL_ENV,
  EXAMPLE_API_KEY: process.env.EXAMPLE_API_KEY,
  EXAMPLE_API_KEY_LOCAL: process.env.EXAMPLE_API_KEY_LOCAL,
  EXAMPLE_API_KEY_STAGING: process.env.EXAMPLE_API_KEY_STAGING,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_URL_LOCAL: process.env.NEXT_PUBLIC_SITE_URL_LOCAL,
  NEXT_PUBLIC_SITE_URL_STAGING: process.env.NEXT_PUBLIC_SITE_URL_STAGING,
};

const tier = parseTier(raw.DATABASE_ENVIRONMENT);

/** The site URL for this tier: localhost whenever the code runs outside a deployment. */
const siteUrl = resolveSiteUrl({
  deployed: isDeployed(raw.VERCEL_ENV),
  configured: pickTiered(raw, "NEXT_PUBLIC_SITE_URL", tier),
  localOrigin: LOCAL_ORIGIN,
});

export const env = createEnv({
  server: {
    DATABASE_ENVIRONMENT: z.enum(TIERS),
    /**
     * A synthetic server-only secret: it proves the picker on a secret and
     * gives check-client-bundle a value to look for. The first vendor ticket
     * replaces it with a real key.
     */
    EXAMPLE_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
  },
  runtimeEnv: {
    DATABASE_ENVIRONMENT: tier,
    EXAMPLE_API_KEY: pickTiered(raw, "EXAMPLE_API_KEY", tier),
    // In the browser the tier is unknown, so the value next.config.ts inlined is the truth there.
    NEXT_PUBLIC_SITE_URL:
      typeof window === "undefined" ? siteUrl : raw.NEXT_PUBLIC_SITE_URL,
  },
  emptyStringAsUndefined: true,
});

/** next.config.ts's env block: the collapsed NEXT_PUBLIC_* values, and only those. */
export const nextConfigEnv = nextPublicEnv({
  NEXT_PUBLIC_SITE_URL: siteUrl,
});
