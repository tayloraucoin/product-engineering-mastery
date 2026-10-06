---
target: specs/web/ux/experimental/gate.md
status: approved
promoted:
---

# Gate — experimental

## Job

A reviewer with a link gets in with as little as possible. Someone without a live code learns nothing, not even that the experiment exists (S12b). Done: they land on the page they asked for.

## Layout and components

- One narrow column, left-aligned, with generous top space. The brand mark sits top-left. No nav and no card (A-10).
- `Field`, `Label`, `Input` and `Button` from `@pem/ui`. "Open the review" is the only primary action.
- Order: heading, lead line, the notice "What we keep", the email field, the code field, the button, then the team link.
- **One face for every slug.** No title, no design count, nothing that differs between a real and an unknown slug. The gate shows at the address opened, and success lands on that address. Redirect or rewrite is Mason's call (door 3).
- **Signed-in user without a role** (S8): no email field. A line above the code reads "Signed in as ana@example.com. Your feedback is saved to this account. Not you? Sign out". Lead: "Enter the code you were sent to see the designs and leave comments." The notice opens "Your account email, so the team knows whose feedback it is…" and is otherwise unchanged.
- **Team** (S5) never sees the gate. Not signed in, they use the team link.
- **Code field:** shown, not masked. Paste works. Autocomplete, autocapitalise and spellcheck are off. `[PROPOSED]` Spaces and dashes are ignored; Mason confirms this against the code format.

## States

| State | Key | What shows | What the person can do | Copy |
| --- | --- | --- | --- | --- |
| empty | `gate-empty` | The blank form | Fill and submit | as Words |
| loading | `gate-loading` | The button reads "Checking"; fields read-only | Wait | "Checking" |
| error | `gate-error` | An inline error on the field at fault | Correct it | see Errors |
| partial | `gate-partial` | Email prefilled from the email link; focus on the code | Enter the code | — |
| offline | `gate-offline` | A line above the button | Reconnect, retry | "You're offline. Connect, then try again." |
| success | `gate-success` | Briefly "Opening the review", then the page | — | "Opening the review" |
| throttled | `gate-throttled` | Code error with a fixed time; button disabled until then, re-enabled without reload; fields stay filled | Wait | "Too many tries. You can try again after 14:32." (no "from this browser": the keying is gap 3) |
| revoked | `gate-revoked` | Identical to `gate-empty`, with no hint | Enter a code | — |
| signed-in | `gate-signed-in` | Code only, with the account line | Enter the code | see Layout |
| server error | `gate-server-error` | Message above the button | Retry | "Something on our side stopped this. Try again in a minute; what you typed is still here." |

The throttle time is shown in the reviewer's local time. There is no countdown (A-19). Unknown slugs throttle exactly like real ones.

## Words

- Heading: "Design review". Lead: "Enter your email and the code you were sent to see the designs and leave comments."
- Notice heading: "What we keep". Body: "Your email, so the team knows whose feedback it is and can email you a confirmation when you send your review. Which designs you look at and for how long, your comments with the screen size you left them at, and your answers. We keep these until the team deletes them after the review. To have yours deleted, email hello@example.com. This browser remembers your access for 30 days." The address is `@pem/brand` `contact.email` (S28 assumption; verified placeholder 2026-10-05).
- The gate never shows the experiment's mode. A collaborate experiment adds its own notice step after a live code (`threads.md`), so the gate stays one face (S12b).
- Labels: "Your email", "Access code" (hint "From the message you were sent."). Button: "Open the review". Team link: "On the team? Sign in instead", which goes to `/auth/sign-in?next=<this path>` (sign-in honours `next`; verified, `apps/web/app/auth/sign-in/page.tsx:44`).
- **Errors:**
  - Empty email: "Enter your email."
  - Malformed email: "Enter an email address, like name@example.com."
  - Empty code: "Enter the access code you were sent."
  - Unknown slug, wrong code, revoked code, or closed without a live code: "That code doesn't open a review here. Check it against the message you were sent, or ask whoever sent it for a new one."

## Access

- Nothing is focused on load, so a phone keyboard never covers the notice. When the email is prefilled, focus goes to the code field.
- The notice is plain text before the email field in DOM order, never behind a link.
- On submit, focus moves to the first field in error, and the error is tied to that field (`aria-describedby`, `aria-invalid`). The throttle and code errors are read through the code field.
- Accessible names: "Your email", "Access code", "Open the review".
- No motion. Targets are at least 44px.

## Instrumentation

No analytics. The wrong-code throttle keeps short-lived counters only, never stored next to feedback (S26; keying is gap 3, Technical). The email and code never appear in a URL or a client log.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-LAB-gate-1 | An unknown slug and a real slug are opened without access | The two responses are identical apart from the path and per-request tokens | test |
| C-LAB-gate-2 | A wrong, revoked or closed-without-live code is entered | The same error text shows for all of them, and for an unknown slug | test |
| C-LAB-gate-3 | A guest not signed in opens the gate | The notice renders above the email field with all four Words points | capture |
| C-LAB-gate-4 | A live code and email are submitted | The reviewer lands on the page requested; the email is recorded beside the code | test |
| C-LAB-gate-5 | Wrong tries pass the threshold | The throttle state shows a fixed time, no countdown, and fields stay filled | capture |
| C-LAB-gate-6 | A signed-in user without a role opens the gate | No email field; the account line shows; their account is used (S8) | test |
| C-LAB-gate-7 | A developer or admin opens any experiment | No gate | test |
| C-LAB-gate-8 | Keyboard alone with a screen reader | The form is completable; each error is announced on its field | manual |
| C-LAB-gate-9 | Each `?state=` key in States | It renders at 390, 834 and 1440, light and dark | capture |

## Decisions and open items

D-LAB-5, D-LAB-6. Routed to Technical: code format, redirect or rewrite, throttle keying (gap 3), how the email link prefills the email (door 7).
