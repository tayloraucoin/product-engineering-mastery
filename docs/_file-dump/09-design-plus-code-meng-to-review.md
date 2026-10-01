# Design+Code (Meng To): review and canon ruling

**Reviewer:** Vesper, Lead UX/UI Designer · **Ruling addressed to:** Plumb, Design Director · **For:** Taylor · **Date:** 2026-09-30
**Decision this serves:** whether to spend a month on Design+Code, and which two or three courses to mine if so.

Evidence labels used throughout: **[V]** verified from a primary source on the date shown · **[S]** secondary, source named · **[J]** my judgment · **[NF]** looked for, not found.

---

## Verdict

**One month of Pro ($99), after a free pass that costs nothing, mining three named courses. Not the $349 year, not the $499 Lifetime.** [J]

The pivot is real, and it is closer to your practice than the textbook's "breadth; quality varies" suggested. The 2026 courses teach a loop you'll recognise: references, then a `DESIGN.md`, then generation, then critique, then hand polish. Meng To's own free skills repo writes that critique loop down more rigorously than most of what I've seen. It separates making from judging, grades against evidence, and removes before it restyles.

Three things keep this from being a subscription:

1. **The catalogue is mostly behind you.** 84 of 94 courses are dated or stale, and 112 of its 336 hours are native Apple-platform code you don't ship. [V, J]
2. **The current material is largely a tour of Meng To's own products.** Aura and Neuform appear in 27 of 37 lesson titles in the flagship 2026 course. The 2025 prompting course lists Aura as its only core tool. [V]
3. **The aesthetic conflict is real, but it's about his taste, not his rules.** What he stated in August 2026 ("slop is a choice made by reflex rather than for the product") fits your restraint rules. What he practises is holographic cards, burning paper, glass dark UIs, beam glows and WebGL heroes. That is the register your anti-patterns file rejects for DealReady and Fybr product surfaces. Take the rule and leave the look. [V, J]

Nothing in the catalogue teaches dense product UI: data tables, map-first layouts, trust and provenance UI, or state matrices for real workflows. Where your two seats actually live, Design+Code is silent. [V from outlines, J]

---

## 1. The catalogue

