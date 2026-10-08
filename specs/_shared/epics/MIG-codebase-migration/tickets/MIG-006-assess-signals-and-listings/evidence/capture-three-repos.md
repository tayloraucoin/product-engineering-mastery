# MIG-6 C5: one read-only migrate:assess capture on the three repos

Run 2026-10-08T00:53:51Z from toolkit commit 55533e6dd4f7e09403bca4b01a90b748fd3226d2, with `yarn migrate:assess <repo>` (T10). Nothing was written in any repo: `git --no-optional-locks status --porcelain` is recorded before and after each run and is identical. Expected from assess.md's table (scanned 2026-10-06): synapse 14 near, conscious-connections 18 middle, taylor-aucoin 23 and the gate, far. Each report ends with the differences from that table.

## synapse

- Path: `/Users/taylor/lighthouse/synapse`
- Commit: `4d511ef1d07ac9493a7f6234fcc6359f0666fbd8` on `feature/workflow`
- git status before: 0 entries, digest da39a3ee5e6b; after: digest da39a3ee5e6b (identical)

### Migration assessment: synapse

- Target: `/Users/taylor/lighthouse/synapse` at `4d511ef1d07ac9493a7f6234fcc6359f0666fbd8`
- Toolkit: `55533e6dd4f7e09403bca4b01a90b748fd3226d2`
- Total: **15** of 34 measured (17 of 17 signals)
- Gate: passed
- Path: **near** (total 15: near up to 15, middle 16 to 21, far from 22)

## Shape

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| S1 | Workspaces and turbo.json | 3 | 0 | workspaces ["apps/*","packages/*"] in the root; turbo.json at the root |
| S2 | Toolchain majors against tech-stack | 3 | 0 | every major found matches the practice |

## Checks

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| C1 | One verify command | 2 | 1 | no verify script; .github/workflows/ci.yml chains lint, types, build |
| C2 | CI config | 2 | 0 | .github/workflows/ci.yml |
| C3 | Tests | 2 | 2 | no test runner; no test files |
| C4 | Type check and lint scripts | 2 | 0 | type check: check-types; lint: lint |
| C5 | Read-only format check | 2 | 1 | write-only: format: prettier --write "**/*.{ts,tsx,md}" |

## Conventions

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| V1 | Boundaries lint | 3 | 0 | packages/config/eslint/boundaries.js is tracked |
| V2 | Token preset | 3 | 0 | packages/config/tailwind/preset.css is tracked |
| V3 | process.env outside env.ts | 3 | 1 | 19 files read process.env outside an env.ts: apps/web/app/(shell)/settings/about/_components/feedback-form.tsx, apps/web/app/(shell)/settings/about/page.tsx, apps/web/app/_components/service-worker-registration.tsx and 16 more |
| V4 | "use client" outside _components/ | 3 | 2 | 243 of 322 "use client" files sit outside a _components/ folder (75%) |
| V5 | SDK importers no reviewer glob matches | 3 | 1 | 3 of 12 SDK-importing files match no reviewer glob |

## Process

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Instruction lines that conflict | 1 | 1 | 5 lines against 2 policies (tests, branches): AGENTS.md:11, AGENTS.md:35 and 3 more |
| P2 | Docs with frontmatter | 1 | 2 | 0 of 216 markdown files under docs/ open with frontmatter (0%) |
| P3 | Record kinds in a foreign format | 1 | 2 | 9 deviation logs, 9 progress logs, 9 decision logs |
| P4 | Living truth | 1 | 1 | 14 UX spec files outside specs/<app>/ux/: docs/ux/README.md, docs/ux/branding-guide.md, docs/ux/epic1_setup_ux_architecture.md and 11 more |
| P5 | Doc paths with spaces or non-ASCII | 1 | 1 | 6 tracked markdown paths hold a space or a non-ASCII character: Forge—staff-engineer-role-prompt.md, Loom—ai-systems-architect-role-prompt.md and 4 more |

## Conflicts

Instruction lines against a toolkit policy; the interview rules each team or operator.

| Policy | File | Line | Text |
| --- | --- | --- | --- |
| tests | AGENTS.md | 11 | 5. **Verify work** the way CI does: `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` (see Commands). There is **no test suite** — do not write tests during slices. |
| branches | AGENTS.md | 35 | - **No git branches or PRs** as part of slice work; commit to the working branch with clear messages. |
| tests | AGENTS.md | 36 | - **No tests during slices** — tests are a separate finalization pass after human QA. |
| branches | AGENTS.md | 145 | 6. **Commits** — commit to the working branch with clear messages. No branches, no PRs. |
| tests | AGENTS.md | 146 | 7. **Tests** — do not write tests as part of a slice. |

