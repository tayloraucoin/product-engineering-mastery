# As-built — STK-15

## Shipped against the contract

- C1: `createMailer({ tier, apiKey, fromAddress })` in `@pem/email/mailer`. On `local` it logs `[email] email.logged` with the subject, the rendered text, the masked recipients, and the template id and variable names, through `@pem/observability`. It returns `logged` and never builds a Resend client. Staging and production send once, and throw when the key is missing or Resend refuses (`mailer.test.ts`).
- C2: `renderDefaultEmail` in `@pem/email/default-template` renders HTML and text parts. The brand name, the home URL, the support address and both theme colours (converted from OKLCH to hex) come from `@pem/brand`. The sender is `brand.name <EMAIL_FROM or brand.contact.email>`, and reply-to is `brand.contact.support`. A test scans every source file for brand values, addresses and colour literals (`default-template.test.ts`).
- C3: `email` is in `boundaries.js`, importing `config`, `env`, `brand` and `observability`, with `resend` in `SDK_OWNERS`. A probe file in `apps/web` importing `resend` was rejected.
- C4: `yarn verify` passes.
- Non-negotiables: `toolkit.json` marks `email` locked with `runbook: null`. Dashboard templates are sent by an id the app reads from env (`template: { id, variables }`), as the README states. `resend` 6.32.0 is pinned exact in `tech-stack.md`.

## Deviations

- **Not wired into `apps/web`.** `apps/web/env.ts` does not read `RESEND_API_KEY` or `EMAIL_FROM` yet, and `apps/web/lib/email.ts` does not exist. A variable that `env.ts` reads must be in `turbo.json` (turbo's lint), and `turbo.json` names must be in `.env.example` (`check-client-bundle`). This session's permission settings deny reading `.env.example`. The wiring was committed and then backed out in `7086a07`. It comes back once `.env.example` lists both variables.
- [ASSUMPTION] devs_call: a plain template string with escaping, and no renderer dependency.
- [ASSUMPTION] `EMAIL_FROM` is tiered (`_LOCAL`, `_STAGING`), like every other variable, so staging can send from Resend's test domain.
- [ASSUMPTION] Email clients ignore web fonts, so the template uses a system font stack rather than the brand font.
- [ASSUMPTION] The example call from a service lives in `packages/email/README.md`, since `@pem/services` is STK-13.
- `EXAMPLE_API_KEY` stays; replacing it touches `.env.example` too.
- STK-5 was built first in the same thread, as STK-15's dependency.

## Not verified

- No message has been sent through Resend; the vendor call is proven against a stand-in only.
- The HTML has not been rendered in a mail client.

## Next

Add the email lines to `.env.example`, then restore the `apps/web` wiring: `env.ts`, `lib/email.ts`, `turbo.json`, the dependency and `transpilePackages`.
