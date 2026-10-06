---
id: LAB-7
size: small
objective: "Anyone without live access sees one gate at the address they opened, the same for every slug, and a live code with an email (or a signed-in account) lands them on that page."
slice_type: "The gate's page, form and action on an unauthenticated route (doors 3, 7 and 8); the risk is a response that differs between a real and an unknown slug, a code echoed or logged, or a notice that loses one of its four points."
non_negotiables:
  - "No access renders the one Gate server component in place, status 200, at the address opened: no redirect, no rewrite; only the team on an unknown slug gets notFound(). The experimental layout sets noindex metadata (R12)."
  - "Gate props are the path, a prefilled email, the signed-in account email and the state only: never a title, design count, mode or anything else read from the registry."
  - "The enter action validates, runs LAB-6's withGateThrottle around LAB-5's grantAccess, sets sandbox_access and redirects to the same path without ?r=; no code, email or token is echoed back or logged."
  - "A wrong code, a revoked code, an unknown slug and a closed experiment without a live code give one error, the Words' sentence, and each counts as a try; a live code on a closed experiment is granted, so LAB-21's page shows."
  - "gate.md's Words verbatim; the notice in full, as plain text, before the email field (door 8); the address is @pem/brand contact.email."
  - "The signed-in face (S8) has no email field, enters with the user id, and its Sign out ends this device's session only, back to the same path."
  - "Every gate.md ?state= key registers in LAB-4's lib/sandbox/state.ts as anyone, on synthetic fixtures."
devs_call: "The split between gate.ts and the page, the action's result type, the client leaf's shape, and how the button re-enables at the lock time (one timer, never a countdown)."
cites:
  - "specs/web/epics/LAB-experimental-sandbox/ux/experimental/gate.md"
  - "D-LAB-5"
  - "D-LAB-6"
  - "C-LAB-gate-1"
  - "C-LAB-gate-2"
  - "C-LAB-gate-3"
  - "C-LAB-gate-4"
  - "C-LAB-gate-5"
  - "C-LAB-gate-6"
  - "C-LAB-gate-7"
  - "C-LAB-gate-8"
  - "C-LAB-gate-9"
truth_files: "none: the approved proposal ux/experimental/gate.md reaches specs/web/ux/experimental/gate.md through yarn truth:promote LAB once its citing tickets close"
qa: Q3
reviewers:
  - warden
  - assay
focus:
  - "one face for real, unknown, revoked and closed (warden)"
  - "the notice's four points (warden)"
operator_review: true
planned_paths:
  - "apps/web/app/experimental/layout.tsx"
  - "apps/web/app/experimental/[slug]/page.tsx"
  - "apps/web/app/experimental/[slug]/actions.ts"
  - "apps/web/app/experimental/[slug]/_components/gate/**"
  - "apps/web/lib/sandbox/gate.ts"
  - "apps/web/lib/sandbox/gate.test.ts"
  - "apps/web/lib/sandbox/state.ts"
  - "apps/web/lib/sandbox/validators.ts"
depends_on:
  - LAB-5
  - LAB-6
out_of_scope:
  - "The experiment behind the gate: LAB-11. The ended page: LAB-21. Their page.tsx branches stay placeholders naming the ticket."
  - "A real, monitored contact.email in @pem/brand (the notice's erasure address): the operator's, before any real code is issued."
  - "resolveViewer, codes, cookies and the link token: LAB-5. The throttle and sandbox_gate: LAB-6."
  - "Issuing codes: LAB-15. The confirmation email: LAB-20. The collaborate notice step after a live code: beat 2 (threads.md)."
criteria:
  - id: C1
    statement: "Without access, a real slug, an unknown slug, a revoked code's cookie and a closed experiment give the Gate with status 200 and props equal apart from the path; the team on an unknown slug gets not-found."
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "A wrong code, a revoked code, a code on an unknown slug and a non-live code on a closed experiment return the same Words error on the code field and count one try each; empty email, malformed email and empty code give their own Words errors and reach neither the throttle nor the database; a store that throws gives server-error with both fields kept."
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "A live code with a valid email sets sandbox_access for the slug and redirects to /experimental/<slug> without ?r=; createAccess receives the email trimmed and lower-cased; a live code on a closed experiment is granted the same way."
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A signed-in user without a role gets the signed-in face (account line, no email field), a ?r= token is ignored there, and a live code enters with their user id, never an email."
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "A developer or admin gets no gate on a known slug, open or closed."
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Each gate.md ?state= key renders its fixture for anyone, on a real and an unknown slug alike; a non-gate sandbox key renders only for the team, and for anyone else renders as if absent."
    evidence: test
    command: "yarn workspace web test"
  - id: C7
    statement: "A guest not signed in sees the notice above the email field with all four Words points."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-notice.png"
  - id: C8
    statement: "Past the threshold the throttled state shows a fixed local time, no countdown, the fields still filled and the button disabled."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-throttled.png"
  - id: C9
    statement: "With keyboard alone and a screen reader the form is completable and each error is announced on its field."
    evidence: manual
    reason: "Needs a person with VoiceOver or NVDA; no screen-reader runner exists. The builder checks the keyboard path and the aria wiring, then hands this over with --verdict deferred."
  - id: C10
    statement: "Every gate.md ?state= key renders at 390, 834 and 1440, light and dark."
    evidence: capture
    path: "specs/web/epics/LAB-experimental-sandbox/tickets/LAB-007-gate-page/evidence/gate-states.png"
  - id: C11
    statement: "The experimental layout exports robots metadata with index and follow false."
    evidence: test
    command: "yarn workspace web test"
  - id: C12
    statement: "The HTML yarn web:dev serves without access for a real and an unknown slug is identical once per-request tokens are stripped."
    evidence: manual
    reason: "No test runner serves the app; the builder diffs two served responses and records the diff in the as-built."