## SDK importers

Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.

| File | Module | Matched by |
| --- | --- | --- |
| apps/web/lib/auth/get-request-context.ts | @supabase/supabase-js | **/auth/** |
| apps/web/lib/auth/require-verified-email.ts | @supabase/supabase-js | **/auth/** |
| apps/web/lib/clients/supabase/client.ts | @supabase/ssr | none |
| apps/web/lib/clients/supabase/client.ts | @supabase/supabase-js | none |
| packages/api/src/context.ts | @supabase/supabase-js | none |
| packages/auth/src/admin.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/client.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/client.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/context.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/cookies.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/middleware.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/session.ts | @supabase/supabase-js | **/auth/** |
| packages/db/scripts/seed-users.ts | @supabase/supabase-js | none |

## Records by kind

| Kind | Path | Lines |
| --- | --- | --- |
| host role prompt | docs/roles/engineering/Forge—staff-engineer-role-prompt.md | 147 |
| host role prompt | docs/roles/engineering/Loom—ai-systems-architect-role-prompt.md | 143 |
| host role prompt | docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md | 145 |
| host role prompt | docs/roles/engineering/Vigil—qa-role-prompt.md | 149 |
| host role prompt | docs/roles/engineering/Warden—security-privacy-engineer-role-prompt.md | 144 |
| host role prompt | docs/roles/marketing-growth/Cantor_copywriter-role-prompt.md | 151 |
| host role prompt | docs/roles/marketing-growth/Cantor_ext_human-hand-mode.md | 106 |
| host role prompt | docs/roles/marketing-growth/Hearth_brand-strategist-role-prompt.md | 149 |
| host role prompt | docs/roles/operations-strategy/Crucible_devils-advocate-role-prompt.md | 134 |
| host role prompt | docs/roles/operations-strategy/Pilot_business-advisor-role-prompt.md | 148 |
| host role prompt | docs/roles/operations-strategy/Reeve—project-manager-role-prompt.md | 143 |
| host role prompt | docs/roles/product-design/Compass_product-strategist-role-prompt.md | 152 |
| host role prompt | docs/roles/product-design/Envoy_user-researcher-role-prompt.md | 149 |
| host role prompt | docs/roles/product-design/Tribune_customer-advocate-role-prompt.md | 144 |
| host role prompt | docs/roles/product-design/vesper-ux-ui-designer-role-prompt.md | 147 |
| host role prompt | docs/roles/role-authoring-guide.md | 233 |
| host role prompt | docs/roles/science-clinical/Sage_behavioral-scientist-role-prompt.md | 146 |
| deviation log | docs/specs/cross-cutting-system/DEVIATIONS.md | 76 |
| progress log | docs/specs/cross-cutting-system/PROGRESS.md | 22 |
| decision log | docs/specs/cross-cutting-system/TECHNICAL-DECISIONS.md | 73 |
| deviation log | docs/specs/epic-1-setup/DEVIATIONS.md | 109 |
| progress log | docs/specs/epic-1-setup/PROGRESS.md | 30 |
| decision log | docs/specs/epic-1-setup/TECHNICAL-DECISIONS.md | 211 |
| deviation log | docs/specs/epic-2-in-use/DEVIATIONS.md | 76 |
| progress log | docs/specs/epic-2-in-use/PROGRESS.md | 26 |
| decision log | docs/specs/epic-2-in-use/TECHNICAL-DECISIONS.md | 178 |
| deviation log | docs/specs/epic-3-review/DEVIATIONS.md | 44 |
| progress log | docs/specs/epic-3-review/PROGRESS.md | 18 |
| decision log | docs/specs/epic-3-review/TECHNICAL-DECISIONS.md | 92 |
| deviation log | docs/specs/epic-4-dynamic-schedule/DEVIATIONS.md | 218 |
| progress log | docs/specs/epic-4-dynamic-schedule/PROGRESS.md | 52 |
| decision log | docs/specs/epic-4-dynamic-schedule/TECHNICAL-DECISIONS.md | 295 |
| deviation log | docs/specs/epic-5-first-run-rebuilt/DEVIATIONS.md | 147 |
| progress log | docs/specs/epic-5-first-run-rebuilt/PROGRESS.md | 40 |
| decision log | docs/specs/epic-5-first-run-rebuilt/TECHNICAL-DECISIONS.md | 119 |
| deviation log | docs/specs/epic-6-day-first-first-run/DEVIATIONS.md | 133 |
| progress log | docs/specs/epic-6-day-first-first-run/PROGRESS.md | 36 |
| decision log | docs/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md | 95 |
| deviation log | docs/specs/epic-7-workflow/DEVIATIONS.md | 72 |
| progress log | docs/specs/epic-7-workflow/PROGRESS.md | 30 |
| decision log | docs/specs/epic-7-workflow/TECHNICAL-DECISIONS.md | 66 |
| deviation log | docs/specs/infrastructure/DEVIATIONS.md | 104 |
| progress log | docs/specs/infrastructure/PROGRESS.md | 32 |
| decision log | docs/specs/infrastructure/TECHNICAL-DECISIONS.md | 77 |
| ux spec | docs/ux/README.md | 20 |
| ux spec | docs/ux/branding-guide.md | 430 |
| ux spec | docs/ux/epic1_setup_ux_architecture.md | 766 |
| ux spec | docs/ux/epic2_in_use_ux_architecture.md | 452 |
| ux spec | docs/ux/epic3_review_ux_architecture.md | 375 |
| ux spec | docs/ux/landing-page-ux.md | 500 |
| ux spec | docs/ux/synapse_navigation_and_system_ux_architecture.md | 372 |
| ux spec | docs/ux/synapse_ui_component_needs_and_handoff.md | 373 |
| ux spec | docs/ux/synapse_ui_component_needs_and_handoff_v2.md | 1827 |
| ux spec | docs/ux/ux-spec-v1.1.md | 1098 |
| ux spec | docs/ux/ux-spec-v1.2.md | 756 |
| ux spec | docs/ux/ux-spec-v1.3.md | 644 |
| ux spec | docs/ux/ux-spec-v1.md | 700 |
| ux spec | docs/ux/workflow-ux-spec-v0.1.md | 552 |

## Collisions

Practice paths the target already holds; each stops for a ruling.

- `AGENTS.md`
- `CLAUDE.md`
- `docs/roles/`
- `package.json`
- `.claude/settings.json`
- `.github/workflows/`

## Hygiene

Reported, never scored.

- Branch: `feature/workflow`; equals `refs/remotes/origin/feature/workflow`
- Working tree: clean
- Worktrees: /Users/taylor/lighthouse/synapse/.claude/worktrees/beautiful-bhabha-f7c668
- Tracked files over 10 MB: none

**Differences from assess.md's table:** total 15 against 14. P5 scores 1 here (6 role-prompt paths carry an em-dash) where the table scored 0; the table counted spaces only. Everything else matches row for row. Still near.

## conscious-connections

- Path: `/Users/taylor/lighthouse/conscious-connections/conscious-connections`
- Commit: `162faefabff571e251acaee3ec3289957b564b25` on `fix/beta-qa-fixes`
- git status before: 1 entries, digest 56c57d88fd78; after: digest 56c57d88fd78 (identical)

### Migration assessment: conscious-connections

- Target: `/Users/taylor/lighthouse/conscious-connections/conscious-connections` at `162faefabff571e251acaee3ec3289957b564b25`
- Toolkit: `55533e6dd4f7e09403bca4b01a90b748fd3226d2`
- Total: **17** of 34 measured (17 of 17 signals)
- Gate: passed
- Path: **middle** (total 17: near up to 15, middle 16 to 21, far from 22)

## Shape

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| S1 | Workspaces and turbo.json | 3 | 0 | workspaces ["apps/*","packages/*"] in the root; turbo.json at the root |
| S2 | Toolchain majors against tech-stack | 3 | 0 | every major found matches the practice |

## Checks

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| C1 | One verify command | 2 | 1 | no verify script; .github/workflows/ci.yml chains lint, types, build |
| C2 | CI config | 2 | 0 | .github/workflows/ci.yml |
| C3 | Tests | 2 | 2 | no test runner; no test files |
| C4 | Type check and lint scripts | 2 | 0 | type check: check-types; lint: lint |
| C5 | Read-only format check | 2 | 1 | write-only: format: prettier --write "**/*.{ts,tsx,md}" |

