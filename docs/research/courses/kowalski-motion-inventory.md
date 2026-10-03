---
title: "Emil Kowalski's public motion work: a source-faithful inventory"
description: "Read when verifying an A# or WE: atom cited by the motion skill."
layer: research
status: archived
thread: "07"
role: Alembic
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Emil Kowalski's public motion work: a source-faithful inventory (phase 1 of the motion skill)

Short answer: yes, Kowalski's public material is enough to build most of a motion SKILL.md. It gives you explicit, dated rules for easing, duration, frequency of use, performance, interruptibility, reduced motion, stagger and gestures, along with exact values. He has also published his own agent skills (github.com/emilkowalski/skills).\[1\] What stays behind the wall is the paid lesson bodies, the 18 custom easings (only 6 are publicly visible), and the course's 15-skill pack.

**How this was produced and its limits**
- The research ran out of turns before the planned targeted subagent and the enrichment pass could run. Neither happened.
- Sonner's `styles.css` and Vaul's source code could not be fetched directly. Values from those files appear only where Kowalski's own blog quotes them, or through a third-party index, which is labeled secondary.
- Talks and podcasts: NOT FOUND. No searchable transcripts turned up.
- The waitlist preview lessons: NOT REACHED, because they need an email signup.
- All sources were accessed 2026-09-30. Where no publication date was visible, the entry says "undated".

## TL;DR
- **The public layer is thick.** It includes 15 or more blog posts on emilkowal.ski. It also includes his own open-source skill files (`emil-design-eng`, `review-animations/STANDARDS.md`, `find-animation-opportunities`), which state explicit duration tables, easing flowcharts, named cubic-beziers, spring configs, stagger ranges and reduced-motion rules.
- **The course itself is mostly walled.** Module and walkthrough names are public, along with a few lesson titles and descriptions from the changelog. The lesson bodies are [NOT IN SOURCE].
- **Some of his own statements disagree with each other**, and they are reported below without being averaged:
  - Modal and drawer duration: 200–300ms in the "Agents with Taste" blog excerpt, versus 200–500ms in the GitHub skill files, versus 500ms in Vaul.
  - Starting scale: "0.9+", then 0.95, then 0.9–0.97, then 0.5 for Clerk's toast.
  - Sonner's weekly download count: 40M, versus 13M+, versus a combined "90,000,000" for Sonner plus Vaul.

## Profile verification
- **Linear (verified).**
  - emilkowal.ski homepage: "I work on the Web team at Linear."\[2\]
  - animations.dev "Hey, I'm Emil": "I'm currently working at Linear as a design engineer."\[3\]
- **Vercel (verified).**
  - "Animating in Public" (undated): "That led me to join Vercel as a design engineer on the design team in late 2022."\[4\]
  - Homepage: "Previously, I worked on the design team at Vercel."\[2\]
- **Compound.** Before Vercel he held his "first job at a VC-backed startup," Compound. In 2021 he was "working at an agency building apps with Vue.js" (source: Animating in Public).\[4\]
- **Start date at Linear:** [NOT IN SOURCE].
- **Tools, in his own words:**
  - "I usually use Framer Motion for animations" (The Magic of Clip Path, blog post linked from his tweet of 2024-07-09).\[5\]
  - The course teaches "CSS Animations and Framer Motion" (animations.dev).\[3\]
  - The changelog of 2026-04-14 says course examples moved "from framer-motion to motion/react".\[6\]
  - He uses WAAPI and the Intersection Observer API (Clip Path post).\[5\]
  - He uses Anthropic's skill-creator skill (Agents with Taste).\[7\]
  - He cites easings.co and easing.dev as curve resources (7 Practical Animation Tips; Good vs Great Animations).\[8\]\[9\]
- **Stated philosophy:** "I see animations on the web as a form of art, and care deeply about how they look, feel, and behave. I want people to have a moment of joy when they use the things I create." (animations.dev, "Hey, I'm Emil")\[3\]

## (a) Curriculum skeleton: animations.dev

All rows are from https://animations.dev (marketing page) or https://animations.dev/changelog.

