/**
 * The app's only process.env reader (codebase-conventions §5; D-STK-3, D-STK-4).
 * Everything else imports `env`. Each raw value is read once, below; the tier
 * switch picks every tiered value through @pem/env, and t3-env validates the
 * result once, when this module loads (next.config.ts imports it, so a bad
 * value fails the build).
 *
 * Client code may read only `env.NEXT_PUBLIC_*`. In a bundle, Next inlines
 * each NEXT_PUBLIC_* literal below from next.config.ts's env block, which holds
 * the collapsed value; a server value read in the browser throws.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { publicKeyProblem } from "@pem/auth/config";
import { keyModeProblem } from "@pem/env/key-mode";
import { nextPublicEnv } from "@pem/env/next-public";
import { pickTiered } from "@pem/env/pick";
import { isDeployed, resolveSiteUrl } from "@pem/env/site-url";
import { parseTier, TIERS } from "@pem/env/tier";

import { resolveSentryDsn } from "./lib/error-reporting/dsn";

/** This app's origin outside a deployment: the port `yarn web:dev` serves. */
const LOCAL_ORIGIN = "http://localhost:3000";

/** Every variable this app reads, and nothing else; each is in .env.example and turbo.json. */
const raw = {
  DATABASE_ENVIRONMENT: process.env.DATABASE_ENVIRONMENT,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
  EXAMPLE_API_KEY: process.env.EXAMPLE_API_KEY,
  EXAMPLE_API_KEY_LOCAL: process.env.EXAMPLE_API_KEY_LOCAL,
  EXAMPLE_API_KEY_STAGING: process.env.EXAMPLE_API_KEY_STAGING,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SITE_URL_LOCAL: process.env.NEXT_PUBLIC_SITE_URL_LOCAL,
  NEXT_PUBLIC_SITE_URL_STAGING: process.env.NEXT_PUBLIC_SITE_URL_STAGING,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_API_KEY_LOCAL: process.env.RESEND_API_KEY_LOCAL,
  RESEND_API_KEY_STAGING: process.env.RESEND_API_KEY_STAGING,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_LOCAL: process.env.EMAIL_FROM_LOCAL,
  EMAIL_FROM_STAGING: process.env.EMAIL_FROM_STAGING,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_API_KEY_LOCAL: process.env.ANTHROPIC_API_KEY_LOCAL,
  ANTHROPIC_API_KEY_STAGING: process.env.ANTHROPIC_API_KEY_STAGING,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_LOCAL: process.env.DATABASE_URL_LOCAL,
  DATABASE_URL_STAGING: process.env.DATABASE_URL_STAGING,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL_LOCAL: process.env.NEXT_PUBLIC_SUPABASE_URL_LOCAL,
  NEXT_PUBLIC_SUPABASE_URL_STAGING:
    process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_STAGING,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY_LOCAL: process.env.SUPABASE_SERVICE_ROLE_KEY_LOCAL,
  SUPABASE_SERVICE_ROLE_KEY_STAGING:
    process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_SECRET_KEY_LOCAL: process.env.STRIPE_SECRET_KEY_LOCAL,
  STRIPE_SECRET_KEY_STAGING: process.env.STRIPE_SECRET_KEY_STAGING,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_WEBHOOK_SECRET_LOCAL: process.env.STRIPE_WEBHOOK_SECRET_LOCAL,
  STRIPE_WEBHOOK_SECRET_STAGING: process.env.STRIPE_WEBHOOK_SECRET_STAGING,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_PRICE_ID_LOCAL: process.env.STRIPE_PRICE_ID_LOCAL,
  STRIPE_PRICE_ID_STAGING: process.env.STRIPE_PRICE_ID_STAGING,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN_LOCAL: process.env.NEXT_PUBLIC_SENTRY_DSN_LOCAL,
  NEXT_PUBLIC_SENTRY_DSN_STAGING: process.env.NEXT_PUBLIC_SENTRY_DSN_STAGING,
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_PROJECT_STAGING: process.env.SENTRY_PROJECT_STAGING,
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
};

const tier = parseTier(raw.DATABASE_ENVIRONMENT);

/** Whether this process runs in a Vercel deployment: derived from the platform, never set (D-STK-3). */
export const deployed = isDeployed(raw.VERCEL_ENV);

/**
 * Whether this process may be serving real users: a Vercel deployment, or any
 * production build (`next start`, another host), where VERCEL_ENV is absent.
 * A guard that must hold off Vercel reads this, not `deployed`.
 */
export const productionRuntime = deployed || raw.NODE_ENV === "production";

/** The site URL for this tier: localhost whenever the code runs outside a deployment. */
const siteUrl = resolveSiteUrl({
  deployed,
  configured: pickTiered(raw, "NEXT_PUBLIC_SITE_URL", tier),
  localOrigin: LOCAL_ORIGIN,
});

const supabaseUrl = pickTiered(raw, "NEXT_PUBLIC_SUPABASE_URL", tier);
const supabasePublishableKey = pickTiered(
  raw,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  tier,
);

/**
 * The webhook signing secret. Off a deployment, Stripe's events arrive through
 * `yarn stripe:listen`, which signs with its own secret whatever the tier, so
 * the local secret is picked; a deployment reads its tier's endpoint secret.
 */
const stripeWebhookSecret = deployed
  ? pickTiered(raw, "STRIPE_WEBHOOK_SECRET", tier)
  : raw.STRIPE_WEBHOOK_SECRET_LOCAL?.trim() || undefined;

/** The tier's own Sentry DSN, never another tier's (lib/error-reporting/dsn.ts). */
const sentryDsn = resolveSentryDsn(raw, tier);