## Conventions

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| V1 | Boundaries lint | 3 | 0 | packages/config/eslint/boundaries.js is tracked |
| V2 | Token preset | 3 | 0 | packages/config/tailwind/preset.css is tracked |
| V3 | process.env outside env.ts | 3 | 2 | 48 files read process.env outside an env.ts: apps/marketing/lib/clients/supabase/client.ts, apps/marketing/lib/config/env/resolve-tier-env.ts, apps/marketing/lib/config/toolkit-app-url.ts and 45 more |
| V4 | "use client" outside _components/ | 3 | 1 | 180 of 390 "use client" files sit outside a _components/ folder (46%) |
| V5 | SDK importers no reviewer glob matches | 3 | 2 | 20 of 51 SDK-importing files match no reviewer glob |

## Process

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Instruction lines that conflict | 1 | 1 | 3 lines against 2 policies (tests, branches): AGENTS.md:11, AGENTS.md:33 and 1 more |
| P2 | Docs with frontmatter | 1 | 2 | 12 of 360 markdown files under docs/ open with frontmatter (3%) |
| P3 | Record kinds in a foreign format | 1 | 2 | 2 host decisions, 3 deviation logs, 3 progress logs, 4 decision logs |
| P4 | Living truth | 1 | 1 | 12 UX spec files outside specs/<app>/ux/: docs/ux/brand-ethos.md, docs/ux/call-session-ux-handoff-v0_1.md, docs/ux/message-reactions-proposal-2026-08-10.md and 9 more |
| P5 | Doc paths with spaces or non-ASCII | 1 | 2 | 170 tracked markdown paths hold a space or a non-ASCII character: README.md, SKILL.md and 168 more |