| # | Module / lesson | Status | Locator | Public description |
|---|---|---|---|---|
| M1 | Module 1: Animation Theory | Description only | animations.dev "What you'll learn" | "8 lessons… easing, spring animations, timing, purpose, taste, and more." The changelog (2025-10-07) says "All 7 lessons have been updated".\[3\]\[6\] The count differs between pages (8 vs 7) and is shown as stated. |
| M1.x | "Spring animations" (under "Making it feel right") | [TITLE ONLY] (seen in a screenshot alt text: video 5:46) | animations.dev hero screenshot alt | none |
| M1.x | "Practical Animation Tips" | Description | changelog 2025-10-07 | "contains more than 15 tips"; 3 tips added 2026-04-14 and 5 added 2026-01-20\[6\] |
| M1.x | "Animations and AI" | Description | changelog 2025-07-08; FAQ | Covers how AI helps with animations. Ships the skill file ("15 AI skills" per the marketing page).\[3\]\[6\] |
| M1.x | "Train your judgement" | Description | changelog 2026-04-14 | "more than 25 exercises, each of them shows two animations side by side"\[6\] |
| M1.x | Guest lesson "Animations as Proof of Care" (Josh Puckett) | Description | changelog 2026-04-14 | differentiating through "uncommon care"\[6\] |
| M2 | Module 2: CSS animations | Description | animations.dev; changelog 2025-01-14 | transforms, transitions, keyframes, clip-path; builds a toast, blinking cursor, orbit, tabs\[6\] |
| M2.x | "The Magic of Clip Path" (lesson) | [TITLE ONLY] in course; a public blog post has the same title | changelog 2025-04-08 | Hold to Delete exercise added\[6\] |
| M3 | Module 3: Framer Motion (now Motion) | Description | animations.dev | builds a Feedback popover ("3 separate exercises")\[3\] |
| M3.x | Two lessons on hooks (`useSpring`, `useTransform`) | Description | changelog 2025-04-08 | card hover, interactive graph ("meant for illustrations, not functional graphs")\[6\] |
| M3.x | "Animating in Public" | [TITLE ONLY] plus a note on recording tips | changelog 2025-04-08 | recording tips |
| M3.x | "How I code animations" | [TITLE ONLY] (named by a reviewer and in an image path) | animations.dev review (Timothy Ogbemudia) | none |
| M4 | Module 4: Good vs Great animations | Description | animations.dev | "transfer feelings… orchestration, accessibility, performance"\[3\] |
| W | Walkthroughs: "4 walkthroughs… 15 lessons" | Description | animations.dev | Family Drawer, Dynamic Island, Navigation Menu, SVG Animations\[3\] |
| W1 | Family's drawer | Description | animations.dev | "drawer for mobile devices used in the Family's iOS app"\[3\] |
| W2 | Dynamic Island | Description | animations.dev | "focus… on the spring animation"\[3\] |
| W3 | Navigation menu (3 parts) | Description | changelog 2025-07-08 | "easing, duration, and so on"\[6\] |
| W4 | Hero illustration / SVG (6 lessons: 3 SVG fundamentals + 2 specific animations; one lesson unnamed) | Description | changelog 2026-01-20 | viewBox, path syntax, stroke drawing, SVG transform-origin\[6\] |
| B | Bonus: Vault, interviews (Brotzky, Mariana Castilho, Henry Heffernan, Lochie Axon), easings set, Discord | Description | animations.dev; Building an animation course | no lesson bodies |

The changelog totals the course as "more than 35 lessons and 40+ exercises".\[6\] The "Building an animation course" post says "more than 50 exercises".\[10\] Both are reported as stated.

## (b) Atom table

Format: Source | Locator | Excerpt | Gloss. All items are verified primary sources unless marked otherwise.

