# C5: a thrown error on staging appears in the staging project with the commit release

Handed to the operator: it needs the Sentry organization (US region, ratified 2026-10-04), its staging project and the staging deployment's settings.

## What the agent checked (2026-10-04, Next 16.3.8, @sentry/nextjs 11.0.0)

- On the local tier with no `_LOCAL` DSN, `/?state=error` rendered the error page ("This page failed to load", "Try again"), the logger printed `[app] render.failed` with the digest, and the browser sent nothing to any Sentry host.
- `resolveSentryDsn` reads only the tier's own variable; with only production's DSN set, staging resolves none (`lib/error-reporting/connect.test.ts`).
- `sentryBuildOptions` uploads and names the release (the commit SHA) only on a deployment with the token, the org and the project (`lib/error-reporting/build.test.ts`).
- `beforeSend` strips cookies, body, headers and query, and reduces the user to an id (`lib/error-reporting/scrub.test.ts`).

## Steps for the operator

1. In Sentry, create the organization in the **US** region. Create two Next.js projects, one for staging and one for production. Turn off session replay, performance and profiling in both. In each project's Security & Privacy settings, turn on "Prevent Storing of IP Addresses" (Sentry reads the client IP from the ingest request itself, which no code setting reaches) and the server-side data scrubber, and set event retention to the plan's minimum (90 days on the Team plan, unless the plan allows less). Write the retention set into the C5 record.
2. Create an organization auth token with the `project:releases` and `org:read` scopes.
3. In Vercel, for the Preview environment (staging): `DATABASE_ENVIRONMENT=staging`, `NEXT_PUBLIC_SENTRY_DSN_STAGING` (the staging project's DSN), `SENTRY_PROJECT_STAGING` (its slug), `SENTRY_ORG` and `SENTRY_AUTH_TOKEN`. For Production: `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_PROJECT` (the production project's), plus the same org and token.
4. Deploy a preview, and confirm in the build log that source maps uploaded.
5. Open `<preview URL>/?state=error`. It throws only on the staging tier's deployments and off a deployment; on production it renders the home page.

## What should be seen

- One or two events in the **staging** project (the server render error and the browser report), none in production's.
- Each event's release is the deployed commit's SHA, its environment is `staging`, and its stack trace shows `app/page.tsx` source lines.
- The event has no cookies, headers, request body or query string; its user, if any, is an id only.
- The browser's report went straight to the US ingest host (`*.ingest.us.sentry.io`): there is no tunnel route. An ad blocker may drop it; the server's event still arrives.
- An event's frames carry source lines but no local variables.