**How it was inventoried.** designcode.io/courses lists **94 courses** under "All 94", across five pages [V 2026-09-30]. For each one I recorded the catalogue card (title, author, lessons, hours). Where I could, I also read the outline from one of two places: the course page itself (its lesson list plus the free lesson's notes) or `designcode.io/sitemap.xml`, which lists every lesson slug. Course pages show **no publish or update date [NF]**. The "Era" column is inferred from the stack each outline names (iOS version, model name, tool) and is judgment. Totals from the table: **1,525 lessons, 335.8 hours** (the site claims "300+ hours") [V].

**Summary.**

| Measure | Count | Hours |
|---|---|---|
| Courses listed | 94 | 335.8 |
| Primarily code (C) / design (D) / prompting and AI workflow (P) | 46 / 39 / 9 | — |
| Courses with any AI-prompting component | 17 | 78.8 |
| **Perishable**: current, but tied to a model or tool version that turns over in months | 10 | 38.8 |
| **Dated**: tool still exists, but the course predates material changes | 43 | — |
| **Stale**: tool gone, or version three or more generations behind | 41 | 156.0 |
| Native Apple-platform code (Swift, SwiftUI, UIKit, ARKit, SpriteKit) | 26 | 112.0 |
| Courses authored or co-authored by Meng To | 34 | — |

**Stale by name** (the brief asked for these explicitly). These courses assume a tool that no longer exists or has materially changed:

- **Galileo AI** (now Google Stitch [S: Dealroom, Banani])
- **Gatsby Cloud** in *Advanced React Hooks*
- **GPT-4** in *Build Beautiful Apps with GPT-4 and Midjourney*
- **Sketch, iOS 16 and older:** *Learn Sketch*, *UI Design for iOS 16 in Sketch*, *UI Design for iOS, Android and Web in Sketch*
- **Sketch plugin API:** *Create a Sketch Plugin*
- **Principle:** *Animating in Principle*
- **SwiftUI 1 to 4 and UIKit for iOS 15:** every "Build an app with SwiftUI Part 1–3", "SwiftUI for iOS 14/15/16", the UIKit pair, *Swift Advanced* and *Learn Swift* (Swift 4)
- **ARKit 2**
- **React Native for Designers 1–2** (Redux era)
- *Vue for Designers*, *React for Designers*, *Flutter for Designers 1–2*, *Build a full site in Webflow*
- *Design System in Figma* (pre-variables Figma)
- *Learn iOS 11 Design*, whose card still says "for iOS 8"

Codux's current status I could not verify [NF].

**Key to the table.**

- **Outline read**
  - "Page": the lesson list and free lesson notes were read on the course page
  - "Sitemap": lesson slugs from the sitemap
  - "Card": catalogue card only, so treat that row as `[TITLE ONLY]` for outline purposes
- **Type:** D design · C code · P prompting/AI workflow

| # | Course | Author | Lessons / hrs | Stack assumed | Type | Era (inferred) | Status | Outline read | Note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [DesignCode Webinars: Build with AI](https://designcode.io/courses/designcode-webinars) | Meng To | 5 / 4.1 | Codex, Claude Code, Framer, Fable 5.1 | P | 2026 (early access) | Perishable | Page | Five ~50-min recorded webinars; no lesson notes attached |
| 2 | [Build a Three.js Game with Fable 5.1](https://designcode.io/courses/build-a-threejs-game-with-fable-5-1) | Meng To | 10 / 1.1 | Three.js, Fable 5.1, React | C/P | 2026 (early access) | Perishable | Page | Game build; off-scope for product UI |
| 3 | [Codex Masterclass: Build Stunning Websites and Apps with AI](https://designcode.io/courses/openai-codex-masterclass) | Meng To | 8 / 1.1 | Codex, GPT Image 2, Higgsfield, Mobbin, MCP | P | 2026 (early access) | Perishable | Page | References, MCP, critique, reusable skills |
| 4 | [Claude Code for Vibe Coders: Build Advanced Websites](https://designcode.io/courses/claude-code-for-vibe-coders) | Vanh Roeung | 9 / 1.2 | Claude Code (Opus 5), Git, Blender, Three.js | C/P | 2026 (early access) | Perishable | Page | Free notes admit the promised Three.js/perf/hooks lessons are not yet recorded |
| 5 | [From Inspiration to Landing Page with Codex](https://designcode.io/courses/from-inspiration-to-landing-page-with-codex) | Sourasith Phomhome | 10 / 1.8 | Codex (GPT-5.6), Figma, DESIGN.md, Blender | P | 2026 (early access) | Perishable | Page | References-to-original workflow |
| 6 | [Claude Design for Creative Landing Pages](https://designcode.io/courses/claude-design-for-creative-landing-pages) | Sourany Phomhome | 10 / 1.8 | Claude Design | P/D | 2026 | Perishable | Page | 'Direct like a creative director' framing |
| 7 | [AI Website Builders: Pick the Right Tool](https://designcode.io/courses/ai-website-builders-pick-the-right-tool) | Samnang Aing | 9 / 1.3 | Lovable, Bolt, v0, Framer, Webflow | P | 2026 | Perishable | Page | 5 of 9 lessons are Lovable walkthroughs |
| 8 | [Landing Pages and AI Tools](https://designcode.io/courses/landing-pages-and-ai-tools) | Meng To + 4 | 37 / 12.6 | Aura, Neuform, Codex, Lovable, v0, Gemini 3.1, GPT-5.5/5.6, Fable 5 | P | 2026 | Perishable | Page | 27 of 37 lesson titles name Aura or Neuform (Meng To's products) |
| 9 | [Claude Code and Claude Design](https://designcode.io/courses/claude-code-and-design) | Vanh Roeung | 6 / 3.8 | Claude Code (Opus 4.8, Fable 5), Claude Design, DESIGN.md | C/P | 2026 | Perishable | Page | Two of six lessons free; DESIGN.md extraction lesson 1h15 |
| 10 | [Claude Code Crash Course on Agentic Workflows](https://designcode.io/courses/claude-code) | Vanh Roeung | 8 / 1 | Claude Code, Next.js, Supabase, Vercel, Aura | C/P | 2025 | Dated | Page | Description promises hooks and parallel work; outline ends at slash commands |
| 11 | [Master AI Prompting for Stunning UI](https://designcode.io/courses/prompt-ui) | Meng To, Sourasith Phomhome | 49 / 10 | Aura, GPT-5/5.1, Gemini 3, Midjourney, Spline, Unicorn Studio | P | late 2025 | Perishable | Page | Aura is the only 'core' tool listed; 11 titles name Aura |
| 12 | [Master Agentic Workflows](https://designcode.io/courses/agentic-workflows) | Vanh Roeung | 14 / 2 | Cline, Roo Code, OpenRouter, MCP, Context7, Manus, Genspark | P/C | 2025 | Dated | Sitemap | Tool roster has turned over |
| 13 | [Design Multiple Apps with Figma and AI](https://designcode.io/courses/design-multiple-apps-with-figma-and-ai) | Sourasith Phomhome | 33 / 4 | Figma, Ideogram, Runway | D | 2024 | Dated | Sitemap | Visual hierarchy, spacing, colour lessons inside app builds |
| 14 | [AI Design with Ideogram](https://designcode.io/courses/ideogram) | Akson Phomhome | 5 / 1 | Ideogram | D | 2024 | Dated | Sitemap | Tool tour |
| 15 | [Design and Code User Interfaces with Galileo and Claude AI](https://designcode.io/courses/galileo-and-claude-ai) | Sourasith Phomhome | 27 / 4 | Galileo AI, Claude artifacts, v0, Figma UI3, Tailwind | D/P | 2024 | Stale | Sitemap | Galileo AI is now Google Stitch (secondary sources) |
| 16 | [Build SwiftUI apps for iOS 18 with Cursor and Xcode](https://designcode.io/courses/swiftui-ios18) | Meng To | 17 / 5 | SwiftUI 6, Xcode 16, Cursor | C | 2024 | Dated | Card | Mesh gradients, text animations, ripple effects |
| 17 | [Build a React Native app with Claude AI](https://designcode.io/courses/react-native-ai) | Vanh Roeung | 64 / 14 | Expo, Supabase, Claude 3.5 Sonnet, Cursor, Windsurf, Locofy | C/P | 2024 | Dated | Sitemap | Largest build-along in the catalogue |
| 18 | [Build a SwiftUI app with Claude AI](https://designcode.io/courses/swiftui-and-claude-ai) | Akson Phomhome | 35 / 9 | SwiftUI, Claude 3.5 Sonnet, Cursor, Figma | C/P | 2024 | Dated | Sitemap |  |
| 19 | [Create your Dream Apps with Cursor and Claude AI](https://designcode.io/courses/cursor) | Meng To | 24 / 6 | Cursor, Next.js, Firebase, Stripe, v0, shadcn, Claude 3.7, GPT-4.5 preview | C/P | early 2025 | Dated | Sitemap | Model-version lessons date it |
| 20 | [Design and Prototype for iOS 18](https://designcode.io/courses/design-and-prototype-for-ios-18) | Sourasith Phomhome | 21 / 3 | Figma variables, React Native Reanimated | D | 2024 | Dated | Sitemap |  |
| 21 | [Prototype and Code iOS apps in Figma and SwiftUI](https://designcode.io/courses/prototype-and-code) | Akson Phomhome | 20 / 3 | Figma, SwiftUI | D/C | 2024 | Dated | Sitemap | Mesh gradient, progressive blur, ripple |
| 22 | [Build a React Site from Figma to Codux](https://designcode.io/courses/codux) | Meng To | 14 / 2 | Codux, Figma Dev Mode, React Router | C | 2023 | Dated | Sitemap | Codux status not verified |
| 23 | [Master Responsive Layouts in Figma](https://designcode.io/courses/figma-responsive-layouts) | Sourasith Phomhome | 15 / 2 | Figma auto layout, Locofy Classic | D | 2023 | Dated | Sitemap |  |
| 24 | [UI UX Design with Mobbin and Figma](https://designcode.io/courses/mobbin-design) | Sourasith Phomhome | 11 / 2 | Mobbin, Figma | D | 2023 | Dated | Sitemap | UX research and flows, visual hierarchy lessons |
| 25 | [Build an Interactive Site with Wix Studio](https://designcode.io/courses/wix-studio) | Sourany Phomhome | 5 / 1 | Wix Studio | D | 2023-24 | Dated | Card | No-code tool tour |
| 26 | [Create 3D UI for iOS and visionOS in Spline](https://designcode.io/courses/spline-ios) | Akson Phomhome | 12 / 3 | Spline, SwiftUI | D | 2023-24 | Dated | Sitemap |  |
| 27 | [Master No-Code Web Design with Framer](https://designcode.io/courses/framer-web-design) | Meng To | 20 / 4 | Framer | D | 2023 | Dated | Sitemap | Free course |
| 28 | [3D UI Interactive Web Design with Spline](https://designcode.io/courses/spline-ui) | Akson Phomhome | 14 / 3 | Spline | D | 2023 | Dated | Sitemap |  |
| 29 | [Build SwiftUI Apps for iOS 17](https://designcode.io/courses/swiftui-ios17) | Meng To | 16 / 4 | SwiftUI 5, Xcode 15 | C | 2023 | Dated | Card |  |
| 30 | [Design and Prototype for iOS 17 in Figma](https://designcode.io/courses/ios17) | Akson Phomhome | 21 / 6 | Figma variables, visionOS | D | 2023 | Dated | Sitemap |  |
| 31 | [Design and Prototype Apps with Midjourney](https://designcode.io/courses/midjourney) | Akson Phomhome | 33 / 8 | Midjourney, Figma | D | 2023 | Dated | Sitemap | Midjourney as moodboard, rebuilt in Figma |
| 32 | [Build Beautiful Apps with GPT-4 and Midjourney](https://designcode.io/courses/gpt4) | Meng To | 15 / 4 | GPT-4, Midjourney, SwiftUI, React, CSS | P | 2023 | Stale | Sitemap | GPT-4-era prompting |
| 33 | [iOS Design with Midjourney and Figma](https://designcode.io/courses/app-ui) | Sourasith Phomhome | 9 / 1 | Midjourney, Figma | D | 2023 | Dated | Sitemap |  |
| 34 | [Web App Design using Midjourney and Figma](https://designcode.io/courses/web-app) | Akson Phomhome | 12 / 2 | Midjourney, Figma | D | 2023 | Dated | Card |  |
| 35 | [Learn Figma Prototyping](https://designcode.io/courses/figma-prototyping) | Sourany Phomhome | 10 / 1 | Figma, Jitter | D | 2023 | Dated | Sitemap |  |
| 36 | [UI Design for iOS, Android and Web in Sketch](https://designcode.io/courses/sketch-design) | Sourasith Phomhome | 9 / 1 | Sketch | D | 2022 | Stale | Sitemap |  |
| 37 | [Build SwiftUI apps for iOS 16](https://designcode.io/courses/swiftui-ios16) | Meng To | 35 / 5 | SwiftUI 4, Xcode 14 | C | 2022 | Stale | Card |  |
| 38 | [Design and Prototype an App with Play](https://designcode.io/courses/play) | Willie Yam | 10 / 3 | Play | D | 2022-23 | Dated | Sitemap |  |
| 39 | [UI Design a Camera App in Figma](https://designcode.io/courses/ui-camera) | Sourasith Phomhome | 5 / 1 | Figma | D | 2022 | Dated | Card | Glass icons, lens strokes |
| 40 | [Create a 3D site with game controls in Spline](https://designcode.io/courses/spline2) | Willie Yam | 10 / 2 | Spline, React | D/C | 2022 | Dated | Sitemap |  |
| 41 | [Build a Movie Booking App in SwiftUI](https://designcode.io/courses/swiftui-movie-booking) | Willie Yam | 12 / 1 | SwiftUI | C | 2022 | Stale | Card |  |
| 42 | [UI Design for iOS 16 in Sketch](https://designcode.io/courses/ios16) | Akson Phomhome | 12 / 3 | Sketch, iOS 16 | D | 2022 | Stale | Sitemap |  |
| 43 | [Build a 3D Site Without Code with Framer](https://designcode.io/courses/framer-3d-site) | Meng To | 10 / 3 | Framer, Spline | D | 2022 | Dated | Sitemap |  |
| 44 | [Prototyping in Figma](https://designcode.io/courses/prototyping-figma) | Sourasith Phomhome | 3 / 1 | Figma | D | 2021-22 | Dated | Sitemap |  |
| 45 | [Create 3D Site with Spline and React](https://designcode.io/courses/spline) | Meng To | 9 / 1 | Spline, React, CodeSandbox | D/C | 2022 | Dated | Sitemap |  |
| 46 | [Build an Animated App with Rive and SwiftUI](https://designcode.io/courses/swiftui-rive) | Meng To | 15 / 3 | Rive, SwiftUI | C | 2022 | Dated | Card |  |
| 47 | [Jetpack Compose for Designers](https://designcode.io/courses/jetpack-compose) | Sai Kambampati | 20 / 4 | Kotlin, Jetpack Compose | C | 2021-22 | Stale | Sitemap |  |
| 48 | [UI and Animations in SwiftUI](https://designcode.io/courses/swiftui-ui-animations) | Dara To | 19 / 4 | SwiftUI | C | 2022 | Stale | Card |  |
| 49 | [UI Design Quick Websites in Figma](https://designcode.io/courses/ui-websites) | Sourasith Phomhome | 3 / 1 | Figma | D | 2021-22 | Dated | Card |  |
| 50 | [UI Design Android Apps in Figma](https://designcode.io/courses/quick-apps-android-figma) | Sourasith Phomhome | 9 / 2 | Figma | D | 2021-22 | Dated | Sitemap |  |
| 51 | [UI Design Smart Home App in Figma](https://designcode.io/courses/ui-smart-home) | Akson Phomhome | 7 / 2 | Figma | D | 2021-22 | Dated | Card |  |
| 52 | [Build an Expense Tracker App in SwiftUI](https://designcode.io/courses/swiftui-expense-tracker) | Dara To | 10 / 3 | SwiftUI 3, Combine, MVVM | C | 2021 | Stale | Sitemap |  |
| 53 | [Build a SwiftUI app for iOS 15 Part 3](https://designcode.io/courses/swiftui-ios15-part3) | Meng To | 21 / 4 | SwiftUI 3, Xcode 13 | C | 2021 | Stale | Sitemap | Accessibility VoiceOver and dynamic type lessons |
| 54 | [UI Design Quick Apps in Figma](https://designcode.io/courses/quick-apps-figma) | Sourasith Phomhome | 50 / 12 | Figma | D | 2021-22 | Dated | Sitemap | Glassmorphism, neon UI, soft UI, NFT cards |
| 55 | [UIKit for iOS 15 Part 2](https://designcode.io/courses/uikit-ios15-part2) | Sai Kambampati | 20 / 3 | UIKit, Firebase, Xcode Cloud | C | 2021 | Stale | Card |  |
| 56 | [Build Quick Apps with SwiftUI](https://designcode.io/courses/quick-apps-swiftui) | Stephanie Diep | 47 / 11 | SwiftUI | C | 2021-22 | Stale | Sitemap |  |
| 57 | [UIKit for iOS 15](https://designcode.io/courses/uikit-ios15) | Sai Kambampati | 20 / 5 | UIKit, storyboards | C | 2021 | Stale | Card |  |
| 58 | [Build a SwiftUI app for iOS 15 Part 2](https://designcode.io/courses/swiftui-ios15-part2) | Meng To | 19 / 3 | SwiftUI 3 | C | 2021 | Stale | Sitemap |  |
| 59 | [Build a SwiftUI app for iOS 15](https://designcode.io/courses/swiftui-ios15) | Meng To | 21 / 4 | SwiftUI 3 | C | 2021 | Stale | Card |  |
| 60 | [Advanced React Hooks](https://designcode.io/courses/advanced-react-hooks) | Willie Yam | 20 / 5 | TypeScript, Gatsby, Contentful, Gatsby Cloud | C | 2021 | Stale | Sitemap | Gatsby Cloud has been shut down |
| 61 | [SwiftUI Concurrency](https://designcode.io/courses/swiftui-concurrency) | Stephanie Diep | 20 / 3 | Swift async/await (WWDC21) | C | 2021 | Stale | Sitemap |  |
| 62 | [SwiftUI Combine and Data](https://designcode.io/courses/swiftui-combine) | Stephanie Diep | 18 / 3 | Combine, Firebase | C | 2021 | Stale | Sitemap |  |
| 63 | [Advanced Development in SwiftUI](https://designcode.io/courses/swiftui-advanced) | Sai Kambampati | 20 / 4 | Core Data, CloudKit, RevenueCat, Firebase | C | 2021 | Stale | Sitemap |  |
| 64 | [Flutter for Designers Part 2](https://designcode.io/courses/flutter-part-2) | Sai Kambampati | 20 / 4 | Flutter, Firebase | C | 2020 | Stale | Sitemap |  |
| 65 | [Build a web app with React Hooks](https://designcode.io/courses/react-hooks) | Meng To | 20 / 4 | React Hooks, Gatsby, Netlify, styled-components | C | 2020 | Stale | Sitemap |  |
| 66 | [Flutter for Designers](https://designcode.io/courses/flutter) | Sai Kambampati | 23 / 4 | Flutter, Dart | C | 2020 | Stale | Sitemap |  |
| 67 | [SwiftUI for iOS 14](https://designcode.io/courses/swiftui-ios14) | Meng To | 20 / 3 | SwiftUI 2 | C | 2020 | Stale | Sitemap |  |
| 68 | [UI Design for Developers](https://designcode.io/courses/ui-design) | Meng To | 22 / 3 | Figma, shape.so, angle.sh | D | 2020 | Dated | Page | Fundamentals course; includes 'Success Modal and Confetti' |
| 69 | [Create a Promo Video in After Effects](https://designcode.io/courses/after-effects-promo-video) | Daniel Nisttahuz | 12 / 2 | After Effects | D | 2020 | Dated | Sitemap | Off-scope |
| 70 | [Build an app with SwiftUI Part 3](https://designcode.io/courses/swiftui3) | Meng To | 20 / 4 | SwiftUI 1-2 | C | 2019-20 | Stale | Card |  |
| 71 | [Build an app with SwiftUI Part 2](https://designcode.io/courses/swiftui2) | Meng To | 20 / 4 | SwiftUI 1-2 | C | 2019-20 | Stale | Card |  |
| 72 | [Build a full site in Webflow](https://designcode.io/courses/webflow) | Meng To | 14 / 3 | Webflow | D | 2019-20 | Stale | Card |  |
| 73 | [Advanced Prototyping in ProtoPie](https://designcode.io/courses/protopie) | Meng To | 14 / 3 | ProtoPie | D | 2019-20 | Dated | Sitemap |  |
| 74 | [SVG Animations with GreenSock](https://designcode.io/courses/greensock) | Christina Gorton | 9 / 2 | SVG, GSAP | C | 2019 | Dated | Sitemap | SVG fundamentals hold; GSAP API version not verified |
| 75 | [Build an app with SwiftUI Part 1](https://designcode.io/courses/swiftui) | Meng To | 20 / 4 | SwiftUI 1 | C | 2019 | Stale | Card |  |
| 76 | [CSS Layout and Animations](https://designcode.io/courses/css) | Christina Gorton | 9 / 5 | CSS Grid, Flexbox, keyframes, CodePen | C | 2019 | Dated | Sitemap | Fundamentals still hold |
| 77 | [React Native for Designers Part 2](https://designcode.io/courses/react-native-2) | Meng To | 12 / 3 | React Native, Redux, Firebase | C | 2019 | Stale | Sitemap |  |
| 78 | [Unity for Designers](https://designcode.io/courses/unity) | Willie Yam | 15 / 5 | Unity | C | 2019 | Stale | Card | Off-scope |
| 79 | [React Native for Designers](https://designcode.io/courses/react-native) | Meng To | 12 / 5 | React Native, Redux, styled-components, Contentful | C | 2019 | Stale | Sitemap |  |
| 80 | [Vue for Designers](https://designcode.io/courses/vue) | Thomas Wang | 11 / 4 | Vue | C | 2019 | Stale | Card |  |
| 81 | [Create a Javascript Game](https://designcode.io/courses/phaser) | Willie Yam | 6 / 2 | Phaser 3 | C | 2019 | Dated | Sitemap | Off-scope |
| 82 | [Animating in Principle](https://designcode.io/courses/principle) | Daniel Nisttahuz | 5 / 1 | Principle | D | 2019 | Stale | Sitemap |  |
| 83 | [Design System in Figma](https://designcode.io/courses/figma) | Meng To | 10 / 3 | Figma styles, team library | D | 2019 | Stale | Sitemap | Pre-variables Figma |
| 84 | [React for Designers](https://designcode.io/courses/react) | Meng To | 12 / 3 | React, Gatsby, Contentful, Stripe, Netlify | C | 2018-19 | Stale | Sitemap |  |
| 85 | [Video Editing in ScreenFlow](https://designcode.io/courses/screenflow) | Daniel Nisttahuz | 4 / 1 | ScreenFlow | D | 2019 | Dated | Sitemap | Off-scope |
| 86 | [Sound Design with Cubase](https://designcode.io/courses/sound-design) | Ricky Campanelli | 5 / 2 | Cubase | D | 2019 | Dated | Sitemap | Off-scope |
| 87 | [Build an ARKit 2 App](https://designcode.io/courses/arkit) | Dara To | 11 / 4 | ARKit 2 | C | 2018 | Stale | Sitemap |  |
| 88 | [Motion Design in After Effects](https://designcode.io/courses/after-effects-motion-design) | Daniel Nisttahuz | 8 / 3 | After Effects, Lottie | D | 2018-19 | Dated | Sitemap | Off-scope |
| 89 | [Create a Sketch Plugin](https://designcode.io/courses/sketch-plugin) | Tiago Mergulhão | 7 / 2 | Sketch plugin API | C | 2018 | Stale | Sitemap |  |
| 90 | [Create a SpriteKit Game](https://designcode.io/courses/spritekit) | Willie Yam | 9 / 3 | SpriteKit | C | 2018 | Stale | Sitemap | Off-scope |
| 91 | [Swift Advanced](https://designcode.io/courses/swift4-advanced) | Meng To | 22 / 9 | Swift 4, storyboards, Realm | C | 2017-18 | Stale | Sitemap |  |
| 92 | [Learn Swift](https://designcode.io/courses/swift4) | Meng To | 19 / 4 | Swift 4, Xcode 9 | C | 2017 | Stale | Sitemap |  |
| 93 | [Learn Sketch](https://designcode.io/courses/sketch) | Meng To | 21 / 5 | Sketch | D | 2017 | Stale | Sitemap |  |
| 94 | [Learn iOS 11 Design](https://designcode.io/courses/ios11-design) | Meng To | 11 / 1 | iOS 11 HIG | D | 2017 | Stale | Sitemap | Card text still reads 'for iOS 8' |

---

## 2. The pivot: what "Prompt Better User Interfaces and Apps" contains

**What the phrase is.** It is the site's title and positioning line, not one course. The homepage title reads "Prompt Better User Interfaces and Apps". The footer reads "learn how to prompt better user interfaces and ship top-tier products. Stand out from a sea of AI slops." [V 2026-09-30] In practice the pivot is carried by the ten perishable courses at the top of the catalogue, the articles, the "Agent Skills" vault, and weekly live sessions (Pro and Lifetime only) [V pricing page].

### What the courses actually teach (read from outlines and free lesson notes)

- **Master AI Prompting for Stunning UI** (49 lessons, ~9.2 h by summed durations; late 2025 by stack) [V]
  - The free lesson is an introduction to Aura: 800+ templates, a prompt builder, remixing CodePen and 21st.dev components, Tailwind output, "beautiful shadows".
  - Its type advice is "Inter, Geist, and Manrope are great for modern apps".
  - 11 lesson titles name Aura, and most of the short lessons are Aura feature walkthroughs (Design Mode, Remix, Layers Explorer, Edits, Alpha Mask). The long lessons mix remixing, image-to-HTML, reference composition and model-of-the-month sessions: "Using GPT 5.1 for Creating UIs" and "Gemini 3 Changes Everything for Web Design".
  - No lesson title mentions critique, review, states, or accessibility. [V outline]
  - **Generation-only, and it teaches the defaults you ban.** [J]
- **Landing Pages and AI Tools** (37 lessons, 12.6 h; 2026) [V]
  - This is where the thinking improved. The free lesson (Meng To, 28 min) teaches a sequence: visual system first (a `DESIGN.md` from Neuform or getdesign.md), then a section plan, then a first page, then a contextual image family, then selected video, then interaction review. It includes:
    - "Write the media role beside each section."
    - "The first pass is a diagnostic."
    - Crop references "around the useful visual information".
    - Review generated images "as a contact sheet".
    - "Check mobile behavior, reduced motion, poster frames, and loading."
    - "Taste is the final filter." [V lesson notes]
  - 27 of 37 lesson titles name Aura or Neuform.
  - The strongest non-tool lessons are "How I Remove AI Slop From Vibe-Coded Aura Landing Pages", "How I Compare Aura, Lovable, and v0 With the Same Production Brief", "Why Google's Open DESIGN.md Format Matters for AI Design" and "How I Use DESIGN.md as Persistent Visual DNA". [V outline]
- **Codex Masterclass** (8 lessons, 1.1 h; early access) [V]
  - The free welcome lesson frames the job as "direction, judgment, and deciding what deserves to ship".
  - It says the agent "can now move through the full loop of finding context, making an artifact, checking the result, and correcting its own work".
  - It turns successful decisions into skills *after* the work: "Skills come after the work… This keeps the skill grounded in evidence."
  - Paid lessons include "Build Design Taste with Better References" and "Give Better Feedback and Eliminate AI Slop". [V]
- **Claude Code and Claude Design** (6 lessons, 3.8 h; 2026; Vanh Roeung) [V]
  - The free first lesson builds a six-page site from one prompt and one `DESIGN.md`. Parallel agents cover research, implementation, review and verification, with "an adversarial review before returning the site".
  - It spends real time on when *not* to fan out.
  - Paid lessons include "How I Extract a DESIGN.md From Any Website With Claude Code" (1 h 15) and "My DESIGN.md Workflow From Inspiration to Audited Production" (34 min). [V]
- **Claude Design for Creative Landing Pages** (10 lessons, 1.8 h). The free lesson reframes prompting as directing and asks five questions before prompting: what the page is about, the feeling, the main visual object, what happens on scroll, and what makes it different. [V]
- **Claude Code for Vibe Coders** (9 lessons, early access). The premise is that "a polished landing page can still hide dozens of inconsistent design decisions", and the course uses Claude Code to expose design-system drift and "ask for exact counts". [V]
- **The rest of the AI shelf is tool tours:**
  - *AI Website Builders*: 5 of 9 lessons are Lovable
  - *Claude Code Crash Course*: its description promises hooks and parallel workflows, but the outline stops at slash commands
  - *Master Agentic Workflows*: Cline, Roo Code, Manus, Genspark
  - *Galileo and Claude AI*
  - *Ideogram* [V outlines]

### Tools the pivot assumes

These come from course outlines and tool blocks [V]:

- **Coding agents:** Codex and Claude Code, with Claude Design as the canvas
- **Builders:** Aura, Neuform, Lovable, v0, Framer
- **Models, named by version:** GPT-5.1, 5.5 and 5.6; Gemini 3 and 3.1; Opus 4.8, 5 and 5.5; Fable 5 and 5.1
- **Assets:** GPT Image 2, Higgsfield, Midjourney, Spline, Unicorn Studio, Blender
- **Not found:** Cursor appears in no 2026 course title or tool list I read; it belongs to the 2024–early-2025 courses. Figma Make appears only as an SEO keyword on the prompt-ui page and in no lesson title. [V]

**Ownership.** Meng To launched Aura (his post of 2025-07-11: "I soloed this project from scratch… we don't use Figma anymore") and Neuform (his post of 2026-04-13). His own site lists Aura and DreamCut as his products. The site footer's "Tools" section links Aura, Neuform, ThreeUI and DreamCut. [V] The curriculum and the product line are the same thing. Read every "use Aura for X" lesson as a product demo that also teaches. [J]

### Design principles carried into the prompting

The strongest statement is the free article *How to Avoid AI Slop in Vibe-Coded Landing Pages* (dated June 3, 2026 on the page) [V]. It names tells you already ban:

- "the lazy selected state", "the giant all-caps eyebrow", "the random status pill", "glow lights that come from nowhere", "the purple gradient that somehow appeared"
- "Replace Inter if it makes the page feel like every other AI mockup"

It also states a rule worth keeping: *"If you do not supply taste, you inherit the model's taste."*

His pipeline, as the article gives it: `reference -> DESIGN.md -> HTML context -> prompt -> critique -> polish`.

Note the contradiction with the 2025 course, which recommended Inter and multi-layer "beautiful shadows". The catalogue carries both, with nothing marking the older advice as retired. [V, J]

### Does it teach verify-and-critique, or only generation?

**Both, depending on vintage.** [J]

- **2025 (prompt-ui):** generation only.
- **2026 courses:** critique is explicit: "critique AI-generated designs", "adversarial review", "ask for exact counts, inspect the source", "the first pass is a diagnostic".
- **The rigorous version lives outside the paywall,** in Meng To's public skills repo [V github.com/MengTo/Skills, cloned 2026-09-30]:
  - **`iterate-until-verified`** (added 2026-07-28)
    - converts "perfect, premium, production-ready" into an acceptance matrix of pass/fail gates with evidence
    - "Do not let an implementer be the sole approver of its own work"
    - "Withhold the implementer's rationale and self-assessment" from the verifier
    - supports blind comparison
  - **`audit-ai-design-slop`** (added 2026-08-29)
    - classifies findings as quality defect or slop pattern, ranked P0–P3
    - every finding cites evidence
    - "Default to subtraction"
    - "Do not assign a numeric slop score"
  - **`no-ai-design-slop`**
    - a removal test run on every suspect element
    - compact quality gates, including a full state list (active, hover, focus, loading, empty, error, disabled, selected, success) and reduced motion

**The gap:** no fixed breakpoint and state capture procedure and no contrast standard. Across all 155 skills in the repo:

- 71 mention reduced motion
- 0 mention WCAG, contrast ratios or 4.5:1
- 6 use the phrases "empty state", "error state" or "loading state" (the anti-slop skill lists those states individually) [V grep]

Motion accessibility is attended to; colour accessibility is not. [J]

### Quality signals behind "quality varies"

All [V] 2026-09-30 unless marked.

- **Lesson notes appear to be generated from source material and published without an edit pass** [J from evidence]. *Claude Code for Vibe Coders* notes say: "The later source set is not present yet, so this first release stops before the promised lessons on Three.js, the complete Blender pipeline, performance testing, and hooks." The webinar course shows "NO MARKDOWN NOTES ARE ATTACHED TO THIS SECTION."
- **Five of the seven newest courses are early access,** meaning incomplete.
- **Descriptions over-promise the outline:** the Claude Code crash course advertises hooks and parallelization, but its 8 lessons end at slash commands.
- **The free landing-pages lesson links "Watch the source video: DesignCode on YouTube".** Whether Pro lessons are also public on YouTube I did not verify [NF].
- **The Agent Skills vault** (94 skills) includes entries whose descriptions read as the public Anthropic frontend-design skill and Vercel's web interface guidelines [J: text match from memory, not diffed]. The vault is not a reason to pay.

### Recipe A against his workflow

| Recipe A step | Design+Code, as taught in the 2026 courses and free skills | Agree / weaker / stronger |
|---|---|---|
| 1 Frame: `brief.md` with job, user, metric, constraints, non-goals, required states | "Answer five questions before prompting" (feeling, focal object, scroll, difference); "Plan a Real Product Before You Build" (Codex course, title only) | **Weaker.** Marketing framing: no metric, no non-goals, no state list. Built for landing pages, not features. |
| 2 References: 3–6 annotated | Crop to the useful information; one reference per job (layout vs lighting vs treatment); "adapt, not paste"; URL import; full-page stitched capture | **Stronger technique.** Adopt the crop rule. **Riskier** where it becomes cloning (Aura "Exactly" import mode, "How I Clone a Website Into Aura"). |
| 3 Diverge: 3 directions, different layout strategy | Compare several `DESIGN.md` foundations; the same brief across Aura, Lovable and v0; model taste profiles | **Comparable, on a different axis.** He diverges on system and tool; you diverge on layout strategy. Both are valid; yours is the one that serves product screens. |
| 4 Capture to Figma | Aura to Figma; Figma to Codex | Agree; tool-bound. |
| 5 Converge on the system; new primitives justified in the PR | `DESIGN.md` as "taste floor" and "persistent visual DNA"; unique class names across parallel agents; extract a `DESIGN.md` from any site | **Agree on the spine.** His `DESIGN.md` is a single visual-style file (type, colour, spacing, surfaces, imagery, motion). Your five-file layer adds components, forbidden patterns, states and refs. **Don't collapse yours into his.** |
| 6 Verify: critic subagent, Playwright, 3 breakpoints × every state, rubric, 2–3 rounds | Free skills: acceptance matrix, maker/judge separation, blind comparison, P0–P3, removal test. Courses: mostly human review of rendered output | **The free skills are at least as strong, and stronger on one point:** withholding the builder's rationale from the critic. The courses are weaker (no fixed breakpoints, no state capture, no contrast check). |
| 7 Polish: spatial, human | "Fix the details manually when prompting is slower than editing" (article); Aura Design Mode and Edits | **Agree.** His rule is your "timebox the lottery". |
| 8 Ship behind a flag, read replays | Absent. "Customize your UI for 10x Conversion" asserts outcomes without measurement | **Weaker.** No instrumentation anywhere in the catalogue. [V outlines] |

---

## 3. Meng To's point of view

**Sources.** His X posts (read 2026-09-30), his skills repo, mengto.com, the article above, and the catalogue's own lesson names. Two interview summaries are secondary: Peter Yang's *Creator Economy*, 2025-07-27, and Aakash Gupta's newsletter, undated.

**Stated principles, 2025 to 2026** [V unless marked]:

- **2025-07-11 (X):** "AI likes to generate basic UIs, so make sure to provide templates, urls, images, figma"
  - "Starting with a meh UI will permeate the rest of your app… AI uses the initial design as a blueprint."
  - "Don't expect to one-shot things."
  - "99% of the time, I prompt with a file or two attached."
- **2025-07 (secondary, Peter Yang):** "A prompt is not enough to produce great designs"; a 90/10 split between AI generation and manual tweaks. [S]
- **2026 (secondary, Aakash Gupta):** "A screenshot tells the AI what you mean in one shot. A paragraph of description tells it what you think you mean." Also reports he "barely" uses Claude, preferring Codex. [S] His September 2026 posts show Opus 5.5 work, so treat that as dated. [V]
- **2026-08-29 (`no-ai-design-slop`):**
  - "Slop is not a color, font, gradient, card, or animation. It is a choice made by reflex rather than for the product."
  - "Use proximity before containers." "Use hierarchy before labels."
  - "Use depth only when the interface has a real layering model."
  - "Make motion explain something… state, causality, hierarchy, continuity, or spatial change."
  - "Do not invent customers, metrics, testimonials."
- **2026-09-30 (X):** he uses "the scoring system (out of 10)" to push 3D material fidelity (wood, paper, ceramic, metal, burning paper, cinders). A fidelity score for rendering; his audit skill forbids numeric taste scores. [V]

**Practised aesthetic** [V]:

- **Recent X posts** (Sep 26–30): a holographic card with depth maps and extrusion, a motion-design piece with 3D devices, a Japanese-craftsmanship page with burning paper and cinder transitions, and ThreeUI ("procedural 3D hero sections").
- **Skill library names:** `glass-dark-ui`, `dark-glass-clean-layout`, `beam-glow-states`, `liquid-metal-border`, `gooey-blob-system`, `mesh-gradient-dark-blue-clean`, `thinking-orbs`, `corner-lasers`, `fire-paper-loader`.
- **Frequency across 155 skills:** 31 mention glass, 46 glow, 50 gradient.
- **Catalogue lessons:** Glassmorphism, Neon UI, Soft UI, Neumorphism Button, Mesh Gradient Animation, Unicorn Background, Border Gradient, and "Success Modal and Confetti" in *UI Design for Developers*.

**The conflict, answered plainly.**

- **His aesthetic is the one your anti-patterns file rejects,** for your product surfaces. Glow, glass, gradients and spectacle motion are his signature. On DealReady, where the calm, dense table is the product, and on Fybr, where the map and the measurement are the product, each of those is decoration competing with evidence. [J]
- **His *rules* are not in conflict with yours.** His August 2026 skill would itself flag most of his showcase work if it were pasted onto a diligence table: "decorative stacking", "motion theater", "depth only when the interface has a real layering model". The rule is portable; the showcase is a marketing-surface register. [J]
- **One real disagreement.** His audit skill says "Do not reject a visual technique in isolation." Your checklist bans named defaults outright (Inter everywhere, purple-to-white gradients, four-card grids, weak hovers). For product surfaces, keep the outright bans. A named ban is enforceable by a linter or a rubric line; "reflex versus role" needs a judge. Use his removal test for everything the list does not name (ruling below). [J]
- **His own site fails his own skill** [V observed 2026-09-30]:
  - It uses decorative labels ("NODE ALPHA / ACCESS KERNEL", "SECTOR-123K", "DUTY CYCLE 07 DAYS") where his skill says "hierarchy before labels".
  - It loads Inter.
  - It shows a "LIMITED TIME DISCOUNT" countdown that read **72:00:00 on first page load and 71:59:49 to 71:59:55 on later loads, 15+ minutes apart**. It restarts per page load: manufactured urgency. File it as a counter-example. [V behaviour, J reading]

**Does the SwiftUI and Framer-era sensibility survive the pivot?** Its interest in motion does, and so does its reach for gradients and depth. What's new is the discipline: the 2026 removal test, maker/judge separation and "every asset has a named job". The older sensibility was additive. The new writing is subtractive. The showcase work is still additive. [J]

---

## 4. Does it hold up, and is it worth it in the AI era?

The same three-way test as the Refactoring UI review. [J throughout, grounded in the outlines above]

| Bucket | What in Design+Code falls here |
|---|---|
| **Timeless craft** (keeps) | Removal test and "hierarchy before labels" (free skills); media role per section; reference-cropping and "adapt, not paste"; maker/judge separation; skills extracted after the work; *CSS Layout and Animations* fundamentals; the principle half of *UI Design for Developers* (2020), which Refactoring UI covers better |
| **Tool-specific, perishable** (half-life of months) | Everything named for a model version (GPT-5.1, Gemini 3, Opus 4.8, Fable 5.1, GPT-5.6); every Aura, Neuform, Lovable, Galileo or Ideogram feature lesson; effort-level and plan-picking lessons; the entire SwiftUI and UIKit shelf by release |
| **An agent already does it for you** | Writing CSS animations, Tailwind classes, gradient borders, Three.js scaffolds, React conversion from HTML ("Three Ways I Turn HTML Into React With Aura"), "one-shot a landing page" |

**Where it sits.** [J; Shift Nudge and Refactoring UI were not re-researched this thread]

- **Refactoring UI** remains the better source for visual fundamentals: compact and tool-agnostic. *UI Design for Developers* is the Design+Code equivalent, and it is five years older and ships confetti.
- **Shift Nudge** remains the better source for training an eye through deliberate practice.
- **Design+Code in 2026** is neither. It is a practitioner's working stream on AI-assisted landing pages, and the most current of the three. Its unique value is watching the reference, `DESIGN.md`, generate, critique loop run on live tools by someone with taste in the marketing register.
- **The free material** covers most of the durable content: Meng To's skills repo, the anti-slop article, and Google's open `DESIGN.md` spec (open-sourced 2026-04-21 [V Google blog]). What the paywall adds is the video of the loop being run, and the `DESIGN.md` extraction lessons.

---

## 5. Teaching versus tips, with hours to value

For a product engineer with a decade in TypeScript, an agent practice, and no need to be taught how to install Claude Code. [J]

| Class | Courses | Builds a mental model? | Hours to value for you |
|---|---|---|---|
| **Teaching** (a model you keep) | *Landing Pages and AI Tools* (the `DESIGN.md` and anti-slop lessons); *Codex Masterclass*; *Claude Code and Claude Design* (the `DESIGN.md` lessons); the free skills repo | Yes: the reference-to-system-to-critique loop, maker/judge separation, media roles | ~3.3 h free pass plus ~6 h paid video plus ~4 h applying = **~13 h**. First usable change to Recipe A after the free pass. |
| **Framing** (one idea worth having) | *Claude Design for Creative Landing Pages* (five questions); *Claude Code for Vibe Coders* (audit for drift, ask for counts) | A single frame each | ~0.5 h, from the free lessons alone |
| **Tool tour** | *Master AI Prompting for Stunning UI*; *AI Website Builders*; *Claude Code Crash Course*; *Master Agentic Workflows*; *Galileo*; *Ideogram*; the Framer, Webflow, Wix, Spline and Play courses | No | Not worth your hours |
| **Build-along** (copy the instructor) | *UI Design Quick Apps in Figma* (12 h); the SwiftUI, UIKit and React Native shelves; *React Native with Claude AI* (14 h) | Platform skill, not design judgment | Not your stack; skip |
| **Dated fundamentals** | *UI Design for Developers*; *Design System in Figma*; *CSS Layout and Animations* | Partly | Covered better by Refactoring UI and your own design layer |

---

## 6. Canon ruling, addressed to Plumb

Plumb: three principles to adopt, one process rule, eight checklist amendments, six counter-examples, and a purchase verdict. Each proposal below has been through my drift test (would it be at home in a generic dashboard template?) and register test (is it in the design layer's voice?). His vocabulary fails the register test as he writes it. "Premium", "cinematic", "high-end", "stunning" and "10x conversion" are marketing-surface adjectives. Every principle below has been reworded into the layer's plain claim form before proposal.

### Principles to adopt

**C-1. Reflex is the defect, not the technique.** `[PROPOSED — needs sign-off]`

- **Principle.** Named tells in `anti-patterns.md` stay banned outright on product surfaces. Everything the list does not name must pass the removal test: name the element, state its job (information, state, action, hierarchy, meaning), remove it mentally, and keep it only if something real is lost.
- **Example (Fybr).** A sequential ramp on the stockpile surface encodes height, has a legend, and survives removal: without it, height is unreadable.
- **Counter-example (DealReady).** A soft violet radial glow behind the diligence summary header encodes nothing. Removing it loses nothing. It goes.
- **Drift:** pass. It deletes template ornament and adds none.
- **Register:** pass as reworded. "Slop" stays the critic's shorthand, not the layer's term.
- **Source:** Meng To, `no-ai-design-slop`, 2026-08-29 [V].

**C-2. Every image and every motion has a written job before it is generated.** `[PROPOSED — needs sign-off]`

- **Principle.** Each section's brief carries one line per media asset (what it must explain, where the subject sits, how copy shares the frame) and one line per motion (which of state, causality, hierarchy, continuity or spatial change it explains). No line, no asset.
- **Example (Fybr).** The camera flies to a stockpile when it is selected in the list. Job: continuity between list and map.
- **Counter-example (Fybr marketing).** A stock drone-over-quarry photo under a glow overlay. Job: none that the product owns.
- **Drift:** pass.
- **Register:** pass.
- **Source:** *Landing Pages and AI Tools* free lesson notes; `no-ai-design-slop` [V].

**C-3. Hierarchy before labels, proximity before containers.** `[PROPOSED — needs sign-off]`

This confirms Vesper §4 ("never boxes, backgrounds, and borders stacked as crutches"). It is proposed as Assay rubric wording, not a new principle, because his phrasing is enforceable by name.

- **Example (DealReady).** Finding severity is carried by column order, weight and one accent token.
- **Counter-example.** Every row wears an eyebrow, a status pill and its own card shell.
- **Drift:** pass.
- **Register:** pass.
- **Displacement:** none. It replaces a vaguer line.

### Process rule to adopt

**C-4. The builder does not grade itself, and the critic does not read the builder's reasons.** `[PROPOSED — needs sign-off]`

- **Principle.** Assay receives the brief, the rubric and the screenshots, and nothing from the builder's summary.
- **Example.** The critic's prompt carries `brief.md` plus 390/834/1440 captures.
- **Counter-example.** The critic reads "spacing normalised to the 8-pt scale" and passes spacing without measuring.
- **Drift:** n/a.
- **Register:** pass.
- **Loop test:** strengthens Recipe A step 6.
- **Source:** `iterate-until-verified`, 2026-07-28 [V].

### Amendments to the UI prompting checklist

1. **Four blocks in every UI prompt:** anatomy (the sections), behaviour (states and motion), aesthetic (by token name), forbidden (by tell name). [article, V]
2. **One reference, one job.** Crop each reference to the thing it teaches, and write "take X, ignore Y". [lesson notes, V]
3. **The verb is "adapt into our tokens", never "recreate".** No import-a-site-then-make-it-original workflows.
4. **Turn ambition words into gates before prompting.** "Feels trustworthy" becomes pass/fail lines in `brief.md`. [`iterate-until-verified`, V]
5. **Keep a model-defaults note in `anti-patterns.md`:** what each model you use reaches for unprompted, updated when you switch models. His article's per-model observations are secondary and will date; record your own. [S → J]
6. **Media role line per section; generated batches reviewed as a contact sheet** before any is placed. [lesson notes, V]
7. **Withhold builder rationale from the critic pass** (C-4).
8. **Extract a skill only after a problem is solved,** from the evidence of what worked. This matches your convention-file practice. [Codex free lesson, V]

### Rejected: filed as counter-examples, not canon

- **Clone modes and "rebuild a premium website without copying its identity" lessons.** Originality and IP risk, and tool-bound.
- **The spectacle skill packs** (glass dark UI, beam glow states, liquid-metal borders, gooey blobs, mesh gradients, holographic depth) on any DealReady or Fybr product surface. Vitrine may evaluate them for marketing pages, under C-1.
- **"Inter, Geist, and Manrope are great for modern apps" and multi-layer "beautiful shadows"** (prompt-ui, 2025). His own 2026 article contradicts them.
- **"Success Modal and Confetti"** (*UI Design for Developers*). This is a Vesper §6 anti-pattern.
- **designcode.io's lifetime-discount countdown,** which restarts at 72:00:00 per page load. File it as the anti-patterns entry for manufactured urgency on pricing surfaces.
- **"Customize your UI for 10x Conversion".** An outcome claim with no measurement. Tally would reject it.

**One item for Plumb to decide, not me.** Google open-sourced a draft `DESIGN.md` specification on 2026-04-21 [V]. Making `/docs/design/DESIGN.md` conform to it would let Stitch, Claude Design, Aura and Neuform read your layer directly. This touches the design layer's format, so it's Plumb's ruling. I lean yes for `DESIGN.md` only, keeping the other four files as they are. [J]

### Purchase verdict

**Recommendation: one month of Pro at $99** [V price 2026-09-30], timeboxed to the list below, **after** the free pass.

Not the year: $349, shown as a "limited time discount" from $699. Not Lifetime: $499, shown discounted from $999 beside a countdown that restarts. The durable content is free, and the paid content has a half-life of months, so ownership buys nothing. [V prices, J reasoning]

**Refund terms.** The published terms allow a voluntary 30-day refund; claiming a Product Pass offer ends that eligibility [V pricing FAQ]. The weekly live sessions and AI chat were not observed [NF]; don't count them in the value.

**Free pass first (~3.3 h, $0):**

1. The article *How to Avoid AI Slop in Vibe-Coded Landing Pages* (10 min)
2. github.com/MengTo/Skills (~1 h): `no-ai-design-slop` with its `ARTICLE.md`, `audit-ai-design-slop`, `iterate-until-verified`, `design-first-ui-prompting`, and `operational-enterprise-ai`. The last is written for enterprise AI product pages with approvals, audit, exceptions and rollback: close to DealReady's marketing site.
3. Free lessons (~2 h):
   - *Landing Pages and AI Tools* 1 (28 min) and 21 (28 min)
   - *Claude Code and Claude Design* 1 (32 min) and 5 (23 min)
   - *Codex Masterclass* 1 (5 min)
   - *Claude Design for Creative Landing Pages* 1 (8 min)

**Then the month (~6 h of video, ~4 h applying), three courses:**

1. **Landing Pages and AI Tools:** lessons 2 (slop removal, 22 min), 4 (same brief across Aura, Lovable and v0, 32 min), 5 (section-by-section rebuild with `DESIGN.md`, 13 min), 11 (`DESIGN.md` as persistent visual DNA, 25 min), 22 (Google's `DESIGN.md` format, 43 min), 29 (`DESIGN.md` for AI builders, 19 min), 37 (persistent design workflow with Codex, 42 min). About 3.3 h.
2. **Claude Code and Claude Design:** lessons 4 (extract a `DESIGN.md` from any website, 1 h 15) and 6 (inspiration to audited production, 34 min). About 1.8 h. Apply it by extracting a first `DESIGN.md` from Fybr's current product and diffing it against what you'd write by hand.
3. **Codex Masterclass,** the seven paid lessons (~1 h). Weight lessons 5, 7 and 8 (references, feedback and anti-slop, reusable skills).

**Skip condition.** If the free pass already gives you a working `DESIGN.md` extraction in your own Claude Code setup, the month's marginal value drops to lesson 22 and the comparison lessons. At that point, skip. [J]

---

## Assumptions and open items

- `[ASSUMPTION: "your product surfaces" means the DealReady app and the Fybr app. Their marketing sites are Vitrine's register, where more of his aesthetic can pass C-1.]`
- `[ASSUMPTION: the textbook's "Part 8.1 row" is the line quoted in the brief. I did not have the textbook itself.]`
- **Course publish and update dates** are not displayed anywhere I could find [NF]. Every date in the catalogue is inferred.
- **Model and product names inside the courses** (GPT-5.6 "Sol", Opus 4.8, Fable 5.1, "Ultra Code" and others) are reported as the courses state them. I did not verify them.
- **Independent reviews** of Design+Code from 2025–2026 of any substance: none found [NF]. The two interview write-ups are the only secondary material.
- **Codux's current status,** and whether Pro lesson videos are also on YouTube: not verified [NF].

---

## Sources

Accessed 2026-09-30 unless noted.

**Primary: designcode.io**

- [designcode.io](https://designcode.io/) (homepage title and footer positioning)
- [designcode.io/courses](https://designcode.io/courses) (all 94 cards)
- [designcode.io/sitemap.xml](https://designcode.io/sitemap.xml) (lesson slugs)
- [Pricing](https://designcode.io/pricing): $349/yr or $99/mo, Lifetime $499, feature matrix, refund FAQ
- Course pages read in full (outline plus free lesson notes):
  - [prompt-ui](https://designcode.io/courses/prompt-ui)
  - [landing-pages-and-ai-tools](https://designcode.io/courses/landing-pages-and-ai-tools)
  - [openai-codex-masterclass](https://designcode.io/courses/openai-codex-masterclass)
  - [claude-code-and-design](https://designcode.io/courses/claude-code-and-design)
  - [claude-design-for-creative-landing-pages](https://designcode.io/courses/claude-design-for-creative-landing-pages)
  - [claude-code-for-vibe-coders](https://designcode.io/courses/claude-code-for-vibe-coders)
  - [from-inspiration-to-landing-page-with-codex](https://designcode.io/courses/from-inspiration-to-landing-page-with-codex)
  - [ai-website-builders-pick-the-right-tool](https://designcode.io/courses/ai-website-builders-pick-the-right-tool)
  - [claude-code](https://designcode.io/courses/claude-code)
  - [designcode-webinars](https://designcode.io/courses/designcode-webinars)
  - [build-a-threejs-game-with-fable-5-1](https://designcode.io/courses/build-a-threejs-game-with-fable-5-1)
  - [ui-design](https://designcode.io/courses/ui-design)
- [How to Avoid AI Slop in Vibe-Coded Landing Pages](https://designcode.io/articles/avoid-ai-slop-vibe-coded-landing-pages) (dated 2026-06-03 on the page)
- [Agent Skills vault](https://designcode.io/templates/collection/agent-skills)

**Primary: Meng To**

- [github.com/MengTo/Skills](https://github.com/MengTo/Skills): cloned 2026-09-30, latest commit 2026-10-01 +08:00; 155 skills
- [X: Aura launch tips, 2025-07-11](https://x.com/MengTo/status/1943717847236325519)
- [X: Introducing Neuform, 2026-04-13](https://x.com/MengTo/status/2043688125088903583)
- [X: Japanese craftsmanship page and scoring system, 2026-09-30](https://x.com/MengTo/status/2105325976762863929)
- [X profile](https://x.com/MengTo) (posts of Sep 25–30, 2026)
- [mengto.com](https://mengto.com/)

**Primary: other**

- [Google: Stitch's DESIGN.md format is now open-source, 2026-04-21](https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/)

**Secondary**

- [Peter Yang, *Creator Economy*: "Full Tutorial: Use AI to Create Beautiful Designs (Not Generic Slop)", 2025-07-27](https://creatoreconomy.so/p/use-ai-to-create-beautiful-designs-meng-to)
- [Aakash Gupta: "The PM's Guide to AI Design that isn't Slop with Meng To"](https://www.news.aakashg.com/p/pm-guide-ai-design) (undated)
- [Dealroom: Google acquires Galileo AI for Stitch](https://app.dealroom.co/news/feed/google-acquires-galileo-ai-for-stitch)
- [Banani: Galileo AI (now Google Stitch) review](https://www.banani.co/blog/galileo-ai-features-and-alternatives)