### Cluster 1: Easing (distinct sources: 6)
1. 7 Practical Animation Tips | #4 | "Easing… is the most important part of any animation." | Easing ranked first.\[8\]
2. Same | #4 | "If you are animating something that is entering or exiting the screen, use `ease-out`." | Rule for enter and exit.\[8\]
3. Same | #4 | "this easing is just not made for UI animations" (about ease-in) | Rejects ease-in.\[8\]
4. Same | #4 | "The built-in easing curves in CSS are usually not strong enough, which is why I almost never use them." | Prefers custom curves.\[8\]
5. Good vs Great Animations | "Use the right easing" | "Since we're moving something that is already on the screen… just like a car." | ease-in-out for on-screen movement.\[9\]
6. Same | "Use custom easing curves" | "`ease` is an exception as it works well for basic hover effects" | ease for hover.\[9\]
7. Agents with Taste | Easing Decision Flowchart | [PARAPHRASE] enter/exit → ease-out; moving/morphing → ease-in-out; hover → ease; constant motion → linear; default → ease-out | Strict decision tree.\[7\]
8. Great Animations | "fast" | "The best type of easing for this purpose is `ease-out`." | Fast feel.\[11\]
9. emil-design-eng SKILL.md | §3 | "Never use ease-in for UI animations." | Stated as a hard rule.\[12\]
10. Same | §3 | `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`; `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`; `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` | Named curves [STATED AS RECOMMENDATION].\[12\]\[13\]\[14\]
11. changelog 2025-07-08 (Cursor rules excerpt) | code block | "Don't use built-in CSS easings unless it's `ease` or `linear`." | Course rule, visible publicly.\[6\]

### Cluster 2: Springs vs durations (distinct sources: 4)
12. Great Animations | "feel natural" | "I highly suggest playing around with spring animations in your projects." | Encourages springs.\[11\]
13. Good vs Great | "Spring-based interactions" | "use the `useSpring` hook from Framer Motion… rather than updating them immediately." | Springs for mouse-driven values.\[9\]
14. emil-design-eng | Spring Animations | "Springs feel more natural than duration-based animations because they simulate real physics." | Why springs.\[12\]
15. Same | When to use springs | [PARAPHRASE] drag with momentum, "alive" elements, interruptible gestures, decorative mouse-tracking | Use cases.\[12\]
16. Same | Spring configuration | "Apple's approach (recommended — easier to reason about)" `{ type: "spring", duration: 0.5, bounce: 0.2 }` | Recommended config.\[12\]\[14\]
17. Same | same | "Keep bounce subtle (0.1-0.3) when used. Avoid bounce in most UI contexts." | Bounce limits.\[12\]\[14\]
18. Same | Interruptibility advantage | "Springs maintain velocity when interrupted" | Springs keep velocity when interrupted.\[12\]\[14\]

### Cluster 3: Timing and duration (distinct sources: 6)
19. You Don't Need Animations | "Perception of speed" | "As a rule of thumb, UI animations should generally stay under `300ms`." | Upper limit (repeated in 7 Tips #6).\[8\]\[15\]
20. Same | same | "A `180ms` dropdown animation feels more responsive than a `400ms` one" | Comparison.\[15\]
21. Same | same | "Unless you are working on marketing sites, your animations *have* to be fast." | Exception for marketing sites.\[15\]
22. Agents with Taste | Duration Guidelines | Micro-interactions 100–150ms; tooltips/dropdowns 150–250ms; modals/drawers 200–300ms | Table as published in the blog.\[7\]
23. emil-design-eng §4 / STANDARDS | Duration | Button press 100–160ms; tooltips 125–200ms; dropdowns 150–250ms; modals/drawers 200–500ms | Table as published in the GitHub skill.\[12\]\[14\] **Contradicts atom 22 on modals and drawers (200–300ms vs 200–500ms). Neither page shows a visible date.**
24. Agents with Taste | Rules | "Larger elements animate slower than smaller ones"; "Match duration to distance" | Scaling rules.\[7\]
25. changelog 2025-07-08 | Cursor rules | "Animations should never be longer than 1s (unless it's illustrative), most of them should be around 0.2s to 0.3s." | Course rule.\[6\]
26. Great Animations | "have a purpose" | "can't imagine how frustrating it would be… a 500ms enter animation" (about Raycast) | 500ms named as too long for a high-frequency tool.\[11\]

### Cluster 4: Enter vs exit asymmetry (distinct sources: 3)
27. Agents with Taste | Rules | "Exit animations can be ~20% faster than entrance" | Ratio.\[7\]
28. Hold to Delete | "Polishing it up" | "Pressing should be slow to allow the user to confirm their choice, but the release can be much snappier." | Asymmetric press and release.\[16\]
29. emil-design-eng | Asymmetric timing | "slow where the user is deciding, fast where the system is responding." | General rule.\[12\]
30. You Don't Need Animations | Purposeful | "Because it comes from and leaves in the same direction, it creates spatial consistency" | Sonner uses a symmetric path.\[15\]