---

# Contract — LAB-7 gate-page

## Build notes

- **Approach:**
  - `lib/sandbox/gate.ts` holds the pure parts. `gateView(result, input)` maps LAB-5's result to `gate` (status 200, props), `not-found`, `ended` or `experiment`. `enterGateWith(deps, input)` returns `redirect`, `error` (field, message), `throttled` (`lockedUntil`) or `server-error`. Words and fixtures too. Model the seam on `apps/web/lib/billing/webhook/handle.ts` and its test. Tests sit under `lib/`, the only glob `yarn workspace web test` runs.
  - `page.tsx` calls `resolveViewer(slug)` and `readSandboxState`. It reads `?r=` through LAB-5's `readLinkEmail` on the guest face only, then switches on `gateView`.
  - `actions.ts` (`"use server"`) has `enterGate`, which binds env, `cookies()`, `getAuthContext()` and the LAB-5 and LAB-6 functions, and `signOutHere`.
  - `_components/gate/` holds the server `Gate` and a `"use client"` form leaf (`useActionState`).
  - Prior art: `apps/web/app/auth/sign-in/` (`?state=`, an action that keeps the address out of URLs and logs, client leaves).
- **Decisions that apply:**
  - D-LAB-5: "The gate is one form: notice, email, code, one button."
  - D-LAB-6: "The reviewer is the code: one code is one person on any device; each typed email is recorded."
  - R1 (D-LAB-30 to 32): "the page checks the cookie's signature, slug and age before any database read, then `access.ts` checks code, version, open or role. The gate renders in place (no redirect, no rewrite), one component for every slug."
  - R6 (D-LAB-38): "The email link is `/experimental/<slug>?r=<token>`: a signed access id that fills the email and never grants access."
  - technical/gate.md: "The gate's server action succeeds by setting the cookie and redirecting to the same path, without `?r=`." And: "The page receives `lockedUntil` as an instant; the client formats it in local time."
  - S12b: "an unknown slug, a wrong code, a revoked code and a closed experiment look the same."
  - Door 8: gate.md's Words, as built, reviewed by Warden.
- **Interfaces:**
  - `gateView`, `enterGateWith` and `GATE_WORDS` (gate.ts).
  - The gate keys in LAB-4's `SANDBOX_STATE_KEYS`, marked `anyone`; read through LAB-4's `readSandboxState`.
  - `enterGate(slug, prev, formData)` and `signOutHere(slug)` (actions.ts).
  - `Gate` and `GateForm` (`_components/gate/`).
- **Per path:**
  - `experimental/layout.tsx`: `robots: { index: false, follow: false }` metadata only, no chrome.
  - `page.tsx`: the switch, with a fixed title "Design review" for every slug.
  - `actions.ts`: the two actions.
  - `_components/gate/`: the Gate, the notice and the form leaf.
  - `gate.ts` and its test: C1 to C6, named by criterion id. `state.ts`: the gate keys only.
  - `validators.ts`: the gate form's zod schema.
- **Gotchas:**
  - React 19 resets an uncontrolled form after an action. Keep the fields controlled so they stay filled, and never return the code in the action's state.
  - Validate before the throttle. A code that is not 16 symbols after normalising is a wrong code and counts as a try (D-LAB-31). Empty fields do not count.
  - After the sync, reuse STK-24's `app/auth/sign-out/route.ts` (local scope, back to this path); never a second sign-out.
  - Format `lockedUntil` in the client leaf after mount, in the browser's locale and zone. A single `setTimeout` re-enables the button.
  - Use synthetic fixtures only: `ana@example.com` and a fixed `lockedUntil`.
- **Model:** Opus 5.5 (`claude-opus-5-5`). A smaller model adds a per-slug title or a "no such review" branch, and that breaks the one face.
