# Review — onboarding, round 1
Model: claude-opus-5-5
Read: .claude/skills/tk-ui-critic/SKILL.md; docs/design/canon-rubric.md; docs/design/canon.md §2 (A-01 to A-20); apps/web/docs/design/DESIGN.md, tokens.md, components.md, anti-patterns.md, states.md; specs/web/epics/DEMO-records-demo/ux/demo/onboarding.md (no living specs/web/ux/demo/ copy exists); specs/web/epics/DEMO-records-demo/brief.md; apps/web/lib/demo/surfaces/onboarding.ts; source to check regions: apps/web/app/demo/welcome/_components/onboarding-view.tsx, apps/web/app/demo/welcome/_components/beat-illustration.tsx, packages/ui/src/primitives/display/progress/progress.tsx
Coverage: 48/48 files read; missing: none

Top 3
1. The loading skeleton does not copy the 390 layout. It always draws a one-line title and two body lines, but at 390 the beat-1 title wraps to two lines and the body to three, so the page shifts when it loads (states.md, C-R10).
2. Beat-3's illustration slot breaks the slot pattern. It is a narrow, raised, rounded-xl card, where beats 1 and 2 use a full-width bordered radius-lg panel, so the slot's size and edge change from beat to beat.
3. The inert illustration shows controls that look live: Cancel and Delete record on beat-3. A sighted evaluator will try to click them and nothing happens.

Lines
C-R01 PASS — every finding below cites a capture region or file:line
C-R02 PASS — desaturated, the h1 and the one filled button lead on every key; muted body and step label recede; 390 restacks into one column with its own gutters
C-R03 PASS — one solid primary per view (Next / Go to records / New record); the delete in the illustration is the kit tint, never primary
C-R04 PASS — four sizes seen (12 badge, 14 bar, step and table, 16 body, 24 h1); reading text 16px
C-R05 1 issue — no inputs; action labels are outcome verbs; "Step n of 3" encodes a real sequence; the inert dialog buttons read as live (Consider)
C-R06 PASS — gaps within groups (8px step to bar, 8px title to body) are smaller than between groups (32px); 390 uses 16px gutters
C-R07 1 issue — beat-3 slot uses a different radius and shadow from the other beats' panels (Consider)
C-R08 PASS — no off-token color, radius or shadow seen; the progress track (bg-input), panels and skeletons are token classes
C-R09 PASS — no accent; destructive tint marks loss only; status badges carry a glyph (dot, triangle), not color alone
C-R10 1 issue — all 8 keys captured and empty is designed; the loading skeleton misses the 390 final layout
C-R11 PASS — values are tabular-nums, right-aligned, unit after, on a shared baseline (beat-illustration.tsx:41)
C-R12 NOT RUN (no tk-motion review filed)
C-R13 PASS — every element has a job: the bar names the product, Skip exits, the slot illustrates the beat
C-R14 PASS — A-01 waived by DESIGN.md (Geist chosen); skeletons animate-none, so no A-14 shimmer; no A-18 spinner; no A-05 stripe on the offline alert; no A-19 or A-20
C-R15 N/A — no references file loaded for this run
P-A01 PASS — each key keeps the same words and rows at 390, 834 and 1440; only wrapping and gutters change
Code lint: UNVERIFIED (tk-ui-code-lint not installed)

Findings
- [Should-fix] C-R10 · loading 390 light and dark · text skeleton block about (16,387)-(344,471); apps/web/app/demo/welcome/_components/onboarding-view.tsx:107-111 · fixed h-6 title bar plus two h-4 body bars at every width, while beat-1 at 390 renders a two-line h1 at about (16,390)-(290,450) and three body lines to about y=528, so the content below jumps about 60px when it loads; states.md requires skeletons that copy each width's final layout: make the bar count follow the width (2 title + 3 body below md)
- [Consider] C-R07 · beat-3 390, 834 and 1440, light and dark · illustration at 1440 about (560,186)-(880,300); beat-illustration.tsx:69 · a max-w container-xs, rounded-xl, shadow-raised card, where beats 1 and 2 put a full-column rounded-lg bordered panel at about (432,186)-(1008,332); the spec's slot is "a bordered --radius-lg panel" holding the mini dialog; keep the panel and put the dialog inside it, so the slot's width and edge hold across beats
- [Consider] C-R05 · beat-3 1440 light and dark (also 834, 390) · Cancel and Delete record about (673,247)-(858,279) · both look exactly like live buttons but are inert and aria-hidden by design; a sighted evaluator will click and get nothing; consider a visual cue that this is a picture (reduced opacity, or a caption like beat-2's)
- [Consider] C-R07 · empty 390, 834 and 1440, light and dark · slot at 1440 about (432,210)-(1008,270) · the empty-table line floats with no bordered panel, unlike every other slotted key; the spec puts it in the same bordered slot

Not covered: the default view without ?state= (beat-1 is the declared default but was captured by key); hover, active and focus on Skip, Back and primary (including h1 focus on a beat change and keyboard focus visibility, C-DEMO-onboarding-8); the beat fade and reduced-motion instant change; measured contrast ratios (muted body in dark, the disabled Next in loading, the destructive tint in dark), all of which look at or above AA by eye; whether the inert illustration takes focus
Verdict: PASS