### Cluster 5: When not to animate (distinct sources: 5)
31. You Don't Need Animations | Frequency | "I use Raycast hundreds of times a day… there's no animation at all. That's the optimal experience." | Example of optimal no-animation.\[15\]
32. Same | same | "The same goes for keyboard-initiated actions… You should *never* animate them." | Hard rule.\[15\]
33. Same | Building great interfaces | "sometimes the best animation is no animation." | Thesis of the post.\[15\]
34. Good vs Great | Spring-based | "If this was a functional graph, in a banking app for example, no animation would be better." | Functional, data-heavy UI stays still.\[9\]
35. find-animation-opportunities SKILL.md | Gate 4 | "Data the user is trying to *read* or *act on* should not move for style." | Rule for dense UI.\[17\]
36. Same | Gate 2 | "'It looks cool' is not on this list." | A purpose is required.\[17\]

### Cluster 6: Reduced motion (distinct sources: 3)
37. Great Animations | "accessible" | "Animations can make people feel sick or get distracted." | Why it matters.\[11\]
38. Same | code | `@media (prefers-reduced-motion: reduce)` swaps `bounce 0.2s` for `fade 0.2s`; `useReducedMotion` sets closedX to 0 | Implementation pattern.\[11\]
39. emil-design-eng | Accessibility | "Reduced motion means fewer and gentler animations, not zero." | Keep opacity and color changes, remove movement.\[12\]\[14\]

### Cluster 7: Performance (distinct sources: 5)
40. Great Animations | "performant" | "try to animate with `transform` and `opacity` as they only trigger the third rendering step (composite)" | Property choice.\[11\]
41. Same | same | "If the main thread is busy, you should animate using hardware-accelerated animations like CSS or WAAPI" | CSS vs JS.\[11\]
42. Same | same | Vercel dashboard tab using Shared Layout Animations "dropped frames. We fixed this by using CSS animations" | Case study.\[11\]
43. Building a drawer component | Drag gesture | "Since CSS Variables are inheritable, changing them will cause style recalculation for all children" | Pitfall of driving motion through CSS variables.\[18\]
44. emil-design-eng | Framer Motion caveat | "Framer Motion's shorthand properties (`x`, `y`, `scale`) are NOT hardware-accelerated." | Use a full `transform` string instead.\[12\]\[14\]
45. Agents with Taste | Practical Tips | "Shaky/jittery animations → Add `will-change: transform`" | Only will-change statement found.\[7\]
46. The Magic of Clip Path | Animating images | "`clip-path` is hardware-accelerated, so it's more performant than animating the height" | clip-path vs height.\[5\]
47. emil-design-eng | Blur | "Keep blur under 20px. Heavy blur is expensive, especially in Safari." | Blur cost.\[12\]\[14\]

### Cluster 8: Choreography and stagger (distinct sources: 3)
48. emil-design-eng | Stagger | "Keep stagger delays short (30-80ms between items)." | Range.\[12\]\[14\]
49. Same | same | "Stagger is decorative — never block interaction" | Constraint.\[12\]\[14\]
50. animations.dev Module 4 | description | "the importance of orchestration" | Topic named only;\[3\] body [NOT IN SOURCE].
51. Great Animations | "feel right" | "The opacity change in exiting and entering items works well with the height animation." | Coordinating opacity with height.\[11\]

### Cluster 9: Motion and hierarchy (distinct sources: 1)
52. Great Animations | "have a purpose" | "We need to pace them through the experience and add them in places where they enrich the information on the page." | Closest statement he makes.\[11\] He does not explicitly tie motion to visual hierarchy: [NOT IN SOURCE].

### Cluster 10: Frequency and repeated actions (distinct sources: 4)
53. You Don't Need Animations | Frequency | "How often users will see an animation is a key factor in deciding whether to animate or not." | Core criterion.\[15\]
54. Same | Purposeful | "Used multiple times a day, this component would quickly become irritating." | Delight fades with repetition.\[15\]
55. 7 Tips | #3 | "hovering over other tooltips should open them with no delay and no animation." | Subsequent tooltips appear instantly.\[8\]
56. emil-design-eng | frequency table | 100+/day "No animation. Ever."; tens/day "Remove or drastically reduce"; occasional "Standard"; rare "Can add delight" | Tiers.\[12\]\[14\]

