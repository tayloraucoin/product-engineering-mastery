# Live checks — STK-12, 2026-10-04

Next 16.3.8 dev server on port 3002, `DATABASE_ENVIRONMENT=local`, with a synthetic project: `NEXT_PUBLIC_SUPABASE_URL_LOCAL=https://stagingref0000000000.supabase.co` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL=sb_publishable_synthetic_local`. Nothing reached a real Supabase project. The site URL resolves to `http://localhost:3000`, as it does whenever the code runs outside a deployment.

## Cookie purge through proxy.ts

Run twice: before and after `@pem/auth`'s server subpaths gained `import "server-only"`.

| Step             | `document.cookie`                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Set by script    | `sb-stagingref0000000000-auth-token.0=own; sb-127-auth-token.0=stale0; sb-127-auth-token.1=stale1; sb-127-auth-token-code-verifier=v; pem-probe=kept` |
| After one reload | `sb-stagingref0000000000-auth-token.0=own; pem-probe=kept`                                                                                            |

## Sign-in form

- Posting `ana@example.test` to the unreachable synthetic project went to `/auth/sign-in?state=error`.
- The server log line was `[auth] auth.sign_in_link_failed { status: 0 }`. The address appeared in neither the URL nor the log.

## Callback redirects (curl, before the unconfigured-tier change)

| Request                                                           | Answer                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| `/auth/callback`                                                  | 307 `http://localhost:3000/auth/sign-in?state=expired` |
| `/auth/callback?code=synthetic-code&next=%2F%2Fevil.example.test` | 307 `http://localhost:3000/auth/sign-in?state=expired` |
| `/auth/callback?token_hash=x&type=recovery`                       | 307 `http://localhost:3000/auth/sign-in?state=expired` |

## Page states

Each was rendered and read in the browser pane, light theme, at 800 px:

- `?state=` absent: the form.
- `loading`: the field and the button disabled, the button reading "Sending link".
- `sent`: "Check your email for a sign-in link." and a "Send another link" link.
- `error`: the form with the alert copy.
- `expired`: the form with the alert copy.
- No project configured: "Sign-in is not set up for this environment yet."

Not captured: dark theme, 390 and 1440 widths, reduced motion. No capture harness exists until P-C (`.claude/rules/testing.md`).

## Public-key guard

`yarn workspace web build` with `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY_LOCAL=sb_secret_synthetic` exits 1, at `next.config.ts`'s environment validation:

> NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key (sb_secret_…), and every NEXT_PUBLIC_ value reaches the browser. …

## After the second review round (same day)

Run on the plain `web` server (port 3000, no Supabase project configured) and the synthetic one (port 3002).

- **Tier with no project.** `sb-stagingref0000000000-auth-token.0`, its `-code-verifier` and `pem-probe` were set; after one reload only `pem-probe=kept` remained.
- **Callback on that tier.** `/auth/callback?code=x` answered 307 to `http://localhost:3000/auth/sign-in` (no `state`), with `cache-control: private, no-cache, no-store, must-revalidate, max-age=0`, `expires: 0` and `pragma: no-cache`.
- **Callback with the synthetic project.** `/auth/callback?code=x&next=%2F%2Fevil.example.test` answered 307 to `http://localhost:3000/auth/sign-in?state=expired`, with the same `cache-control`.
- **`?state=invalid`.** The input has `aria-invalid="true"` and `aria-describedby="sign-in-message"`, which resolves to "Enter an email address, such as ana@example.test." One `role="status"` region (`sr-only`) is present and empty.
- **`?state=loading`.** The input is enabled, matching a real submit. The button reads "Sending link" and is disabled, and the status region reads "Sending your sign-in link".
