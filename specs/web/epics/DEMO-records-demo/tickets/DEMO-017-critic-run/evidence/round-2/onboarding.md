# Review — onboarding, round 2
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/onboarding.md (there is no living specs/web/ux/ copy); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/onboarding.ts; .claude/skills/tk-ui-critic/calibration/exemplars.md (index only, no images opened)
Coverage: 48/48 files read; missing: none

Top 3
1. Measure contrast on two regions judged only by eye: the dark inert "Delete record" tint (beat-3 dark, all widths, about 749,248 to 858,278 at 1440) and the light disabled "Next" (loading light, about 956,482 to 1007,516 at 1440). Both look at or above AA, but a still cannot measure them.
2. File a tk-motion review for the beat fade (opacity, at most 200ms, instant under reduced motion). C-R12 stays NOT RUN until one exists.
3. Run C-DEMO-onboarding-8 (keyboard alone at 390, with visible focus). No capture shows focus, Skip or the h1 focus move.

Lines
C-R01 PASS — no finding is raised, so no evidence is missing; every one of the 48 expected captures was read.
C-R02 PASS — in greyscale each beat has one focal point: the h1 plus the solid primary. The illustration, "Step n of 3" and the muted body recede. At 390 the column re-flows (wrapped vendor names, a 2-line h1) and is not just shrunk.
C-R03 PASS — one solid primary per view (Next / Go to records / New record). The tinted "Delete record" sits only inside the inert dialog illustration, as D-DEMO-11 rules.
C-R04 PASS — 4 sizes: xs (badges, empty sub-line), sm (bar, step, rows, buttons), base (body, about 16px), 2xl (h1).
C-R05 PASS — the screen has no inputs. Action labels are outcome verbs. "Step n of 3" encodes a real sequence.
C-R06 PASS — gaps between groups are larger than gaps within at every width: step to bar about 8px, bar to slot about 32px, slot to h1 about 36–48px, h1 to body about 12px, body to actions about 36px. Gutters are 16px at 390 and the column is centred at 834 and 1440.
C-R07 PASS — one bordered surface per illustration and no nested cards. Row dividers sit only inside the 3-row mini table. The beat-3 dialog's shadow is the dialog's own level.
C-R08 PASS — no color, radius or shadow outside the neutral token set is visible. Dark surfaces are near-black tokens, not pure #000.
C-R09 PASS — there is no accent. The destructive hue appears only on the inert delete. "Expiring" carries a triangle icon plus text, so it does not rely on color alone. Muted text reads above AA by eye in both themes.
C-R10 PASS — all 8 states in states.md are captured at 390, 834 and 1440, light and dark. Empty is designed. The loading skeleton matches the final beat-1 layout at every width (390: slot 170–354, 2-line title, 3-line body, Next about 568). That closes the round-1 skeleton height issue. Next is visibly disabled.
C-R11 PASS — in the beat-1 and offline row values, the right edges align at 983 (1440) and 349 (390), with the unit "USD" placed after the figure and baselines shared within each row.
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — every element has its stated job: the top bar, step and progress, the illustration with its job line, the h1, body and actions. The partial state removes the illustration as the spec says.
C-R14 PASS — none of A-01 to A-20 is present. Geist is declared in DESIGN.md (not A-01), loading uses a skeleton (no A-18, no shimmer), and the offline alert has an icon and text with no stripe (no A-05).
C-R15 N/A — no references file loaded for this run.
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440. Skip shows on beat-1, beat-2, loading, partial and offline at every width. Only line wrapping changes.
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- none

Not covered: the default view without `?state=`; hover, focus and active styles for Skip, Back and the primary; the h1 focus move on each beat change; the beat fade and reduced-motion behaviour; measured contrast ratios (dark inert "Delete record" tint, light disabled "Next"); that the illustration is aria-hidden and inert; router.replace on beat change.
Verdict: PASS
