/**
 * Where the code runs (D-STK-3). It is derived from the platform, never set:
 * outside a deployment the site URL is localhost, whatever the tier says.
 */

/**
 * Whether the process runs in a deployment, from the platform's own
 * `VERCEL_ENV`: `production` and `preview` are deployments; `development`
 * (`vercel dev`, `vercel env pull`) and unset are not.
 */
export function isDeployed(platformEnv: string | undefined): boolean {
  return platformEnv === "production" || platformEnv === "preview";
}

/** The local origin when not deployed; otherwise the tier's configured URL, without a trailing slash. */
export function resolveSiteUrl(options: {
  deployed: boolean;
  configured: string | undefined;
  localOrigin: string;
}): string | undefined {
  if (!options.deployed) return options.localOrigin;
  return options.configured?.replace(/\/+$/, "");
}