## Conflicts

Instruction lines against a toolkit policy; the interview rules each team or operator.

| Policy | File | Line | Text |
| --- | --- | --- | --- |
| tests | AGENTS.md | 11 | 5. **Verify work** the way CI does: `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` (see Commands). There is **no test suite** — do not write tests during slices. |
| branches | AGENTS.md | 33 | - **No git branches or PRs** as part of slice work; commit to the working branch with clear messages. |
| tests | AGENTS.md | 34 | - **No tests during slices** — tests are a separate finalization pass after human QA. |

## SDK importers

Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.

| File | Module | Matched by |
| --- | --- | --- |
| apps/marketing/app/(site)/account/actions.ts | stripe | none |
| apps/marketing/app/admin/(protected)/subscriptions/_lib/billing-health.ts | stripe | none |
| apps/marketing/app/api/cron/affiliate-payouts/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/app/api/stripe/checkout/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/app/api/stripe/checkout/session/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/app/api/stripe/connect/onboard/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/app/api/stripe/connect/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/app/api/stripe/route.ts | stripe | apps/*/app/api/** |
| apps/marketing/components/providers/marketing-auth-provider.tsx | @supabase/supabase-js | none |
| apps/marketing/lib/auth/get-marketing-session.ts | @supabase/supabase-js | **/auth/** |
| apps/marketing/lib/billing/admin/issue-guarantee-refund.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/admin/repair-billing-data.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/admin/resolve-invoice-charge.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/get-checkout-debug-snapshot.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/affiliate-accrual.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/dispatch-event.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/guarantee-refund.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/handlers/checkout-completed.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/handlers/subscription-lifecycle.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/invoice-subscription.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/subscription-facts.ts | stripe | **/billing/** |
| apps/marketing/lib/billing/stripe-webhook/subscription-status.ts | stripe | **/billing/** |
| apps/marketing/lib/clients/supabase/client.ts | @supabase/ssr | none |
| apps/marketing/lib/clients/supabase/client.ts | @supabase/supabase-js | none |
| apps/marketing/lib/services/email/send-attachment-resources.ts | resend | none |
| apps/marketing/lib/services/email/send-confirmation.ts | resend | none |
| apps/marketing/lib/services/email/send-contact-message.ts | resend | none |
| apps/marketing/lib/services/email/send-onboarding-your-turn.ts | resend | none |
| apps/marketing/lib/services/email/send-partner-invite.ts | resend | none |
| apps/marketing/lib/stripe/connect-status.ts | stripe | none |
| apps/toolkit/lib/auth/get-request-context.ts | @supabase/supabase-js | **/auth/** |
| apps/toolkit/lib/auth/require-verified-email.ts | @supabase/supabase-js | **/auth/** |
| apps/toolkit/lib/clients/supabase/client.ts | @supabase/ssr | none |
| apps/toolkit/lib/clients/supabase/client.ts | @supabase/supabase-js | none |
| apps/toolkit/lib/hooks/use-review-channel.ts | @supabase/supabase-js | none |
| apps/toolkit/lib/hooks/use-session-presence.ts | @supabase/supabase-js | none |
| apps/toolkit/lib/realtime.ts | @supabase/supabase-js | none |
| packages/ai/src/client.ts | @ai-sdk/anthropic | none |
| packages/ai/src/client.ts | ai | none |
| packages/api/src/context.ts | @supabase/supabase-js | none |
| packages/api/src/services/storage/private-bucket.ts | @supabase/supabase-js | none |
| packages/api/src/services/tools/conflict-resolution/image/storage.ts | @supabase/supabase-js | none |
| packages/api/src/services/tools/conflict-resolution/voice/storage.ts | @supabase/supabase-js | none |
| packages/auth/src/admin.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/client.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/client.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/context.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/cookies.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/middleware.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/session.ts | @supabase/supabase-js | **/auth/** |
| packages/db/scripts/seed-users.ts | @supabase/supabase-js | none |
| packages/ui/src/composed/_storybook/mock-supabase.ts | @supabase/supabase-js | packages/ui/** |
| packages/ui/src/composed/auth/auth-capture/auth-capture-panel.tsx | @supabase/supabase-js | **/auth/** |
| packages/ui/src/composed/auth/password-reset/password-reset-form.tsx | @supabase/supabase-js | **/auth/** |

## Records by kind

| Kind | Path | Lines |
| --- | --- | --- |
| host decisions | docs/decisions/mlp-progress-report-2026-07-05.md | 371 |
| host decisions | docs/decisions/session-context-checkpoints-review-2026-07-26.md | 233 |
| host role prompt | docs/roles/engineering/Atlas—localization-i18n-specialist-role-prompt.md | 140 |
| host role prompt | docs/roles/engineering/Forge—staff-engineer-role-prompt.md | 144 |
| host role prompt | docs/roles/engineering/Gardner—growth-engineer-role-prompt.md | 148 |
| host role prompt | docs/roles/engineering/Loom—ai-systems-architect-role-prompt.md | 141 |
| host role prompt | docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md | 151 |
| host role prompt | docs/roles/engineering/Millwright—devops-platform-engineer-role-prompt.md | 143 |
| host role prompt | docs/roles/engineering/Scribe—technical-documentation-role-prompt.md | 148 |
| host role prompt | docs/roles/engineering/Sexton—pwa-web-push-engineer-role-prompt.md | 157 |
| host role prompt | docs/roles/engineering/Vigil—qa-role-prompt.md | 143 |
| host role prompt | docs/roles/engineering/Wainwright—react-native-mobile-engineer-role-prompt.md | 138 |
| host role prompt | docs/roles/engineering/Warden—security-privacy-engineer-role-prompt.md | 141 |
| host role prompt | docs/roles/marketing-growth/Cairn—seo-paid-search-role-prompt.md | 144 |
| host role prompt | docs/roles/marketing-growth/Cantor_ext—human-hand-mode.md | 102 |
| host role prompt | docs/roles/marketing-growth/Cantor—copywriter-role-prompt.md | 139 |
| host role prompt | docs/roles/marketing-growth/Ember—lifecycle-crm-role-prompt.md | 109 |
| host role prompt | docs/roles/marketing-growth/Hearth—brand-strategist-role-prompt.md | 144 |
| host role prompt | docs/roles/marketing-growth/Lantern—social-marketing-role-prompt.md | 124 |
| host role prompt | docs/roles/marketing-growth/Limner—email-designer-role-prompt.md | 148 |
| host role prompt | docs/roles/marketing-growth/Quire—long-form-editorial-writer-role-prompt.md | 145 |
| host role prompt | docs/roles/operations-strategy/Crucible—devils-advocate-role-prompt.md | 129 |
| host role prompt | docs/roles/operations-strategy/Pilot—business-advisor-role-prompt.md | 123 |
| host role prompt | docs/roles/operations-strategy/Reeve—project-manager-role-prompt.md | 142 |
| host role prompt | docs/roles/product-design/Antiphon—conversation-designer-role-prompt.md | 148 |
| host role prompt | docs/roles/product-design/Compass—product-strategist-role-prompt.md | 147 |
| host role prompt | docs/roles/product-design/Envoy—user-researcher-role-prompt.md | 133 |
| host role prompt | docs/roles/product-design/Lector—accessibility-specialist-role-prompt.md | 138 |
| host role prompt | docs/roles/product-design/Tribune—member-advocate-role-prompt.md | 139 |
| host role prompt | docs/roles/product-design/Vesper—ux-ui-designer-role-prompt.md | 151 |
| host role prompt | docs/roles/role-authoring-guide.md | 0 |
| host role prompt | docs/roles/science-clinical/Finch—data-scientist-role-prompt.md | 145 |
| host role prompt | docs/roles/science-clinical/Rowan—therapist-consultant-role-prompt.md | 122 |
| host role prompt | docs/roles/science-clinical/Sage—behavioral-scientist-role-prompt.md | 139 |
| host role prompt | docs/roles/trust-legal-compliance/Chancery—regulatory-counsel-role-prompt.md | 110 |
| host role prompt | docs/roles/trust-legal-compliance/Porter—member-support-trust-safety-role-prompt.md | 108 |
| deviation log | docs/specs/affiliate-crm/DEVIATIONS.md | 23 |
| progress log | docs/specs/affiliate-crm/PROGRESS.md | 15 |
| decision log | docs/specs/affiliate-crm/TECHNICAL-DECISIONS.md | 148 |
| deviation log | docs/specs/conflict-resolution/DEVIATIONS.md | 846 |
| progress log | docs/specs/conflict-resolution/PROGRESS.md | 413 |
| decision log | docs/specs/conflict-resolution/TECHNICAL-DECISIONS.md | 2184 |
| decision log | docs/specs/ip-security/TECHNICAL-DECISIONS.md | 36 |
| deviation log | docs/specs/resources/DEVIATIONS.md | 37 |
| progress log | docs/specs/resources/PROGRESS.md | 21 |
| decision log | docs/specs/resources/TECHNICAL-DECISIONS.md | 127 |
| ux spec | docs/ux/brand-ethos.md | 235 |
| ux spec | docs/ux/call-session-ux-handoff-v0_1.md | 311 |
| ux spec | docs/ux/message-reactions-proposal-2026-08-10.md | 273 |
| ux spec | docs/ux/opening-ceremony-amendment-2026-07-24.md | 31 |
| ux spec | docs/ux/remember-why-threshold-proposal-2026-07-25.md | 91 |
| ux spec | docs/ux/resolution-close-flow-proposal-2026-07-28.md | 137 |
| ux spec | docs/ux/session-chrome-and-composer-proposal-2026-07-24.md | 122 |
| ux spec | docs/ux/support-widget-proposal-2026-08-12.md | 162 |
| ux spec | docs/ux/ux-design-handoff-v1.3.md | 1427 |
| ux spec | docs/ux/voice-session-ux-handoff-v0.1.md | 305 |
| ux spec | docs/ux/waiting-room-exploration-amendment-2026-07-25.md | 31 |
| ux spec | docs/ux/waiting-room-proposal-2026-07-24.md | 27 |

## Collisions

Practice paths the target already holds; each stops for a ruling.

- `AGENTS.md`
- `CLAUDE.md`
- `docs/roles/`
- `package.json`
- `.claude/settings.json`
- `.github/workflows/`

## Hygiene

Reported, never scored.

- Branch: `fix/beta-qa-fixes`; equals `refs/remotes/origin/fix/beta-qa-fixes`
- Working tree: 1 changed or untracked entries
- Worktrees: /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/funny-northcutt-ee67e2, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/gracious-torvalds-845114, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/great-ritchie-7d55b2, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/heuristic-euclid-5da7e7, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/pensive-archimedes-d7e471, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/practical-diffie-9b5d2b, /Users/taylor/lighthouse/conscious-connections/conscious-connections/.claude/worktrees/vibrant-chandrasekhar-dc9835
- Tracked files over 10 MB: none

**Differences from assess.md's table:** total 17 against 18. P4 scores 1 here (12 UX files under `docs/ux/`, archives excluded) where the table scored 2 ("not found by name"); the table looked for a spec by name, this detector also reads a `ux/` folder segment. P5 counts 170 paths (spaces and em-dashes together) against the table's 57 with spaces; same score. Still middle.

## taylor-aucoin

- Path: `/Users/taylor/lighthouse/taylor-aucoin`
- Commit: `2cb1e7b6d9bd90df68a431b960dfe808729e64a8` on `feature/review-process`
- git status before: 3 entries, digest 84718bdce2cf; after: digest 84718bdce2cf (identical)

### Migration assessment: taylor-aucoin

- Target: `/Users/taylor/lighthouse/taylor-aucoin` at `2cb1e7b6d9bd90df68a431b960dfe808729e64a8`
- Toolkit: `55533e6dd4f7e09403bca4b01a90b748fd3226d2`
- Total: **24** of 34 measured (17 of 17 signals)
- Gate: **failed** (S1 = 2: no workspaces and no turbo.json)
- Path: **far** (the gate: S1 = 2: no workspaces and no turbo.json)

## Shape

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| S1 | Workspaces and turbo.json | 3 | 2 | no workspaces in the root package.json; no turbo.json at the root |
| S2 | Toolchain majors against tech-stack | 3 | 1 | off: next ^15.1.0 in package.json (practice: Next.js 16); not declared: Node |

## Checks

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| C1 | One verify command | 2 | 2 | no verify script, and no CI file chains two kinds of check |
| C2 | CI config | 2 | 2 | no CI file is tracked |
| C3 | Tests | 2 | 2 | no test runner; no test files |
| C4 | Type check and lint scripts | 2 | 0 | type check: typecheck; lint: lint |
| C5 | Read-only format check | 2 | 1 | write-only: format: prettier --write "**/*.{ts,tsx,md}" |

