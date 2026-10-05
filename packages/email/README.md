# @pem/email

Transactional email through Resend, with one default template (D-STK-12). A locked module: `toolkit.json` marks it `locked`, and no removal runbook exists. Only this package imports `resend` (D-STK-16).

- **`@pem/email/mailer`**: `createMailer({ tier, apiKey, fromAddress, deployed })` returns `send(message)`. The app builds it once from its `env.ts` (`apps/web/lib/email.ts`); this package never reads `process.env`.
- **`@pem/email/default-template`**: `renderDefaultEmail({ subject, heading, paragraphs, action? })`, a plain template string with every value escaped. The brand name, the home URL, the support address and the colours come from `@pem/brand`.

**Tiers.** On `local`, `send` logs the rendered message through `@pem/observability` (`[email] email.logged`, recipients masked) and returns `{ status: "logged" }`; it never calls Resend. A deployment or production build left on `local` (a missing `DATABASE_ENVIRONMENT`) logs neither subject nor body, since sign-in and reset links live there; it reports `email.withheld` as an error, so the registered reporter pages someone, and returns `{ status: "withheld" }`. On `staging` and `production` it sends and logs `email.sent` with Resend's id and the recipient count, never the address or body; it throws when `RESEND_API_KEY` is unset or Resend refuses the message.

**Sender.** Header values are kept to one line. From is `brand.name <EMAIL_FROM>`, falling back to `brand.contact.email`; reply-to is `brand.contact.support`. `EMAIL_FROM` must be on a domain verified in Resend.

**Dashboard templates.** A template kept in the Resend dashboard is sent by id, and the id is an environment variable, never a literal: add `RESEND_TEMPLATE_<NAME>` to the app's `env.ts`, `turbo.json` and `.env.example`, then send `{ to, template: { id: env.RESEND_TEMPLATE_<NAME>, variables } }`.

**Calling it.** App code sends through `apps/web/lib/email.ts`, one function per message, beside the route or action that owns the event:

```ts
// apps/web/app/(auth)/welcome/send-welcome.ts
import { mailer } from "@/lib/email";

export async function sendWelcome(to: string, signInUrl: string) {
  return mailer.send({
    to,
    content: {
      subject: "Welcome",
      heading: "You're in",
      paragraphs: ["Your account is ready."],
      action: { label: "Sign in", url: signInUrl },
    },
  });
}
```

`@pem/services` cannot import `@pem/email` yet: it has no `email` edge in `boundaries.js`. D-STK-1 places `email` below `services`, so the first service that must send adds that edge, and takes a `Mailer` from its caller rather than building one.

Supabase's own auth emails (sign-up, magic link, reset) are not sent from here; they are set in the Supabase dashboard.