### Cluster 11: Taste, feel, craft (distinct sources: 6)
57. Developing Taste | intro | "it's a trained instinct." | Definition of taste.\[19\]
58. Same | "Think about why…" | "don't label things as good or bad. Instead of relying on gut feelings, try to rationalize" | Method.\[19\]
59. Agents with Taste | Transferring taste | "Almost every 'taste' decision has a logical reason if you look close enough." | Taste can be articulated.\[7\]
60. 7 Tips | #5 | "In the aggregate, unseen details become visible, they compound." | Compounding detail.\[8\]
61. Great Animations | "feel right" | "I like to review my work the next day because I can see it with fresh eyes" | Review practice.\[11\]
62. Building a toast component | Why successful | "Beauty is generally underutilized in software" | Beauty as leverage.\[20\]
63. emil-design-eng | Cohesion | "A professional dashboard should be crisp and fast. Match the motion to the mood." | Motion matched to personality.\[12\]\[14\]
64. Train Your Judgement | intro | "AI can write animation code. What it can't do is know what feels *right*." | The article frames judgement as the human part.\[21\]

## (c) Worked examples

| Demo | Source / locator | Values | Tag |
|---|---|---|---|
| Button press | 7 Tips #1; Hold to Delete | `scale(0.97)` on `:active`; `transform 160ms ease-out`\[8\]\[16\] | [STATED AS RECOMMENDATION] |
| Entry scale | 7 Tips #2 ("0.9+"); Agents with Taste (0.95); STANDARDS (0.9–0.97); CSS Transforms (Clerk toast 0.5 + opacity) | as listed\[7\]\[8\]\[22\] | 0.9+/0.95 [STATED]; 0.5 [OBSERVED IN DEMO]\[22\] |
| Tooltip | 7 Tips #3 | `transform/opacity 0.125s ease-out`; starting/ending `scale(0.97)`, opacity 0; `[data-instant]` 0ms\[8\] | [OBSERVED IN DEMO/SOURCE] |
| ease-in vs ease-out dropdown | 7 Tips #4 | both 300ms\[8\] | [OBSERVED IN DEMO] |
| Select/dropdown speed | 7 Tips #6; You Don't Need Animations | 180ms vs 400ms\[8\]\[15\] | comparison |
| Blur crossfade | 7 Tips #7 | `blur(2px)`; `scale(0.97)`\[8\] | [OBSERVED]; <20px [STATED] |
| Origin-aware popover | 7 Tips #5; Good vs Great | `var(--radix-dropdown-menu-content-transform-origin)`, `var(--transform-origin)`, `bottom center`\[8\]\[9\] | [STATED] |
| Sonner enter | Building a toast component, Animations | `transform 400ms ease`; `translateY(100%)` → `translateY(0)`; data-mounted\[20\] | [OBSERVED IN SOURCE] |
| Sonner stacking | same, Stacking | scale step 0.05 × index; Y(-14px) scale(0.95), Y(-28px) scale(0.9)\[20\] | [OBSERVED] |
| Sonner swipe | same, Swiping | velocity > 0.11 ("trial and error"); default timeout 4 seconds\[20\] | [OBSERVED] |
| Sonner base transition | deepwiki index of src/styles.css (third party, secondary) | transform/opacity/height 400ms, box-shadow 200ms; reduced-motion disables transitions | secondary, unverified\[23\] |
| Vaul drawer | Building a drawer component, Motion | `transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)` ("from the Ionic Framework")\[18\] | [OBSERVED]; the curve is recommended in the skill |
| Vaul scroll guard | same, Scrolling | 100ms timeout\[18\] | [OBSERVED] |
| Vaul theme bar | same | 50 color steps every 10ms = 500ms\[18\] | [OBSERVED]; "isn't available in Vaul yet" |
| Background scale | same | drag 40% → radius at 60%\[18\] | [OBSERVED] |
| Hold to delete | Hold to Delete | overlay `clip-path: inset(0px 100% 0px 0px)`; press `2s linear`; release `200ms ease-out`\[16\] | [OBSERVED]; the pattern is recommended in the skill |
| Image reveal | Clip Path | `inset(0 0 100% 0)` → `inset(0 0 0 0)`, 1s `cubic-bezier(0.77, 0, 0.175, 1)`;\[5\] `useInView {once:true, margin:"-100px"}`, WAAPI\[5\] | [OBSERVED] |
| Tabs clip | Clip Path | `inset(0px 75% 0px 0% round 17px)`\[5\] | [OBSERVED] |
| Scroll progress line | Clip Path | `useScroll` offset `["start end","end end"]`; `useTransform [0,1]→["100%","0%"]`\[5\] | [OBSERVED] |
| Theme switch | Clip Path | 1s `cubic-bezier(0.77, 0, 0.175, 1)` | [OBSERVED] |
| Reduced motion | Great Animations | bounce 0.2s → fade 0.2s; closedX 0 vs "-100%"\[11\] | [OBSERVED] |
| Mouse spring | emil-design-eng | `useSpring(mouseX*0.1, {stiffness:100, damping:10})`\[12\] | [OBSERVED IN SOURCE] |
| Spring config | emil-design-eng | `{duration:0.5, bounce:0.2}`; alternative `mass 1, stiffness 100, damping 10`\[12\] | first [STATED AS RECOMMENDATION] |
| Stagger | emil-design-eng | 300ms ease-out, translateY(8px), delays 0/50/100/150ms\[12\] | 30–80ms [STATED] |
| Orbit 3D | emil-design-eng | `translateZ(72px)`, rotateY 0→360deg\[12\] | [OBSERVED] |
| Hover gate | emil-design-eng | `@media (hover: hover) and (pointer: fine)`, `scale(1.05)`\[12\] | [OBSERVED]\[14\] |
| Opportunity recipes | find-animation-opportunities | press 0.95–0.98; entrances scale(0.95–0.97)+opacity 0; stagger 30–80ms; spring bounce 0.1–0.3\[17\] | [STATED] |
| Course easings (visible 6 of 18) | Building an animation course, Bonus | breeze (.55,.085,.68,.53); silk (.52,.062,.64,.21); swift (.86,.04,.67,.24); nova (.73,.065,.82,.08); crisp (.92,.06,.77,.045); glide (.58,.06,.95,.32)\[10\] | [OBSERVED]; use cases [NOT IN SOURCE] |
| Train Your Judgement pairs | Train Your Judgement | 11 A/B demos (size, easing, entry, intentional, frequency, scale, removal, interruptions, popovers, stagger, layered motion)\[21\] | values [NOT IN SOURCE]; the answer breakdowns were not in the fetched text |