## Conventions

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| V1 | Boundaries lint | 3 | 2 | no packages/config/eslint/boundaries.js |
| V2 | Token preset | 3 | 2 | no packages/config/tailwind/preset.css |
| V3 | process.env outside env.ts | 3 | 1 | 16 files read process.env outside an env.ts: app/banner-export/save/route.ts, app/websites/coded/intake/_actions/start.ts, app/websites/intake/_actions/start.ts and 13 more |
| V4 | "use client" outside _components/ | 3 | 1 | 25 of 157 "use client" files sit outside a _components/ folder (16%) |
| V5 | SDK importers no reviewer glob matches | 3 | 2 | 18 of 29 SDK-importing files match no reviewer glob |

## Process

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Instruction lines that conflict | 1 | 0 | no line in 2 instruction file(s) contradicts a toolkit policy |
| P2 | Docs with frontmatter | 1 | 2 | 0 of 163 markdown files under docs/ open with frontmatter (0%) |
| P3 | Record kinds in a foreign format | 1 | 2 | 7 deviation logs, 7 progress logs, 7 decision logs |
| P4 | Living truth | 1 | 1 | 3 UX spec files outside specs/<app>/ux/: docs/admin/ADMIN-UX-SPEC.md, docs/crm/CRM-UX-SPEC.md, docs/intake/INTAKE-UX-SPEC.md |
| P5 | Doc paths with spaces or non-ASCII | 1 | 1 | 10 tracked markdown paths hold a space or a non-ASCII character: Forge—staff-engineer-role-prompt.md, Loom—ai-systems-architect-role-prompt.md and 8 more |