/** The runtime Next compiled this bundle for: nodejs or edge on the server, undefined in the browser. */
export const nextRuntime = raw.NEXT_RUNTIME;

/**
 * What next.config.ts hands withSentryConfig at build. Source maps upload only
 * from a deployment holding the token, the org and the tier's project; any
 * other build, local and CI included, skips the upload and succeeds (STK-18
 * NN5). The release is the commit Vercel builds.
 */
export const errorReportingBuild = {
  deployed,
  authToken: raw.SENTRY_AUTH_TOKEN?.trim() || undefined,
  org: raw.SENTRY_ORG?.trim() || undefined,
  project: pickTiered(raw, "SENTRY_PROJECT", tier),
  release: raw.VERCEL_GIT_COMMIT_SHA?.trim() || undefined,
};

/** On the server the tier's picked value; in the browser the literal next.config.ts inlined. */
const isServer = typeof window === "undefined";

export const env = createEnv({
  server: {
    DATABASE_ENVIRONMENT: z.enum(TIERS),
    /**
     * A synthetic server-only secret: it proves the picker on a secret and
     * gives check-client-bundle a value to look for. The first vendor ticket
     * replaces it with a real key.
     */
    EXAMPLE_API_KEY: z.string().min(1).optional(),
    /** Resend's key (@pem/email). Optional: the local tier never sends, and a staging or production send without it throws. */
    RESEND_API_KEY: z.string().min(1).optional(),
    /**
     * The sending address, on a domain verified in Resend; @pem/brand's contact
     * address when unset. Resend validates the address; a format check here
     * would also reject check-client-bundle's sentinel value.
     */
    EMAIL_FROM: z.string().min(1).optional(),
    /**
     * Anthropic's key (@pem/ai). Optional: without it the local tier replays
     * the recorded fixtures and calls nothing, and anywhere else an AI call
     * throws, naming the variable.
     */
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    /**
     * The runtime database URL (@pem/db). The app opens it only for the local
     * auth mirror (Mode A, D-STK-6). No format check: check-client-bundle
     * plants a sentinel here, and @pem/db validates the URL when it connects.
     */
    DATABASE_URL: z.string().min(1).optional(),
    /** Supabase's service-role key (@pem/auth's admin client): bypasses RLS, so never a NEXT_PUBLIC_ name. */
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    /**
     * Stripe's secret key (lib/billing): a test key on local and staging, the
     * live key on production, read from its prefix (D-STK-4). Optional: without
     * it the app serves with billing off.
     */
    STRIPE_SECRET_KEY: z
      .string()
      .min(1)
      .optional()
      .superRefine((value, context) => {
        const problem =
          value && keyModeProblem("STRIPE_SECRET_KEY", value, tier);
        if (problem) context.addIssue({ code: "custom", message: problem });
      }),
    /** The webhook endpoint's signing secret (`whsec_...`); without it the webhook route answers 500 and logs why. */
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    /** The price the app sells, from the tier's own Stripe account (test prices on local and staging). */
    STRIPE_PRICE_ID: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
    /** The Supabase project's URL. Optional: without it and the key, the app serves signed out. */
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    /** The project's publishable key (or its legacy anon key): public by design, row-level security guards the data. A secret key here is refused, since it would reach every bundle. */
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
      .string()
      .min(1)
      .optional()
      .superRefine((value, context) => {
        const problem =
          value &&
          publicKeyProblem("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", value);
        if (problem) context.addIssue({ code: "custom", message: problem });
      }),
    /** The tier's Sentry DSN (STK-18): public by design, it only lets a client send events. Unset, nothing is reported. */
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    /** The tier, as Sentry's environment; env.ts derives it, so it is never set by hand. */
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.enum(TIERS).optional(),
  },
  runtimeEnv: {
    DATABASE_ENVIRONMENT: tier,
    EXAMPLE_API_KEY: pickTiered(raw, "EXAMPLE_API_KEY", tier),
    RESEND_API_KEY: pickTiered(raw, "RESEND_API_KEY", tier),
    EMAIL_FROM: pickTiered(raw, "EMAIL_FROM", tier),
    ANTHROPIC_API_KEY: pickTiered(raw, "ANTHROPIC_API_KEY", tier),
    DATABASE_URL: pickTiered(raw, "DATABASE_URL", tier),
    SUPABASE_SERVICE_ROLE_KEY: pickTiered(
      raw,
      "SUPABASE_SERVICE_ROLE_KEY",
      tier,
    ),
    STRIPE_SECRET_KEY: pickTiered(raw, "STRIPE_SECRET_KEY", tier),
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
    STRIPE_PRICE_ID: pickTiered(raw, "STRIPE_PRICE_ID", tier),
    // In the browser the tier is unknown, so the value next.config.ts inlined is the truth there.
    NEXT_PUBLIC_SITE_URL: isServer ? siteUrl : raw.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: isServer
      ? supabaseUrl
      : raw.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: isServer
      ? supabasePublishableKey
      : raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: isServer ? sentryDsn : raw.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: isServer
      ? tier
      : raw.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },
  emptyStringAsUndefined: true,
});

/** next.config.ts's env block: the collapsed NEXT_PUBLIC_* values, and only those. */
export const nextConfigEnv = nextPublicEnv({
  NEXT_PUBLIC_SITE_URL: siteUrl,
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
  // An empty string, not undefined: Next would otherwise inline a raw
  // NEXT_PUBLIC_SENTRY_DSN from .env.local, production's, into a local bundle.
  NEXT_PUBLIC_SENTRY_DSN: sentryDsn ?? "",
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: tier,
});