## (d) Profile
- **Career history** (Animating in Public, undated):
  - 2021: agency job building Vue.js apps.\[4\]
  - Then Compound, working on the Command Menu and the design system. Sonner's idea was "initially born" there.\[4\]
  - Vercel from "late 2022": Next.js docs, the learn experience, Geist, and the dashboard.\[4\]
  - Then Linear.
- **Libraries:**
  - Sonner: "Back in 2023". Now "downloaded over 40,000,000 times per week" (toast post).\[20\] The skill file says "13M+ weekly".\[12\] The animations.dev page says Sonner and Vaul together are downloaded "over 90,000,000 times per week".\[3\] These are contradictory counts from undated pages.
  - Vaul: 1.0 announced in a tweet (status 1839340372327305536).\[24\] Release v1.0.0 is listed on "26 Sep" without a year.\[25\]
- **Courses:**
  - animations.dev: presale January 2024 (tweet 2024-01-16), initial release September 2024. 13,000+ students. The next enrollment is in 2027.\[3\]\[6\]\[10\]
  - aiforui.dev: a waitlist landing page only. Kowalski's X bio says "teaching at aiforui.dev".\[26\]\[27\]
- **Earlier project:** ui.land, teased December 2021 and launched January 2023.\[10\]

## (e) Wall inventory
- **Paid, [NOT IN SOURCE]:**
  - The bodies of every theory lesson.
  - All CSS and Motion lesson bodies.
  - The Module 4 lessons.
  - All 15 walkthrough lessons.
  - The solutions to the 50+ exercises.
  - The "Train your judgement" breakdowns inside the course.
  - The Josh Puckett guest lesson.
  - The interviews.
  - Vault contents.
  - 12 of the 18 easings.
  - The multi-file course skill pack: the 15 named skills (/animate, /animation-performance, /review-animations, /prototype, /animation-vocabulary, /css-animations, /find-animation-opportunities, /gesture-ui, /motion-brief, /pick-ui-library, /improve-animations, /scroll-animations, /animation-accessibility, /debug-animation, /motion-react).\[3\] Only their names are visible. Several names overlap with the free GitHub skills, but the course versions are described as "a lot more nuanced".\[10\]
  - The aiforui.dev curriculum.
