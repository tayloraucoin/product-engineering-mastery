File: `specs/_shared/epics/STK-default-stack/research/error-monitoring.md`

---

# Which error-monitoring tool should be the house default, given that product analytics is moving to PostHog?

## Answer

Sentry (`@sentry/nextjs` 11.x, hosted sentry.io, free Developer plan at launch) should be the house default, with PostHog kept as the analytics-side error guardrail rather than the error tracker of record. PostHog error tracking is cheaper at every scale (100,000 exceptions free per month against Sentry's 5,000) and already loaded,\[1\] but on 2026-10-03 its Next.js server side is a hand-written `onRequestError` hook that runs on the Node.js runtime only.\[2\]\[3\]\[4\] Its Turbopack source-map upload has open Next.js 16 defects,\[5\]\[6\]\[7\] and PostHog's own pricing page concedes advanced alerting, advanced grouping and mobile to Sentry.\[2\] Sentry covers server components, route handlers, server actions, `proxy.ts` and the edge runtime through `instrumentation.ts`, uploads Turbopack source maps after the build and deletes client maps by default,\[8\] and has the more mature React Native/Expo path for the app that arrives later.\[8\]\[9\] It also keeps the "internals fail loudly" lane off the analytics vendor's failure modes: ad-block lists, billing limits, outages and consent opt-out. The wiring is six app-level files plus one vendor-free seam in `@cc/observability`. Its env vars all carry `SENTRY` in the name, so removal is a grep. The cost is $0 at launch, $26/month (annual) or $29/month (monthly) once errors pass 5,000/month or a second person needs access, and about $413/month at 2,000,000 errors/month.\[4\]\[10\] Two privacy defaults bite: SDK v11, released 2026-09-23 according to the getsentry/sentry-javascript GitHub releases page, collects request bodies, cookies, user info and AI inputs/outputs unless `dataCollection` is set explicitly, and the org's data region is permanent once chosen. Taylor must rule on the region before the Technical stage creates the org.

**TL;DR**

- Recommend Sentry as the default error tracker. Keep PostHog `$exception` autocapture on the web client only as the product-side guardrail, and do not link the two SDKs.
- PostHog alone is not enough for this stack today. You would lose edge-runtime and automatic server capture, reliable Turbopack source maps, rule-based alerting, release health and native mobile maturity. Adding Sentry costs a second SDK, DPA, bill, quota and removal list.
- Kill Sentry if the monthly leak test finds personal data in an event, if it breaks a build or a user path, or if the free quota runs out on noise two months running. Revisit when the React Native app starts, when PostHog closes its server-capture and Turbopack gaps, on any Sentry pricing or ownership change, or on 2027-04-03.

## Evidence

### E1. Comparison as of 2026-10-03

Only Sentry and PostHog error tracking earned a place. The dismissed candidates are listed after the table.

| Dimension                                         | Sentry (`@sentry/nextjs` 11.x; `@sentry/react-native` 8.x)                                                                                                                                                                                                                                                                                           | PostHog error tracking (`posthog-js`, `posthog-node`, `@posthog/nextjs-config`, `posthog-react-native`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client errors (App Router)                        | `instrumentation-client.ts` init, `app/global-error.tsx` capture.\[9\] Verified 2026-10-03.                                                                                                                                                                                                                                                          | Autocapture toggled in project settings. `error.tsx` / `global-error.tsx` call `posthog.captureException`.\[3\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Server components, route handlers, server actions | `instrumentation.ts` exports `onRequestError = Sentry.captureRequestError` (needs `@sentry/nextjs` 8.28.0+ and Next.js 15+). Optional `withServerActionInstrumentation` wrapper.\[9\] Verified 2026-10-03.                                                                                                                                           | You write the `onRequestError` handler yourself with a `posthog-node` singleton, parse the PostHog cookie for `distinct_id`, and run it only when `NEXT_RUNTIME === 'nodejs'`. PostHog says backend autocapture cannot be relied on.\[3\]\[11\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `proxy.ts`                                        | Docs comment says `onRequestError` captures "Server Components, middleware, and proxies". The tunnel section names `proxy.ts` for Next.js 16+.\[9\] Docs have caught up with the rename. Verified 2026-10-03.                                                                                                                                        | Not addressed in the docs. Not found.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Edge runtime                                      | `sentry.edge.config.ts` is loaded when `NEXT_RUNTIME === 'edge'`.\[9\] Verified 2026-10-03.                                                                                                                                                                                                                                                          | Not supported in the documented pattern (Node.js only).\[3\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Turbopack (Next.js 16 default)                    | Manual setup page is written for "Next.js 15+ with Turbopack and App Router". Maps upload after the build; needs `@sentry/nextjs` 10.13.0+ and `next` 15.4.1+.\[8\]\[9\] Verified 2026-10-03.\[8\]                                                                                                                                                   | `@posthog/nextjs-config` uploads maps on Turbopack builds, with three open defects. First, a build-failing race: posthog-js PR #4691 says "Next.js 16.3+ can continue flushing Turbopack's filesystem cache after runAfterProductionCompile starts", so late chunks "can fail the production build with Chunk ID not found" (#4667). Second, posthog #93640 (`@posthog/nextjs-config` 1.10.0, `posthog-node` 5.34.1, Next.js 16.2.11) reports the innermost app server frames resolving to wrong positions. Third, posthog #70235 (posthog-cli 0.7.30 via `@posthog/nextjs-config` 1.9.68, Next.js 16.2.10 on Vercel) logs "~150 spurious WARNs per build" while "4,600+ real maps upload successfully". Secondary, GitHub issues read 2026-10-03. |
| Source maps on Vercel                             | `withSentryConfig` (imported from `@sentry/nextjs/config` in v11) plus `SENTRY_AUTH_TOKEN` at build. `deleteSourcemapsAfterUpload` defaults to true for client maps; server maps are kept. A Vercel integration is an alternative.\[8\]\[9\] Verified 2026-10-03.\[8\]\[12\]\[13\]                                                                   | `withPostHogConfig` plus `POSTHOG_API_KEY` (personal key with error-tracking write) and `POSTHOG_PROJECT_ID`. `deleteAfterUpload` defaults to true; upload is off in `next dev`.\[11\] Verified 2026-10-03 (tutorial dated 2025-03-18, page shows `defaults: '2026-05-30'`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| React Native / Expo                               | `@sentry/react-native` with the `@sentry/react-native/expo` config plugin and `getSentryExpoConfig` Metro. EAS Build uploads automatically; EAS Update needs `npx sentry-expo-upload-sourcemaps dist`. Hermes map composition is documented.\[14\]\[15\]\[16\] Verified 2026-10-03. Open EAS upload defects #6048 and #4961 (secondary).\[17\]\[18\] | `posthog-react-native` with the `posthog-react-native/expo` plugin; EAS Build uploads automatically; EAS Update needs `posthog-cli hermes upload --directory dist`.\[19\] Native crash autocapture needs `posthog-react-native` 4.78.0 and `@posthog/react-native-plugin` 2.12.0. The Android NDK crash fix merged 2026-09-22 (#5062). The install page still lists "No native Android and iOS exception capture".\[20\] Verified and secondary, 2026-10-03.\[19\]\[20\]\[21\]\[22\]                                                                                                                                                                                                                                                               |
| Alerting                                          | Developer (free): "Alerts and notifications via email". Team: "API & third-party integrations" (Slack and others). 20 metric monitors on Developer and Team.\[4\] Verified 2026-10-03.                                                                                                                                                               | Issue created or reopened goes to Slack, Discord, Teams or webhook. Spike alerts compare against a historical baseline. Free plan: 2 alerts; pay-as-you-go: unlimited (house is on pay-as-you-go). PostHog: "We currently only support Slack and email alerts on custom criteria."\[2\]\[23\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Release and environment tagging                   | `release` and `environment` are SDK init options. Release Health and Suspect Commits are listed on the pricing page.\[4\] Verified 2026-10-03 (pricing page feature rows).                                                                                                                                                                           | Release comes from source-map injection (defaults to the git commit). "captured exceptions inherit the release information recorded during injection".\[24\] No first-class environment field found. Verified 2026-10-03 via subagent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Issue grouping                                    | Automatic grouping. Ownership rules and Code Owners on the pricing page.\[4\] Verified 2026-10-03.                                                                                                                                                                                                                                                   | Custom grouping rules, merge, and `$exception_fingerprint`.\[25\] Verified 2026-10-03 via subagent. PostHog itself lists "Advanced error grouping systems" as a reason to choose a competitor.\[2\]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Free allowance                                    | Developer: 5k errors, 1 user, unlimited projects, 30-day lookback, email alerts.\[4\] Verified 2026-10-03.\[26\]                                                                                                                                                                                                                                     | 100,000 exceptions per month, no per-seat charge.\[2\] Verified 2026-10-03.\[1\]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| At quota                                          | Over reserved volume plus pay-as-you-go budget: "will be dropped and you won't be charged". Developer must upgrade to raise its quota.\[27\]\[28\] Verified 2026-10-03.                                                                                                                                                                              | Billing limit per product; a billing limit can be set "and never get an unexpected bill".\[2\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| First paid step                                   | Team: $26/month billed annually ($29/month monthly per Sentry's Stripe Projects post). 50k errors, unlimited users.\[26\] Pay-as-you-go $0.0003625 per error for 50k to 100k.\[4\]\[10\] Verified 2026-10-03.                                                                                                                                        | $0.000370 per exception for 100k to 325k, $0.000140 for 325k to 10M, $0.000115 above 10M.\[2\] Verified 2026-10-03.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Data region                                       | US or EU (Frankfurt), chosen at org creation: "The only way to switch it is by creating a new organization."\[29\]\[30\] Verified 2026-10-03. Known defect: EU org tokens resolve to sentry.io\[31\] for CLI upload (getsentry #116550, secondary).\[31\]                                                                                            | US (Virginia) or EU (Frankfurt), already settled 2026-09-30. Expo's connect flow says the region "can't be changed after connecting"\[19\] (verified 2026-10-03).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Considered and dismissed (all read 2026-10-03):

- **Vercel built-in observability.** Runtime logs are kept 1 hour on Hobby and 1 day on Pro. 30 days needs Observability Plus.\[32\]\[33\] There is no client-side error capture or issue workflow. It stays as the fallback rung, not a tracker. Verified on vercel.com/docs/logs/runtime.
- **Highlight.io.** Standalone services ended 2026-02-28 and it was folded into LaunchDarkly Observability.\[34\] Verified on highlight.io's migration post.
- **Bugsnag / SmartBear Insight Hub.** Free tier is 1 user, 7.5k events and 7-day retention.\[35\]\[36\] Rebranded twice, and it has no advantage over Sentry for Next.js depth.\[37\]\[38\] Free tier verified on smartbear.com; the rest is judgment.
- **GlitchTip.** GlitchTip's own launch post (glitchtip.com, 2020-07-15) says "Paid plans start at $15/month" and offers "1000 events/month for free", "compatible with the Sentry SDK". The current hosted tiers (whichdevtool.com; Bugsink's September 2026 comparison) are Free at 1k events, Small at $15 for 100k, Medium at $50 for 500k and Large at $250 for 3M, all with unlimited members. Bugsink notes GlitchTip "stops accepting [events] at twice the quota". It accepts Sentry SDKs, so it is the exit path, not the default.\[1\]\[39\]\[40\] Secondary.
- **Rollbar, Better Stack, Honeybadger, AppSignal.** Not evaluated against primary sources (see Not found). Dismissed on judgment: none beats the two incumbents by a margin that pays for a third vendor.
- **Expo/EAS-native crash tooling.** Expo's docs send error reporting to Sentry, BugSnag or PostHog guides; there is no first-party crash product.\[19\] Verified on docs.expo.dev.

### E2. Is PostHog error tracking enough on its own?

Not for this stack today. A dedicated tool earns its second vendor, by a real but narrow margin. This is a judgment, based on the verified rows above.

**What PostHog-only would lose today:**

- **Automatic server capture.** The server side is a hand-copied `onRequestError` with cookie parsing that agents must reproduce correctly in every product.\[3\]\[11\]
- **Edge-runtime capture.**
- **Reliable Turbopack source maps on Next.js 16.** This is the default bundler, and one open defect fails the build.\[7\]
- **Rule-based alerting beyond created, reopened and spike.**
- **A first-class environment field.** You would need a custom property convention.
- **Release Health and suspect commits.**
- **Mature native mobile crash capture.** PostHog's own page: "Even our team thinks Sentry is better if you need mobile support."\[2\]
- **Independence from analytics.** Error capture would share every PostHog failure mode: the ad-block lists the house reverse proxy only partly defeats, PostHog outages, the PostHog billing limit, and analytics consent. If a visitor opts out of analytics capture, their exceptions disappear with it. Separating these is the Millwright ladder rule.

**What Sentry plus PostHog costs:**

- A second browser SDK. Sentry's own release bundle-size tables put `@sentry/nextjs` (client) at 52.03 KB at 11.0.0-alpha.1 and 52.63 KB at 11.0.0-beta.1; the 11.0.0 GA figure was not confirmed.
- A second DPA and data flow for Warden to rule on.
- 7 to 9 env vars and about 12 removal steps.
- A second bill and quota to watch, with a hard cliff at 5k errors/month on free.
- A second region decision that cannot be undone.\[30\]
- Duplicated user context.
- The one-pane link between an exception and its PostHog session replay. An official bridge exists (`posthog.sentryIntegration`, posthog-js 1.118.0+), but it couples the two SDKs in one file and needs PostHog exception autocapture turned off.\[41\] It is not recommended for the starter.
- A fresh agent-fluency risk. v11 moved `withSentryConfig` to `@sentry/nextjs/config` and removed `sendDefaultPii` 10 days ago, so agents trained on v8 to v10 will write stale setup (`sentry.client.config.ts`, `sendDefaultPii: true`).\[12\]\[42\] Sentry's own docs PR says Turbopack "ignores silently" the old client config file.\[43\]\[44\]

**Quartermaster exception, written:** error tracking and product analytics are separate categories. The second vendor is justified because the error lane must not share a failure mode with the analytics lane, and because the later React Native app needs native crash capture where PostHog concedes Sentry is stronger. PostHog `$exception` stays as the analytics guardrail only.

### E3. Minimum wiring (recommended tool: Sentry)

The seam is vendor-free and stays on removal. In `packages/observability/src/error-reporter.ts` [PROPOSED], an `ErrorReporter` interface (`captureException(error, { tags, extra, userId })`) sits beside `registerErrorReporter(reporter)` and a default no-op reporter. `createLogger(...).error(message, { error })` calls the registered reporter after writing to the console. The console write is what Vercel runtime logs show when Sentry is absent. Nothing in `packages/` imports a vendor.

| File (all in `apps/web/` unless noted)              | Role                                                                                                                                                                                                                                                                                                                                | Imports `@sentry/nextjs`? |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `packages/observability/src/error-reporter.ts`      | Vendor-free seam; stays on removal                                                                                                                                                                                                                                                                                                  | No                        |
| `lib/error-reporting/sentry-options.ts`             | Shared init options and scrubbing (the config sketch below)                                                                                                                                                                                                                                                                         | Types only                |
| `lib/error-reporting/sentry-reporter.ts`            | Adapter implementing `ErrorReporter` via `Sentry.captureException`; the only place logger errors reach the SDK                                                                                                                                                                                                                      | Yes                       |
| `instrumentation-client.ts`                         | Client `Sentry.init(sentryOptions())` plus `registerErrorReporter(sentryReporter)`                                                                                                                                                                                                                                                  | Yes                       |
| `sentry.server.config.ts` / `sentry.edge.config.ts` | Node and edge `Sentry.init`, plus registration                                                                                                                                                                                                                                                                                      | Yes                       |
| `instrumentation.ts`                                | `register()` imports the server or edge config by `NEXT_RUNTIME`; `export const onRequestError = Sentry.captureRequestError`                                                                                                                                                                                                        | Yes                       |
| `next.config.ts` (edit)                             | Wrap with `withSentryConfig` from `@sentry/nextjs/config`: `org`, `project`, `authToken`, `tunnelRoute: "/monitoring"`, `silent: !process.env.CI`, `sourcemaps.deleteSourcemapsAfterUpload: true`, `automaticVercelMonitors: false`. Inject `NEXT_PUBLIC_SENTRY_ENVIRONMENT` and `NEXT_PUBLIC_SENTRY_RELEASE` into the `env` block. | Yes                       |
| `proxy.ts` (edit)                                   | Exclude `/monitoring` from the matcher, as Sentry's docs direct\[9\]                                                                                                                                                                                                                                                                | No                        |
| `app/global-error.tsx` (edit or create)             | Calls the house logger's `error()`, never Sentry directly                                                                                                                                                                                                                                                                           | No                        |
| `lib/env/env.ts` (edit)                             | t3-env + zod: optional client `NEXT_PUBLIC_SENTRY_DSN`; optional server/build `SENTRY_*`                                                                                                                                                                                                                                            | No                        |

Do not run the wizard in the starter. It adds `/sentry-example-page`, `.env.sentry-build-plugin` and tracing, replay and logs defaults.\[45\] Do not wrap server actions with `withServerActionInstrumentation`: its documented `formData` and `recordResponse` options attach user input.\[9\] `onRequestError` already catches server errors. That last point is judgment; see Not found.

Environment variables. Tier suffix grammar: `_LOCAL`, `_STAGING`, unsuffixed means production.

| Variable                                                                                              | Exposure                                                        | Tiers                                                         | Notes                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN_STAGING`, `NEXT_PUBLIC_SENTRY_DSN_LOCAL` (optional) | Public (DSNs are public by design)                              | Resolved by `resolve-tier-env.ts`; local is absent by default | Absent DSN means the SDK is disabled                                             |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT`                                                                      | Public, derived in `next.config.ts` from `DATABASE_ENVIRONMENT` | Not set by hand                                               | `staging` or `production`                                                        |
| `NEXT_PUBLIC_SENTRY_RELEASE`                                                                          | Public, derived from `VERCEL_GIT_COMMIT_SHA`                    | Not set by hand                                               | [ASSUMPTION: Vercel exposes `VERCEL_GIT_COMMIT_SHA` at build on all deployments] |
| `SENTRY_ORG`                                                                                          | Build-time, not secret                                          | One value                                                     | Could be a literal instead                                                       |
| `SENTRY_PROJECT`, `SENTRY_PROJECT_STAGING`                                                            | Build-time, not secret                                          | Per tier                                                      | Selects the upload target                                                        |
| `SENTRY_AUTH_TOKEN`                                                                                   | Build-time secret, never `NEXT_PUBLIC_`                         | Vercel Production and Preview scopes only                     | Org token with upload scope; absent locally                                      |

`turbo.json`: add the DSN, `SENTRY_ORG` and `SENTRY_PROJECT*` to `globalEnv`, and `SENTRY_AUTH_TOKEN` to `globalPassThroughEnv`. That way the secret reaches the build without entering the cache key (judgment). Fix the existing `globalEnv` drift in the same change.

Captured by default with the sketch below: unhandled client errors and rejections, server and edge request errors through `onRequestError`, React render errors through `global-error.tsx`, and errors passed to `logger.error`. Deliberately not configured: tracing (no `tracesSampleRate`), Session Replay, Sentry Logs, feedback, profiling, cron and uptime monitors, and Seer.

Scrubbing:

- **v11 defaults.** v11 turns on `userInfo`, `cookies`, `httpHeaders`, `httpBodies`, `urlQueryParams`, `genAI`, `databaseQueryData` and `stackFrameVariables` "when dataCollection is not set".\[44\]\[46\] Verified 2026-10-03, Sentry's v10-to-v11 migration guide.\[42\]\[47\]
- **Explicit `dataCollection`.** The sketch sets every category explicitly. `genAI: false` matters because one product runs the Vercel AI SDK. `stackFrameVariables: false` keeps local variables out.
- **`beforeSend`.** Strips cookies, the request body, headers and query strings, and reduces `user` to an opaque `id`.
- **`beforeBreadcrumb`.** Drops console breadcrumbs, which Sentry documents may contain PII, and strips query strings from URLs.\[48\]
- **Key-name denylist.** It "always filters sensitive values whose keys match a built-in denylist, such as `auth` or `password`".\[9\] Sentry calls the match "best effort". Verified 2026-10-03.\[47\]
- **Server side.** [PROPOSED] Turn on the project's server-side data scrubbing and IP-address storage prevention. Settings were not re-verified in this pass.
- **User context.** `setUser({ id })` with the opaque house user ID only, never email.

```ts
// apps/web/lib/error-reporting/sentry-options.ts -- sketch, synthetic values only
import type { BrowserOptions, NodeOptions } from "@sentry/nextjs";

import { env } from "@/lib/env/env";

const QUERY = /\?.*$/;

export function sentryOptions(): BrowserOptions & NodeOptions {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN; // e.g. "https://publickey0000@o0.ingest.example.invalid/0"; undefined on local
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT, // "staging" | "production"
    release: env.NEXT_PUBLIC_SENTRY_RELEASE, // commit SHA, e.g. "0000000example"
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      genAI: false,
      stackFrameVariables: false,
    }, // value shapes to be confirmed against the v11 dataCollection reference
    beforeBreadcrumb(crumb) {
      if (crumb.category === "console") return null;
      if (typeof crumb.data?.url === "string")
        crumb.data.url = crumb.data.url.replace(QUERY, "");
      return crumb;
    },
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.query_string;
        event.request.headers = {};
        if (event.request.url)
          event.request.url = event.request.url.replace(QUERY, "");
      }
      event.user = event.user?.id ? { id: String(event.user.id) } : undefined;
      return event;
    },
  };
}
```

When Sentry is unreachable, slow or blocked: the SDK sends asynchronously and the app never awaits it on a user path. The adapter wraps calls in try/catch and swallows failures. The house logger has already written to the console, so Vercel runtime logs remain the fallback rung (1 hour on Hobby, 1 day on Pro).\[33\] [PROPOSED] Turn the tunnel on (`tunnelRoute: "/monitoring"`) to survive ad blockers.\[49\] Its cost on Vercel is one function invocation per client error envelope, which is negligible at early traffic. Sentry warns it "increases server load".\[9\] Whether server-side flushing delays error responses in Vercel functions was not found.

### E4. Three-tier behaviour

| Tier (`DATABASE_ENVIRONMENT`)                   | DSN                                                                                                                         | Sentry project              | `environment` tag                                    | Release    | Source maps                                | Alerts                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- | ---------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `local`                                         | None by default, so nothing is sent. Optional `NEXT_PUBLIC_SENTRY_DSN_LOCAL` points at the developer's own sandbox project. | None                        | none                                                 | none       | Never (no token)                           | None                                                                |
| `staging`, including Vercel Preview deployments | `NEXT_PUBLIC_SENTRY_DSN_STAGING`                                                                                            | `web-staging` [PROPOSED]    | `staging`, plus tag `vercel_env=preview` on previews | Commit SHA | Uploaded (token in Preview scope)          | No alert rules; delete any default rule the project is created with |
| `production`                                    | `NEXT_PUBLIC_SENTRY_DSN`                                                                                                    | `web-production` [PROPOSED] | `production`                                         | Commit SHA | Uploaded, client maps deleted after upload | See E6                                                              |

Separate projects rather than one project with environment tags mirrors the house PostHog ruling that staging events go to a separate project. It makes "staging never pages" structural rather than a filter, and keeps staging source maps and spike protection apart. Quota is still org-wide, so a staging error loop can eat the production allowance.\[50\] Client-side rate limiting is the mitigation. [NEEDS DECISION] Recommended default: separate projects. A second developer runs locally with no Sentry account, DSN or token. The adapter registers only when a DSN resolves, and the build skips upload without a token. [ASSUMPTION: `withSentryConfig` without `authToken` warns and skips upload rather than failing the build; confirm on first local `next build`]

### E5. Removal checklist (an agent executes it; verify with `grep -ri sentry` returning nothing, then `yarn verify`)

| #     | Item                                                                        | Action                                                                                                                 |
| ----- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1     | `apps/web/instrumentation-client.ts`                                        | Delete the Sentry init and registration; delete the file if PostHog does not also use it                               |
| 2     | `apps/web/instrumentation.ts`                                               | Delete the Sentry `register` imports and `onRequestError`; delete the file if nothing else remains                     |
| 3     | `apps/web/sentry.server.config.ts`, `apps/web/sentry.edge.config.ts`        | Delete                                                                                                                 |
| 4     | `apps/web/lib/error-reporting/` (`sentry-options.ts`, `sentry-reporter.ts`) | Delete the directory                                                                                                   |
| 5     | `apps/web/next.config.ts`                                                   | Remove the `withSentryConfig` wrapper and import, and the `NEXT_PUBLIC_SENTRY_*` env-block entries                     |
| 6     | `apps/web/proxy.ts`                                                         | Remove `monitoring` from the matcher exclusion                                                                         |
| 7     | `apps/web/lib/env/env.ts` and `resolve-tier-env.ts`                         | Remove the `NEXT_PUBLIC_SENTRY_DSN*` and `SENTRY_*` entries                                                            |
| 8     | `.env.example` / `.env.local`                                               | Remove `NEXT_PUBLIC_SENTRY_DSN`, `_STAGING`, `_LOCAL`, `SENTRY_ORG`, `SENTRY_PROJECT`, `_STAGING`, `SENTRY_AUTH_TOKEN` |
| 9     | `turbo.json`                                                                | Remove the same names from `globalEnv` and `SENTRY_AUTH_TOKEN` from `globalPassThroughEnv`                             |
| 10    | `apps/web/package.json`                                                     | `yarn workspace web remove @sentry/nextjs`; confirm the lockfile no longer contains `@sentry/`                         |
| 11    | Boundaries lint config                                                      | Remove the `@sentry/nextjs` third-party SDK owner entry                                                                |
| 12    | Vercel project settings                                                     | Delete the Sentry env vars from all scopes; confirm no Sentry Vercel integration is installed                          |
| 13    | Sentry (vendor side)                                                        | Revoke the org auth token; delete the projects, alert rules and org; record DPA termination                            |
| Stays | `packages/observability/src/error-reporter.ts`, `global-error.tsx`          | Vendor-free; the no-op reporter takes over                                                                             |

Later, when the React Native app arrives: `@sentry/react-native` in the mobile app, the `@sentry/react-native/expo` plugin entry in the app config, `metro.config.js` built on `getSentryExpoConfig`, `EXPO_PUBLIC_SENTRY_DSN` and its `_STAGING` sibling, the `SENTRY_AUTH_TOKEN` EAS secret, the `sentry-expo-upload-sourcemaps dist` step after `eas update` in CI,\[14\]\[51\] a `mobile-*` Sentry project pair, and a boundaries entry pinning `@sentry/react-native` to the mobile app. Removal reverses each one.

### E6. Recommendation, cost, alerts, kill and revisit

**Recommendation:** Sentry, because it is the only candidate that covers every Next.js 16 server surface and Turbopack source maps without hand-written glue, and it keeps error capture off the analytics vendor's failure modes.

Cost. [ASSUMPTION: about 1,000 errors/month at launch, 20,000 at the first thousand customers, 2,000,000 at a hundred times that; errors only, no tracing, replay or logs]

| Scale                             | Sentry                                                                             | PostHog error tracking (comparison)                  |
| --------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Launch (1k/month)                 | $0 (Developer)                                                                     | $0                                                   |
| First 1,000 customers (20k/month) | $26/month annual or $29/month monthly (Team; 5k free cap exceeded)\[4\]\[10\]      | $0                                                   |
| 100x (2M/month)                   | $26 + $18.13 + $87.52 + $281.25 = about $413/month (Team pay-as-you-go tiers)\[4\] | 100k free + $83.25 + $234.50 = about $318/month\[2\] |

Pricing cliffs:

- **Free cap.** On Developer, error 5,001 onward is dropped for the rest of the month. That is silent loss, not a bill.\[28\]
- **Upgrade trigger.** Team becomes necessary the day a second person needs Sentry access, because Developer allows 1 user.\[4\]\[26\]
- **Business pricing.** The jump to Business reprices pay-as-you-go retroactively mid-cycle.\[27\]

**Blast radius and way back:** the blast radius is build-time (a source-map upload failure) and privacy (an over-collecting init). Runtime is not affected. The way back is checklist E5, roughly one agent session. The Sentry SDK protocol also lets GlitchTip receive the same events by changing the DSN (secondary), which caps exit cost.\[39\]\[40\]\[52\]

**Degradation rung:** non-critical and silent. If Sentry is down or blocked, users see nothing different. Errors still reach Vercel runtime logs through the house logger.

**Alert list for one person who also needs to sleep:**

- **Pages:** nothing at launch. Developer is email-only and uptime is out of scope.
- **Email per occurrence:** production new issue, and production regression of a resolved issue.
- **Email digest:** production issue frequency above 50 events in 1 hour [PROPOSED threshold].
- **Billing:** Owner quota-approach emails, which are automatic.\[27\]
- **Staging:** no rules.

When Team is bought, route only the production spike rule to a phone channel; everything else stays email.

**Kill criterion:** remove or replace Sentry as the default if any one of these happens:

- the monthly leak test finds personal data, request bodies, cookies or auth headers in any Sentry event;
- the wiring causes a failed production build or a user-visible error that would not otherwise occur;
- the free quota is exhausted two months running while fewer than 5 actionable issues are opened.

**Revisit trigger:**

- the React Native app starts (re-score mobile, where Sentry is expected to hold);
- PostHog ships automatic Next.js server capture including edge, and closes posthog-js #4667 and posthog #93640;
- any Sentry pricing, licence or ownership change, or a change to the Developer plan;
- the 5k quota is hit;
- a second developer joins;
- otherwise on 2027-04-03.

**Runner-up:** PostHog-only, and the margin is close. It flips if Taylor rules that a second vendor is not acceptable before launch, or if the PostHog defects above close. It also flips if no product in the next six months uses edge runtime or ships a mobile app.

**Decisions for Taylor:**

- [NEEDS DECISION — BLOCKING] Sentry data region (US or EU, permanent per org). Recommended default: the same region as the PostHog project. If EU, check the EU org-token upload defect (getsentry #116550) on the first deploy.\[31\]
- [NEEDS DECISION] SDK major. Recommended default: `@sentry/nextjs` 11.x, because the current docs are v11-only. Pin the exact version after `npm view`. The getsentry/sentry-javascript GitHub releases page already lists 11.3.0 after 11.0.0 (23 Sep), which supports a third-party PR's report of 11.4 over the npm snippet showing 11.0.0.
- [NEEDS DECISION] Separate staging and production projects. Recommended default: yes.
- [NEEDS DECISION] Keep PostHog client `$exception` autocapture as the event-plan guardrail without `posthog.sentryIntegration`. Recommended default: yes.
- [NEEDS DECISION] Tunnel route on. Recommended default: yes.

### E7. Evidence ledger

| Claim                                                                                                                                                                                                        | Source (dated)                                                                                                                         | Label                | Note                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------ |
| Sentry Developer: $0, 1 user, 5k errors, email alerts, MCP access, 30-day lookback; Team $26/month (annual), unlimited users, integrations, 50k errors\[4\]                                                  | https://sentry.io/pricing/ read 2026-10-03                                                                                             | verified             | Annual price shown                                     |
| Team monthly $29, Business $89\[10\]                                                                                                                                                                         | https://blog.sentry.io/sentry-stripe-projects/ read 2026-10-03                                                                         | verified             | Vendor blog, undated in fetch                          |
| Error pay-as-you-go tiers $0.0003625 / $0.0002188 / $0.0001875 / $0.0001625 / $0.00015\[28\]                                                                                                                 | https://docs.sentry.io/pricing/ read 2026-10-03                                                                                        | verified             | Team pay-as-you-go                                     |
| Data over quota and budget "will be dropped and you won't be charged"\[28\]                                                                                                                                  | https://docs.sentry.io/pricing/ read 2026-10-03                                                                                        | verified             |                                                        |
| Developer must upgrade to raise quota; Owners get quota emails\[27\]                                                                                                                                         | https://docs.sentry.io/pricing/quotas/manage-event-stream-guide/ read 2026-10-03                                                       | verified             | Snippet                                                |
| Next.js setup: Next 14+, Node 20.19.0+, `instrumentation-client.ts`, server and edge configs, `onRequestError` (8.28.0+, Next 15), `global-error.tsx`, `@sentry/nextjs/config` import, `proxy.ts` named\[9\] | https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup read 2026-10-03                                                 | verified             | v11-era page                                           |
| Turbopack upload after build needs 10.13.0+ and next 15.4.1+; client maps deleted by default\[8\]                                                                                                            | https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps read 2026-10-03                                                   | verified             | Via subagent fetch                                     |
| v11 `dataCollection` defaults collect bodies, cookies, user info, genAI and DB data\[46\]\[47\]                                                                                                              | https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v10-to-v11/ read 2026-10-03                                        | verified             |                                                        |
| `@sentry/nextjs` 11.0.0 released 2026-09-23\[46\] ("sentry-release-bot released this 23 Sep 12:43 — 11.0.0")                                                                                                 | getsentry/sentry-javascript GitHub Releases page read 2026-10-03                                                                       | verified             | Release list also shows 11.3.0                         |
| Sentry region US or EU, fixed at org creation\[30\]                                                                                                                                                          | https://docs.sentry.io/organization/data-storage-location/ read 2026-10-03                                                             | verified             |                                                        |
| EU org tokens resolve to sentry.io                                                                                                                                                                           | github.com/getsentry/sentry issue #116550 read 2026-10-03                                                                              | secondary            | Open issue                                             |
| Expo + Sentry: EAS Build auto upload; EAS Update needs `sentry-expo-upload-sourcemaps dist`\[14\]\[15\]                                                                                                      | https://docs.expo.dev/guides/using-sentry/ and https://docs.sentry.io/platforms/react-native/sourcemaps/uploading/expo read 2026-10-03 | verified             |                                                        |
| Sentry EAS upload defects\[17\]\[18\]                                                                                                                                                                        | getsentry/sentry-react-native #6048, #4961 read 2026-10-03                                                                             | secondary            |                                                        |
| PostHog error tracking: 100k free; $0.000370 / $0.000140 / $0.000115; 2 alerts free, unlimited on pay-as-you-go; "Even our team thinks Sentry is better if you need mobile support"\[2\]                     | https://posthog.com/error-tracking/pricing read 2026-10-03                                                                             | verified             | Competitor self-comparison used for feature facts only |
| PostHog Next.js server capture is manual `onRequestError` with `posthog-node`, Node.js runtime only\[3\]                                                                                                     | https://posthog.com/docs/error-tracking/installation/nextjs read 2026-10-03                                                            | verified             |                                                        |
| "we can't rely on exception autocapture" for Next.js backend; `@posthog/nextjs-config` with `deleteAfterUpload` true\[11\]                                                                                   | https://posthog.com/tutorials/nextjs-error-monitoring read 2026-10-03 (dated 2025-03-18)                                               | verified             |                                                        |
| PostHog Turbopack defects on Next.js 16\[5\]\[6\]\[7\]                                                                                                                                                       | posthog-js #4667/#4691; posthog #93640, #70235 read 2026-10-03                                                                         | secondary            | Open at read time                                      |
| `@posthog/nextjs-config` 1.5.1 shipped malware (Shai-Hulud 2.0, 2025-11-24)\[53\]                                                                                                                            | GitLab advisory GMS-2025-231 via subagent, 2026-10-03                                                                                  | secondary            | Supply-chain history; pin versions                     |
| PostHog alerts: Slack, Discord, Teams, webhook on created/reopened; spike alerts\[23\]                                                                                                                       | https://posthog.com/docs/error-tracking/alerts read 2026-10-03                                                                         | verified             |                                                        |
| PostHog release from source-map injection; grouping rules and `$exception_fingerprint`\[24\]\[54\]                                                                                                           | posthog.com/docs/error-tracking/releases and /grouping-issues via subagent, 2026-10-03                                                 | verified             | No environment field found                             |
| PostHog-Sentry bridge `posthog.sentryIntegration` (1.118.0+); disable PostHog autocapture when used\[41\]                                                                                                    | https://posthog.com/docs/libraries/sentry read 2026-10-03                                                                              | verified             |                                                        |
| PostHog RN native crashes need 4.78.0 plus plugin 2.12.0; Android NDK fix 2026-09-22\[21\]\[22\]                                                                                                             | posthog.com/docs/libraries/react-native; posthog-js PR #5062 read 2026-10-03                                                           | verified / secondary | Install page still says no native capture\[20\]        |
| PostHog Expo: region fixed at connect; EAS Update needs `posthog-cli hermes upload`\[19\]                                                                                                                    | https://docs.expo.dev/guides/using-posthog/ read 2026-10-03                                                                            | verified             |                                                        |
| Vercel runtime logs: 1 hour Hobby; 30 days with Observability Plus\[32\]                                                                                                                                     | https://vercel.com/docs/logs/runtime read 2026-10-03                                                                                   | verified             |                                                        |
| Highlight.io standalone ended 2026-02-28\[34\]                                                                                                                                                               | nodejs.highlight.io/blog/launchdarkly-migration read 2026-10-03                                                                        | verified             |                                                        |
| Bugsnag free: 1 user, 7.5k events, 7-day retention\[35\]\[36\]                                                                                                                                               | https://smartbear.com/insight-hub/pricing/ read 2026-10-03                                                                             | verified             |                                                        |
| GlitchTip hosted: 1k free, $15 for 100k, $50 for 500k, $250 for 3M; Sentry-SDK compatible                                                                                                                    | glitchtip.com blog (2020-07-15); whichdevtool.com; Bugsink comparison (September 2026) read 2026-10-03                                 | secondary            |                                                        |
| Second vendor justified; Sentry recommended; costs at scale                                                                                                                                                  | This note                                                                                                                              | judgment             | Arithmetic from verified rates                         |

## Not found

- The 11.0.0 GA browser bundle size of `@sentry/nextjs`; only the pre-release figures (52.03 KB at 11.0.0-alpha.1, 52.63 KB at 11.0.0-beta.1) were found. Also the bundle-size impact of `posthog-js` exception autocapture.
- Exact current npm versions and publish dates for all six SDKs. npm pages were blocked or cached, and the snippets conflict with GitHub release lists. Run `npm view <pkg> version time` at wiring time.
- Whether Sentry server-side capture in Vercel functions delays error responses (flush and `waitUntil` behaviour).
- Whether `onRequestError` covers server actions and `proxy.ts` errors without the Sentry wrapper. Only Sentry's code comment says so; Next.js docs were not read in this pass.
- Next.js 16 `proxy.ts` runtime (Node.js or edge) and PostHog's handling of it.
- The exact accepted value shapes for each v11 `dataCollection` key. Category names are verified; the booleans and arrays in the sketch are not.
- Sentry project-level server-side scrubbing and IP-storage settings on the Developer plan, as of today.
- Whether Sentry creates a default alert rule on new projects.
- `@sentry/react-native` New Architecture support and Yarn/Turborepo monorepo guidance for either vendor.
- Sentry and PostHog data export paths and DPA retention terms.
- Primary-source pricing and Next.js 16 coverage for Rollbar, Better Stack, Honeybadger and AppSignal.

## Promote to library

Yes. The `ErrorReporter` seam, the v11 `dataCollection` privacy baseline, the tier table and the removal checklist apply to every product the starter produces. The v11 default change is a trap any agent will fall into. Promote with an expiry of 2027-04-03 or the first revisit trigger, whichever comes first.

## Assumptions (repeated)

- [ASSUMPTION: Vercel exposes `VERCEL_GIT_COMMIT_SHA` at build on all deployments]
- [ASSUMPTION: `withSentryConfig` without `authToken` warns and skips upload rather than failing the build; confirm on first local `next build`]
- [ASSUMPTION: about 1,000 errors/month at launch, 20,000 at the first thousand customers, 2,000,000 at a hundred times that; errors only, no tracing, replay or logs]

---

Save this note at the path above, then open `prompts/03-technical.md`.

## Sources

1. [Best Sentry Alternatives for Error Tracking and Monitoring ...](https://ssojet.com/blog/best-sentry-alternatives-error-tracking)
2. [Error Tracking pricing](https://posthog.com/error-tracking/pricing)
3. <https://posthog.com/docs/error-tracking/installation/nextjs>
4. [Pricing: Free Developer Plan, Pay as You Grow](https://sentry.io/pricing/)
5. [Node server frames in a Turbopack chunk resolve to wrong source positions (innermost app frames only) · Issue #93640 · PostHog/posthog](https://github.com/PostHog/posthog/issues/93640)
6. [CLI: empty-sourcemap wrapper threshold (2 KiB) misses Next.js 16 Turbopack server page stubs — \~150 spurious WARNs per build · Issue #70235 · PostHog/posthog](https://github.com/PostHog/posthog/issues/70235)
7. [fix(nextjs-config): snapshot sourcemap inputs for Turbopack by kkumarsatish567-dot · Pull Request #4691 · PostHog/posthog-js](https://github.com/PostHog/posthog-js/pull/4691)
8. [docs.sentry.io](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps)
9. <https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup>
10. [Provision Sentry from the Stripe Projects CLI](https://blog.sentry.io/sentry-stripe-projects/)
11. [How to set up Next.js error monitoring - PostHog](https://posthog.com/tutorials/nextjs-error-monitoring)
12. [chore(deps): Sentry JS SDK 11 (nestjs + nextjs) without widening what reaches Sentry by pdcarlson · Pull Request #2734 · pdcarlson/Frapp](https://github.com/pdcarlson/Frapp/pull/2734)
13. [docs.sentry.io](https://docs.sentry.io/organization/integrations/deployment/vercel)
14. [Using Sentry - Expo documentation](https://docs.expo.dev/guides/using-sentry/)
15. [docs.sentry.io](https://docs.sentry.io/platforms/react-native/sourcemaps/uploading/expo)
16. [expo advanced](https://docs.sentry.io/platforms/react-native/sourcemaps/uploading/expo-advanced)
17. [Expo + EAS Build fails to upload source maps unless .env.sentry-build-plugin is present, despite valid plugin config and env vars · Issue #4961 · getsentry/sentry-react-native](https://github.com/getsentry/sentry-react-native/issues/4961)
18. [\[@sentry/react-native/expo\] Config plugin not applied during EAS Build cloud prebuild — source maps never upload, releases empty · Issue #6048 · getsentry/sentry-react-native](https://github.com/getsentry/sentry-react-native/issues/6048)
19. [Using PostHog](https://docs.expo.dev/guides/using-posthog/)
20. [React Native error tracking installation](https://posthog.com/docs/error-tracking/installation/react-native)
21. [React Native - Docs - PostHog](https://posthog.com/docs/libraries/react-native)
22. [fix(react-native-plugin): capture Android NDK crashes when nativeCrashes is enabled by github-actions\[bot\] · Pull Request #5062 · PostHog/posthog-js](https://github.com/PostHog/posthog-js/pull/5062)
23. [Send error tracking alerts](https://posthog.com/docs/error-tracking/alerts)
24. <https://posthog.com/docs/error-tracking/releases>
25. [Issues and exceptions](https://archive.posthog.com/docs/error-tracking/issues)
26. [8 Best GlitchTip Alternatives in 2026 · Dash0](https://www.dash0.com/comparisons/best-glitchtip-alternatives)
27. [Manage Your Error Quota](https://docs.sentry.io/pricing/quotas/manage-event-stream-guide/)
28. <https://docs.sentry.io/pricing/>
29. [About Sentry's EU Region](https://sentry.zendesk.com/hc/en-us/articles/25074658211227-About-Sentry-s-EU-Region)
30. [Data Storage Location (US or EU)](https://docs.sentry.io/organization/data-storage-location/)
31. [Org tokens resolve to sentry.io, ignoring EU data residency · Issue #116550 · getsentry/sentry](https://github.com/getsentry/sentry/issues/116550)
32. [Runtime Logs](https://vercel.com/docs/logs/runtime)
33. [Vercel Runtime Errors: See What's Actually Breaking](https://www.controltheory.com/use-case/vercel-runtime-errors/)
34. [Migrating from Highlight.io to LaunchDarkly Observability](https://nodejs.highlight.io/blog/launchdarkly-migration)
35. [BugSnag Pricing](https://smartbear.com/insight-hub/pricing/)
36. [Bugsnag Alternative for Lighter Crash Monitoring](https://www.shakebug.com/bugsnag-alternative)
37. [BugSnag Software Pricing, Alternatives & More 2026](https://www.capterra.com/p/265817/Bugsnag/)
38. [Best Bugsnag Alternatives (2026): Pricing & Migration](https://www.buildmvpfast.com/alternatives/bugsnag)
39. [Deploy & Host Replace Sentry Without Changing a Line of Code — GlitchTip on Railway](https://railway.com/deploy/replace-sentry-without-changing-a-line-of-code-glitchtip-on-railway--glitchtip-sentry-alternative)
40. [Next.js SDK](https://glitchtip.com/sdkdocs/javascript-nextjs/)
41. [posthog.com](https://posthog.com/docs/libraries/sentry)
42. [Migrate from 10.x to 11.x](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v10-to-v11/)
43. [docs(nextjs): Update getting started and manual setup for v11 by chargome · Pull Request #19336 · getsentry/sentry-docs](https://github.com/getsentry/sentry-docs/pull/19336)
44. [v0.43.7.0 chore(deps): @sentry/nextjs 11 by thehashrocket · Pull Request #250 · thehashrocket/volunteerready.org](https://github.com/thehashrocket/volunteerready.org/pull/250)
45. [sentry-nextjs-sdk](https://mcpservers.org/agent-skills/sentry/sentry-agent-skills/sentry-nextjs-sdk)
46. [Upgrade @sentry/nextjs to 11: explicit dataCollection, withSentryConfig import, drop enableLogs · Issue #954 · digitalgroundgame/pragmatic-papers](https://github.com/digitalgroundgame/pragmatic-papers/issues/954)
47. [Interactive v11 Migration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v10-to-v11/interactive/)
48. [Data Collected](https://docs.sentry.io/platforms/javascript/guides/nextjs/data-management/data-collected/)
49. [Build Options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/build/)
50. [user-guide.operations-engineering.service.justice.gov.uk](https://user-guide.operations-engineering.service.justice.gov.uk/documentation/services/sentry)
51. [Sentry Setup](https://starter.obytes.com/recipes/sentry-setup/)
52. [GlitchTip pricing, free tier and alternatives (2026)](https://whichdevtool.com/tools/glitchtip/)
53. [@posthog/nextjs-config contains malware after npm account takeover](https://advisories.gitlab.com/pkg/npm/@posthog/nextjs-config/GMS-2025-231/)
54. [\# Grouping exceptions into issues - Docs](https://posthog.com/docs/error-tracking/grouping-issues.md)
