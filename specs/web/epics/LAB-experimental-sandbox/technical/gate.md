---
epic: LAB
status: approved
---

# LAB — the gate, codes, cookies and links

> Detail for D-LAB-30 to D-LAB-33, D-LAB-37 and D-LAB-38 (`../technical.md`). Shared by every ticket that touches the gate, the experiment and review pages, the confirmation email or `/admin` access. Mason, with Warden, 2026-10-05.

## Request path (door 3, D-LAB-30)

1. `next.config.ts` `headers()` stamps `X-Robots-Tag: noindex, nofollow` on `/experimental/:path*` and `/admin/:path*`; both layouts also set `robots: { index: false }` metadata. `proxy.ts` is not touched.
2. The experiment page, the review page and every sandbox action call `resolveViewer(slug)` in `apps/web/lib/sandbox/access.ts` first. In order:
   - a team role (`getAuthContext()`, role `developer` or `admin`) returns a team viewer;
   - otherwise the `sandbox_access` cookie is verified with no database read (signature, slug equal to the path's, issued under 30 days ago); a missing or bad cookie returns "no access";
   - only then the database: the access row exists, its reviewer's slug matches, the code is not revoked, the access's `code_version` equals the reviewer's, and, for a signed-in reviewer (S8), the access's `user_id` equals the current user.
   - The registry then says open or closed. Closed with a live code renders `ended.md`; an unknown slug never reaches the database.
3. "No access" renders the one `Gate` server component in place, at the address opened, with status 200, for a real slug, an unknown slug and a revoked or closed code alike. No redirect, no rewrite. The team on an unknown slug gets the app's 404.
4. The gate's server action succeeds by setting the cookie and redirecting to the same path, without `?r=`.

Verified 2026-10-05 against the docs bundled with the installed Next.js 16.3.8 (`node_modules/next/dist/docs`): proxy is optional for optimistic checks and suited to static routes and centralised redirects (`02-guides/authentication.md`, "Optimistic checks with Proxy"); it runs on Node by default (`proxy.md`, "Runtime"); layout checks do not re-run on navigation, so checks sit next to the data ("Layouts and auth checks"). Neither proxy use applies here: every sandbox page is dynamic, and the gate renders in place.

## Codes (D-LAB-31)

- 16 symbols of Crockford base32 (80 bits), from `crypto.randomBytes`, shown grouped: `7KQM-29XH-PATR-4WDN` (synthetic).
- Input: uppercase; drop every character outside `0-9A-Z`; map `O` to `0`, `I` and `L` to `1`. Exactly 16 valid symbols, or it is a wrong code (same error, counts as a try). So spaces, dashes, lower case and a pasted trailing newline all work (gate.md `[PROPOSED]`, confirmed).
- Stored: SHA-256 of the normalised 16 symbols, `bytea`, unique; looked up by equality. No salt, no pepper, no slow hash: 80 random bits cannot be guessed online or offline, a pepper would tie every code to a rotatable secret, and a slow hash needs a dependency. Changing this later invalidates every issued code (door 3).
- Never logged, never in a URL, never returned after the shown-once dialog.

## Cookies (D-LAB-32)

| Cookie           | Value                                                                                                  | Scope                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `sandbox_access` | `v1.<accessId>.<slug>.<issuedAt>.<mac>`, `mac` = HMAC-SHA256 under `SANDBOX_SECRET`, label `access-v1` | `Path=/experimental/<slug>`, `HttpOnly`, `SameSite=Lax`, `Secure` when deployed, `Max-Age` 30 days, fixed from issue (S10) |
| `sandbox_gate`   | a random 128-bit id, the throttle's browser key                                                        | `Path=/experimental`, same flags, 1 day; set on any failed try, any slug                                                   |

- `Lax`, not `Strict`: the email link is a cross-site top-level visit and must carry live access.
- No `__Host-` prefix: it requires `Path=/`, and per-slug scope matters more.
- `SANDBOX_SECRET` (tiered, ≥32 bytes, `apps/web/env.ts`, server-only) keys the cookie, the email-link token and the throttle keys, each under its own label. Rotating it sends every device back to the gate and voids link prefills; codes are untouched.

## Wrong-code throttle (gap 3, D-LAB-33)

- Two counters per try, checked before the code lookup: the browser key (`sandbox_gate`) and the network key (the client address, IPv4 whole or IPv6 /64).
- Neither is stored raw: the row key is HMAC-SHA256(`SANDBOX_SECRET`, label `throttle`, key), in `sandbox_gate_attempts`, which has no slug and no link to any feedback row.
- Browser: 5 wrong tries in 15 minutes locks it for 15 minutes. Network: 30 in 15 minutes, because a client and colleagues may share one office address. Thresholds are judgment (Mason, Warden) and live in one constant.
- A success clears the browser counter only. Rows expire at the later of the window and the lock (at most 30 minutes) and are deleted on every write.
- Keyed globally, never by slug: an unknown slug throttles exactly like a real one (gate.md).
- The page receives `lockedUntil` as an instant; the client formats it in local time ("after 14:32").
- `[ASSUMPTION: on Vercel the first x-forwarded-for hop is the client address, set by the platform. Secondary (Vercel docs, as known at June 2026); the gate ticket verifies it on the installed platform before relying on it. Without a trustworthy address, as on localhost, only the browser counter runs.]`
- The gate's words keep avoiding "from this browser": a lock can come from either counter.

## Reviewer identity (door 6, D-LAB-37)

The reviewer is a `sandbox_reviewers` row: one person, one experiment, one current code. Each successful gate entry writes a `sandbox_accesses` row with the typed email (trimmed, lower-cased) or the user id (S8). Every view, comment and version carries both `reviewer_id` (whose it is, for scoping and numbering) and `access_id` (which email it came from, for erasure). Replace rewrites the hash and bumps `code_version` in place (D-LAB-23), so pins and versions stay the reviewer's and old devices return to the gate.

## The confirmation link (door 7, D-LAB-38)

- `<site URL>/experimental/<slug>?r=<token>`. The token is `<accessId>.<mac>`, `mac` = HMAC under label `email-link`, truncated to 128 bits.
- The gate resolves it to its access row and fills the email only; it never grants access. A bad, foreign-slug or erased token is ignored silently, and the gate shows blank, so it says nothing more than an unknown slug does.
- The site URL comes from `env.ts`, never the request's host (as `packages/auth/src/redirect.ts:25-33`).
- A signed-in reviewer's link opens the signed-in face, which takes the code only.
- **Slugs travel in links and mail logs** (D-LAB-20's reason applies to them too): a slug is named like a title you would not mind leaking. `pricing-2026`, never a client's name.

## Roles take effect (door 1)

`roleOf` reads `app_metadata` from `getUser()` (`packages/auth/src/context.ts:65-70, 101`), and `getUser()` fetches the user from the Auth database on every call, not from the session token (verified 2026-10-05, the doc comment in the installed `@supabase/auth-js` 2.117.2, `GoTrueClient.d.ts`). No policy or code reads JWT claims (verified, grep 2026-10-05). So a role change applies on the person's next request, and every action re-checks. people.md's line becomes "Changes take effect the next time they open a page." (call R11).