- **Partially visible:**
  - Module and walkthrough descriptions.
  - Changelog excerpts, including the Cursor-rules snippet.
  - The six easings listed above.
  - Blog posts that match course lessons (Clip Path, Hold to Delete, Family drawer).
  - The two free waitlist preview lessons: NOT REACHED.

## (f) Synthesizer's notes (judgment)
- **Where the public layer is thick:**
  - Easing, duration, frequency, performance and gestures. Each is stated several times across the blog and the MIT-licensed skills repo.
  - The skills repo is effectively a published distillation of his teaching. For your purposes it is the highest-yield source.
- **Where it is thin:**
  - Choreography and orchestration.
  - Motion as a carrier of hierarchy.
  - Layout and shared-element animation. It is only mentioned as a performance hazard.
  - Scroll-driven animation beyond clip-path.
  - Loading and skeleton states.
  - Design-token systems for motion.
- **Secondary sources:**
  - Most third-party "Emil skills" pages are paraphrase mirrors and should not be quoted. For example, the gist quote "The best animations are the ones you don't notice"\[28\] could not be traced to a primary source.
  - Roger Wong (rogerwong.me, 2026-05) quotes "Agents with Taste" accurately.\[29\]
  - The student tweets on animations.dev point to real lesson topics without reconstructing their content: auto-height with `useMeasure` (Glickenhaus, d_ver), and the CSS module.\[3\]
- **Gaps specific to your products.** His work does not cover:
  - Map and GIS motion: camera fly-to, zoom easing, layer fades, measurement overlays.
  - Field conditions such as glare, gloves, and low-power devices.
  - Data-dense trust UI: number and value-change transitions, table sorting, streaming updates.
  - Keyboard-first focus movement beyond "never animate."
  - Tests and linting for motion.
  - Two points in his work bear directly on DealReady: the banking-graph "no animation" rule and the rule that a "professional dashboard should be crisp and fast".\[14\]
- **Recommendation:**
  - Resolve the modals/drawers contradiction by adopting the stricter 200–300ms for DealReady and keep 500ms only for Vaul-style mobile sheets.
  - Vendor `STANDARDS.md` as a reference file. It carries an MIT license, but check the terms before copying it wholesale.

## (g) Sources (all accessed 2026-09-30)
- https://animations.dev
- https://animations.dev/changelog
- https://emilkowal.ski
- https://emilkowal.ski/skill
- /ui/ posts on emilkowal.ski:
  - https://emilkowal.ski/ui/you-dont-need-animations (Sep 26, 2025 per raindrop.io)\[30\]
  - https://emilkowal.ski/ui/7-practical-animation-tips
  - https://emilkowal.ski/ui/great-animations
  - https://emilkowal.ski/ui/agents-with-taste (March 2026 per note.com, secondary)\[31\]
  - https://emilkowal.ski/ui/building-a-toast-component
  - https://emilkowal.ski/ui/building-a-drawer-component
  - https://emilkowal.ski/ui/the-magic-of-clip-path (tweet 2024-07-09)\[32\]
  - https://emilkowal.ski/ui/good-vs-great-animations
  - https://emilkowal.ski/ui/building-a-hold-to-delete-component
  - https://emilkowal.ski/ui/developing-taste
  - https://emilkowal.ski/ui/building-an-animation-course
  - https://emilkowal.ski/ui/train-your-judgement (April 2026 per HN digest)\[33\]
  - https://emilkowal.ski/ui/css-transforms
  - https://emilkowal.ski/ui/animating-in-public
  - Friction as a Feature and How I built my course platform: snippets only.
- GitHub:
  - https://github.com/emilkowalski/skills (README)
  - skills/emil-design-eng/SKILL.md
  - skills/review-animations/STANDARDS.md
  - skills/find-animation-opportunities/SKILL.md