## Conflicts

Instruction lines against a toolkit policy; the interview rules each team or operator.

none

## SDK importers

Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.

| File | Module | Matched by |
| --- | --- | --- |
| app/api/webhooks/stripe/_handlers/checkout-session-async-failed.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/checkout-session-async-succeeded.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/checkout-session-completed.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/deposit-settlement.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/index.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/invoice-finalized.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/invoice-marked-uncollectible.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/invoice-paid.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/invoice-payment-failed.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/_handlers/types.ts | stripe | **/webhooks/** |
| app/api/webhooks/stripe/route.ts | stripe | **/webhooks/** |
| middleware.ts | @supabase/ssr | none |
| scripts/grant-admin.ts | @supabase/supabase-js | none |
| scripts/seed-example-sites.ts | @supabase/supabase-js | none |
| scripts/setup-stripe-catalogue.ts | stripe | none |
| scripts/verify-storage.ts | @supabase/supabase-js | none |
| server/services/admin-auth.ts | @supabase/ssr | none |
| server/services/agora-invoicing.ts | stripe | none |
| server/services/come-across.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/deposit.ts | stripe | none |
| server/services/emails.ts | resend | none |
| server/services/example-captures.ts | @supabase/supabase-js | none |
| server/services/extract.ts | @anthropic-ai/sdk | none |
| server/services/extract.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/invoices.ts | @supabase/supabase-js | none |
| server/services/invoices.ts | stripe | none |
| server/services/orders.ts | stripe | none |
| server/services/primer.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/style-search.ts | @anthropic-ai/sdk | none |
| server/services/style-search.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/submission.ts | @supabase/supabase-js | none |
| server/services/voice-transcription.ts | openai | none |

## Records by kind

| Kind | Path | Lines |
| --- | --- | --- |
| ux spec | docs/admin/ADMIN-UX-SPEC.md | 370 |
| deviation log | docs/admin/specs/DEVIATIONS.md | 133 |
| progress log | docs/admin/specs/PROGRESS.md | 19 |
| decision log | docs/admin/specs/TECHNICAL-DECISIONS.md | 18 |
| ux spec | docs/crm/CRM-UX-SPEC.md | 178 |
| deviation log | docs/crm/specs/DEVIATIONS.md | 91 |
| progress log | docs/crm/specs/PROGRESS.md | 26 |
| decision log | docs/crm/specs/TECHNICAL-DECISIONS.md | 288 |
| deviation log | docs/finance/specs/DEVIATIONS.md | 26 |
| progress log | docs/finance/specs/PROGRESS.md | 13 |
| decision log | docs/finance/specs/TECHNICAL-DECISIONS.md | 63 |
| ux spec | docs/intake/INTAKE-UX-SPEC.md | 310 |
| deviation log | docs/intake/specs/DEVIATIONS.md | 123 |
| progress log | docs/intake/specs/PROGRESS.md | 123 |
| decision log | docs/intake/specs/TECHNICAL-DECISIONS.md | 191 |
| deviation log | docs/pipeline/specs/DEVIATIONS.md | 32 |
| progress log | docs/pipeline/specs/PROGRESS.md | 107 |
| decision log | docs/pipeline/specs/TECHNICAL-DECISIONS.md | 60 |
| deviation log | docs/review/specs/DEVIATIONS.md | 30 |
| progress log | docs/review/specs/PROGRESS.md | 56 |
| decision log | docs/review/specs/TECHNICAL-DECISIONS.md | 60 |
| host role prompt | docs/roles/engineering/Forge—staff-engineer-role-prompt.md | 147 |
| host role prompt | docs/roles/engineering/Loom—ai-systems-architect-role-prompt.md | 143 |
| host role prompt | docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md | 145 |
| host role prompt | docs/roles/engineering/Reeve—project-manager-role-prompt.md | 143 |
| host role prompt | docs/roles/engineering/Vigil—qa-role-prompt.md | 149 |
| host role prompt | docs/roles/engineering/Warden—security-privacy-engineer-role-prompt.md | 144 |
| host role prompt | docs/roles/marketing-growth/Drummer—sales-funnel-lead-role-prompt.md | 146 |
| host role prompt | docs/roles/product-design/Vesper—ux-ui-designer-role-prompt.md | 147 |
| host role prompt | docs/roles/trust-legal-compliance/Chancery—regulatory-counsel-role-prompt.md | 146 |
| host role prompt | docs/roles/trust-legal-compliance/Porter—member-support-trust-safety-role-prompt.md | 145 |
| deviation log | docs/websites/specs/DEVIATIONS.md | 250 |
| progress log | docs/websites/specs/PROGRESS.md | 94 |
| decision log | docs/websites/specs/TECHNICAL-DECISIONS.md | 471 |

## Collisions

Practice paths the target already holds; each stops for a ruling.

- `AGENTS.md`
- `CLAUDE.md`
- `docs/roles/`
- `package.json`

## Hygiene

Reported, never scored.

- Branch: `feature/review-process`; ahead `refs/remotes/origin/feature/review-process` (ahead 1, behind 0)
- Working tree: 3 changed or untracked entries
- Worktrees: none
- Tracked files over 10 MB: public/work/agora/home/agora-home-demo.mov (71 MB)

**Differences from assess.md's table:** total 24 against 23. P5 scores 1 here (10 role-prompt paths carry an em-dash) where the table scored 0. V3 is 16 as the table says once the committed Yarn release is excluded. Still far, by the gate and by the total.