- https://aiforui.dev
- X posts: statuses 1747257917919932905, 2044037117408334109, 2092220512449536007
- Secondary: https://deepwiki.com/emilkowalski/sonner/4.1-styling-and-theming; https://rogerwong.me/2026/05/agents-taste-skill-files
- NOT FOUND or not reached: Sonner and Vaul source files fetched directly; talk and podcast transcripts; waitlist preview lessons; Friction as a Feature and How I built my course platform in full.

## Tests
- **Provenance:** every atom has a URL and section locator. Some pages have no visible date, and these are marked "undated" or dated only through secondary sources.
- **Paraphrase:** quotes are verbatim from the fetched text, and paraphrases are labeled.
- **Gaps:** marked [NOT IN SOURCE] or NOT FOUND.
- **Separation:** inference sits only in section (f).
- **Process:** the subagent and enrichment steps were not run because of the turn limit, as noted at the top.

## Sources

1. [GitHub - emilkowalski/skills: Skills for Designers and Engineers.](https://github.com/emilkowalski/skills)
2. [Emil Kowalski](https://emilkowal.ski/)
3. [animations.dev](https://animations.dev/)
4. [Animating in Public](https://emilkowal.ski/ui/animating-in-public)
5. [The Magic of Clip Path](https://emilkowal.ski/ui/the-magic-of-clip-path)
6. [animations.dev](https://animations.dev/changelog)
7. [Agents with Taste](https://emilkowal.ski/ui/agents-with-taste)
8. [7 Practical Animation Tips](https://emilkowal.ski/ui/7-practical-animation-tips)
9. [Good vs Great Animations](https://emilkowal.ski/ui/good-vs-great-animations)
10. [Building an animation course](https://emilkowal.ski/ui/building-an-animation-course)
11. [Great Animations](https://emilkowal.ski/ui/great-animations)
12. [skills/skills/emil-design-eng/SKILL.md at main · emilkowalski/skills](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md)
13. [Animate — AI Agent Skill by Emil Kowalski](https://agenticskills.io/skills/animate)
14. [skills/skills/review-animations/STANDARDS.md at main · emilkowalski/skills](https://github.com/emilkowalski/skills/blob/main/skills/review-animations/STANDARDS.md)
15. [You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)
16. [Building a Hold to Delete Component](https://emilkowal.ski/ui/building-a-hold-to-delete-component)
17. [skills/skills/find-animation-opportunities/SKILL.md at main · emilkowalski/skills](https://github.com/emilkowalski/skills/blob/main/skills/find-animation-opportunities/SKILL.md)
18. [Building a drawer component](https://emilkowal.ski/ui/building-a-drawer-component)
19. [Developing Taste](https://emilkowal.ski/ui/developing-taste)
20. [Building a toast component](https://emilkowal.ski/ui/building-a-toast-component)
21. [Train Your Judgement](https://emilkowal.ski/ui/train-your-judgement)
22. [CSS Transforms](https://emilkowal.ski/ui/css-transforms)
23. [Styling and Theming](https://deepwiki.com/emilkowalski/sonner/4.1-styling-and-theming)
24. [Emil Kowalski (@emilkowalski) on X](https://x.com/emilkowalski/status/1839340372327305536)
25. [Releases · emilkowalski/vaul](https://github.com/emilkowalski/vaul/releases)
26. [Emil Kowalski (@emilkowalski) on X](https://x.com/emilkowalski)
27. [AI for Designers and Engineers](https://aiforui.dev/)
28. [Put in \~/your-project/.claude/skills/emil-anim/SKILL.md then tell Claude Code "use the emil-anim skill to audit and improve my frontend" · GitHub](https://gist.github.com/corysimmons/1e2f64603ae234602f92dafe2b549ea9)
29. [Agents with Taste - Roger Wong](https://rogerwong.me/2026/05/agents-taste-skill-files)
30. [UX/UI](https://raindrop.io/laurent-devernay/ux-ui-7258318)
31. [Transplanting 'Design Taste' into Claude Code: A Deep Dive into emilkowalski/skills｜アイドリ](https://note.com/ai_driven/n/n2f8718394117?hl=en)
32. [Emil Kowalski on X: "The Magic of Clip Path https://t.co/hZpg36d62L" / X](https://x.com/emilkowalski/status/1810671775602098592)
33. [HN blogs - 11/4/26 - by Paul - HackerNews blogs newsletter](https://hnblogs.substack.com/p/hn-blogs-11426)
