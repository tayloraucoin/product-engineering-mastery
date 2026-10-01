# Shift Nudge Free-Layer Inventory: What Matt D. Smith Teaches in Public, and Where the Wall Is (checked September 30, 2026)

**Enrichment pass not completed.** The draft was over the enrichment tool's size limit on all three attempts and I ran out of turns. No hedged claims were replaced with enriched specifics. Every figure below comes directly from the sources listed.

The free first-party material is: the Figma 101 course, the 16 IIDS principles (IIDS is Shift Nudge's own "International Interface Design Style" canon),\[1\] three newsletter essays read in full, and the public parts of both checklists. That comes to about 130 principle-level atoms, where an atom is one stated rule with its source and locator. The 85+ interface lesson bodies and all the Claude Code lesson bodies are visible only as titles, or not at all. Every figure was checked on shiftnudge.com on 2026-09-30 unless marked otherwise.

## TL;DR

- **Pricing, verified 2026-09-30:** PRO is $1,997/yr and VIP is $4,997/yr (source: /what-is-shift-nudge).
  - The curriculum page says "85 lessons" but lists 88 titles.
  - /claude says "20" lessons in one place and "21 lessons" in another; the homepage says "21+".
  - The critique vault is listed as "1,000+".
  - VIP adds "Weekly Coaching with MDS".
- **Free from direct sources:**
  - Full lesson title lists with durations, for both the interface course and the Claude Code course.
  - The 16 IIDS principles.
  - The public accessibility checklist.
  - 8 of the 101 UI-checklist items.
  - Newsletter breakdowns that state rules directly ("Typography. Layout. Color. In that order."; "make it painfully obvious").
  - Figma 101 transcripts.
  - Figma Community descriptions for 3 of the 11 attached files: Box Model, Lego, Opal. A fourth listing matching "Advanced interactive components" was found, but its creator is unconfirmed.
- **Behind the wall, all [NOT IN SOURCE], nothing reconstructed from reviews:**
  - Every interface and Claude Code lesson body.
  - The 24+ hours of behind-the-scenes footage, the project repos and the skill files.
  - The critique vault.
  - Shift Nudge AI (members-only Beta).
  - VIP coaching.
  - The full 101-item checklist sits behind a free email gate, not the paywall.

---

## 0. Source hierarchy and codes

**Hierarchy, highest first:**
1. Text by MDS in the first person, or explicitly attributed to him (e.g. "Note from MDS", newsletter essays, Figma 101 transcripts).
2. Unsigned shiftnudge.com copy. This is treated as the company's voice, not his personal statement.
3. The checklists you attached.
4. Figma Community listings.
5. Secondary sources.

"(fetched)" means the page was opened in full on 2026-09-30. "(snippet)" means I saw only a search excerpt.

| Code | Source | Access |
|---|---|---|
| SK | user-attached `sn-ui-checklist` SKILL.md | user-provided |
| AX | user-attached Accessibility Checklist, marked subscriber-only | user-provided |
| AXW | /accessibility | fetched |
| UIW | /weekend "Checklist Preview" | snippet |
| IIDS | /iids | fetched |
| NL-TLC | /archive/19068534, 04-13-25 | fetched |
| NL-VLA | /archive/20963207, 09-14-25 | fetched |
| NL-ANIM | /archive/21338249, 10-12-25 | fetched |
| NL-CFG | /archive/19400164 | snippet |
| CC | /claude | fetched |
| WIS | /what-is-shift-nudge | fetched |
| HOME | / | fetched |
| CUR | /curriculum | fetched |
| FAQ | /faq | snippet |
| PORT | /portfolio | snippet |
| F101 | /figma and /figma/101/* | snippet |
| MDS | /mds | fetched |

Locators are section headings unless noted.

---

## 1. Public curriculum skeleton

### 1A. Interface Design curriculum (CUR, fetched)

The page's own summary is "85 lessons covering typography, layout, color, style, imagery, and interaction design."\[2\] Its only description applies to every lesson: "Every lesson follows a proven framework. Why the principle matters, What it looks like in real client work, and How to apply it to your projects. Each lesson includes a design exercise…"\[2\]

The eight modules list 88 titles, plus a separate Figma 101 block of 12. The gap between 88 and "85" is recorded here, not resolved.

Every title is [TITLE ONLY] unless noted. Titles are in page order.

| Module | Lessons (duration) | Status |
|---|---|---|
| Start | Welcome 02:45; How Everything Works 04:25; Pro-Designer Mindset 04:29; Choosing Design Software 05:59; UX vs. UI 06:00; Design Process Overview 16:55; Using Reference Material 24:57; Quick Keys Fast Workflow 03:35; Organizing Design Projects 08:19; Figma Organization --:--\[2\] | [TITLE ONLY]. A free lesson titled "Design Process" is listed separately (see 1D) |
| Typography | Font Size 16:44; Font Weight 17:29; Hierarchy 25:42; Titles & Body 31:32; Callouts 36:21; Truncation 17:52; Text Style Definitions 27:53; Interactive Text 25:20; Combining Text and Elements 22:59; Start With System Fonts 28:04; Using Alternate Fonts 22:23; Typography Overview --:--; Details of UI Typography from Apple 30:33\[2\] | [TITLE ONLY] |
| Layout | The Box Model 24:50; Grids & Containers 28:34; Implicit Grid 23:41; Negative Space 21:54; Alignment 12:40; Optics vs. Math 24:49; High & Low Density 28:18; Scale, Weight, & Hierarchy 22:07; Affordance 19:25; Interactive Layouts 26:22; Layout Connectors 19:00\[2\] | [TITLE ONLY]. Implicit Grid is also listed as a free lesson (see 1D) |
| Color | Color Picking Methods 23:17; Contrast & Accessibility 26:57; Structural vs. Interactive 34:53; First, Second, Third 21:46; Strategic Definitions 16:58; Amount & Modification 23:37; Gradients 31:49; Nifty Shades of Grey 14:13; White & Almost White 25:20;\[3\] Secrets of Dark UI 14:38\[2\] | [TITLE ONLY] |
| Style | Design Direction 27:32; Subtlety is Key 19:59; Corner Radius 36:34; Borders & Dividers 31:15; Depth, Lighting and Shadow 27:30; Opacity & Blur 24:18; Deconstructing Styles 73:08; Button Styles 23:04; Marketing Site Style 21:41; Form vs. Function 21:53\[2\] | [TITLE ONLY] |
| Imagery | Imagery Overview 11:46; Static Images 21:48; To Rasterize or Not 12:38; Dynamic Images 19:30; Blend Modes 18:23; Photo Manipulation 26:46; Resourceful Assets 17:42; Creating Icons 24:01; Using Icons 25:20; Simple Illustrations 29:32; App Icons 12:45\[2\] | [TITLE ONLY] |
| Elements | Introduction to Elements 01:34; Navigation 23:42; User Input 12:52; Forms 33:52; Profile 18:38; Settings 16:52; Lists & Cards 15:49; Detail Screens 12:51; Sorting & Filtering 18:58; Modals 13:58; Tables 27:14; Design Systems 41:29\[2\] | [TITLE ONLY]. A free lesson titled "Lists vs. Cards" is listed separately (see 1D) |
| Tactics | No-stress Experiments 18:21; Low-Fidelity Designs 16:40; Mobile-First Responsive 38:39; iOS Design 23:42; Material Design 09:50; Design Doc Organization 22:28; Leading Design Reviews 20:07; Prototyping 01:11; Developer Handoff 17:22; Pricing & Getting Work 24:39; Bonus: Figma Variants 16:43\[2\] | [TITLE ONLY] |

**Conflicts with the older page** (shiftnudge.com/?amp=&amp=, snippet):
- The durations for Callouts and Truncation are swapped (17:52 / 36:21).\[3\]
- It uses the titles "Welcome to the Course" and "Combining Text & Element".\[3\]
- It splits modules into Core and Pro tiers.\[3\]
- It lists a "Critique Vault" module.\[3\]

The 8-, 12- and 36-week schedules (/schedules/8, /12, /36; snippet) reorder the same titles and add no lesson descriptions.\[4\]\[5\]\[6\]

### 1B. Claude Code for Designers (CC, fetched)

Everything in this subsection is [TITLE ONLY].

**Lessons, in page order:** Orientation; Why should you learn Claude Code? 5:52; Terminal basics 5:19; Claude Code setup 7:39; Your local folder structure 5:24;\[7\] GitHub account and basics 10:36; Vercel and deployment 5:49; Your code editor (IDE setup) 4:54; Ways to use Claude Code 11:40; Hello world 6:38; Introduction to the project 8:04; How to spec a build before Claude touches it 15:52; Canvas vs Code 11:05; Designing the build 9:35; Iterating the build 15:02; Tweaking with precision 12:46; Starting the iOS port 17:51; Native translation and device reality 17:01; Asking Claude for help 12:22; Context management 12:02; Staying current 8:30.\[7\]

That is 20 titles with durations, plus "Orientation" with none. The site's counts conflict:
- The PRO box says "20 Fast-paced, value-packed lessons".\[7\]
- The FAQ says "21 lessons, most between 5 and 17 minutes".\[7\]
- HOME says "21+".\[8\]

**Tools:** Terminal theming; Terminal shortcuts; API keys and secrets; Connecting Figma with MCP; Annotating with Agentation; Live-tuning with DialKit; Skills, personal and project; iOS native components; Shipping to a real iPhone.\[7\]

**Behind-the-scenes footage (BTS):**
- Welcome to behind the scenes 1:30.\[7\]
- Web build: Idea to first build 2:23:59; Designing while building 3:03:39; A creative GSAP expedition 1:00:29; Breaking AI target fixation 1:43:26; Component architecture before code 1:04:12; Figma to Claude Code via MCP 1:32:26; Context engineering in practice 1:00:10; Bidirectional Figma ↔ React syncing 43:17.\[7\]
- Mobile + iOS planning: Refining UI in Ghostty 1:36:36; Mobile that scales 13:21; Tuning animation feel with DialKit 1:14:19;\[7\] Mobile polish on a real device 1:48:30; The iOS-or-not decision 9:03; Documenting before the port 42:55; Writing the PRD before the build 42:37; Handoff to execution 12:02; First look at the iOS build 4:41.\[7\]
- Native iOS refinement: Native iOS interaction model 1:41:05; Going truly native 1:00:00; Web port to native iOS translation 1:16:45; Microinteractions that come alive 16:47; Custom font picker 51:16; Putting it on a real iPhone 10:58.\[7\]

**Course-level descriptions.** None exist for individual lessons. The course-level text is:
- "01 Map … spec the build, create the context, and hand the model what's in your head before it goes rogue"\[7\]
- "02 Decide … Comprehension checks before the build begins"\[7\]
- "03 Structure … First on the web, then a native iOS app on your phone"\[7\]
- "six modes of working with AI. Ideation, research, spec, build, play, refine."\[7\]

### 1C. Figma 101 (free; titles from CUR, descriptions from F101 snippets)

| # | Title | Public description |
|---|---|---|
| 01 | Get comfortable with Figma 03:54 | "Get comfortable with Figma's interface so you can work confidently without fumbling."\[9\] |
| 02 | Creating and managing files 03:13 | "…so you don't end up with a messy browser full of untitled files." (transcript visible)\[10\] |
| 03 | Frames and groups 04:44 | [TITLE ONLY] |
| 04 | Manipulating text 05:17 | "…focus on typography decisions instead of fighting the tool."\[11\] |
| 05 | Creating and using shapes 06:55 | "…build interface elements with precision and confidence."\[12\] |
| 06 | Importing and using images 04:51 | Transcript excerpt visible\[13\] |
| 07 | Getting around the interface 06:23 | "Learn navigation shortcuts and interface tricks…"\[12\] |
| 08 | Using auto layout 05:06 | "…responsive interface elements that adjust dynamically to content."\[14\] |
| 09 | Creating components 08:06 | "…maintain consistency across your designs."\[15\] |
| 10 | Superpowers with plugins 03:57 | "Understand accessibility checking, image libraries, and shared design files…"\[16\] |
| 11 | Prototyping and motion 04:48 | Fragment only: "less guesswork and more confidence…"\[12\] |
| 12 | Collaborating and sharing 04:51 | Fragment only: "less friction in the design process…"\[12\] |

### 1D. Other items with lesson-level titles

- **Free Lessons** (/free, snippet): "Get 3 FULL lessons … Lesson 01 – Design Process; Lesson 02 – Implicit Grid; Lesson 03 – Lists vs. Cards."\[17\]
  - When fetched on 2026-09-30, /free redirected to the Resources page.\[17\] Current availability is unconfirmed.
  - "Lists vs. Cards" does not match the curriculum title "Lists & Cards".
- **Free 3-part workshop** (/workshop, snippet): "Design Process" (May 29, 2024), "UI Design Principles" (May 30, 2024), "Success Strategy" (May 31, 2024).\[18\]\[19\] The replays were not inspected.
- **Portfolio Workshop** (PORT, snippet): four sessions titled "MDS Portfolio Method 90min", "Hiring Manager Panel", "Designer Panel" and "Live Portfolio Critiques".\[20\]
  - Session 1: "Mindset shift, the MDS Method (Map → Decide → Structure)…"\[20\]
  - Session 4: "8-10 portfolios reviewed live."\[20\]

---

## 2. Atom table

**Index:** A Typography T1–T20 · B Layout L1–L22 · C Color C1–C15 · D Style S1–S10 · E Imagery I1–I12 · F Elements E1–E20 · G Tactics P1–P17 · H Critique R1–R16 · I AI AI1–AI12 · J Accessibility closing X1–X4 · K Overlap register.

Glosses restate the source. They do not interpret it.

### A. Typography

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| T1 | SK | Review: Typography | "Keep font sizes deliberate. Aim for 2 to 4 per screen or section." | 2–4 sizes |
| T2 | SK | Review: Typography | "Merge stray sizes where possible." | Merge outliers |
| T3 | SK | Review: Typography | "Use weight, case, or color before adding another size." | Other levers first |
| T4 | SK | Review: Typography | "Check that hierarchy matches content priority." | Rank = priority |
| T5 | SK | Review: Typography | "Ensure typeface choice supports the intended personality." | Typeface fit |
| T6 | SK | Review: Typography | "Keep primary content at 16px or larger unless there is a strong accessibility-aware reason not to." | 16px floor, with exception |
| T7 | SK | Review: Typography | "Watch line length and readability for longer copy." | Line length |
| T8 | SK | Common Mistakes | "Too many font sizes \| More than 4 distinct sizes on one screen or section" | More than 4 = mistake |
| T9 | UIW | Typography | "Have I chosen font sizes very deliberately (ideally 2-4 per screen or section) and pushed myself to use as few as possible?"\[21\] | Original wording of T1 |
| T10 | UIW | Typography | "Am I sure there's not a single straggling font size lying around somewhere that could be matched up with another size?"\[21\] | Original wording of T2 |
| T11 | UIW | Typography | "Are there any areas where font weight would be a better change instead of font size?"\[21\] | Weight over size |
| T12 | UIW | Typography | "…whether UPPERCASE, Title Case, or Sentence case—would be more affective that a font size change?" [sic]\[21\] | Case over size |
| T13 | NL-VLA | ¶ "Next, I'm always…" | "I'm always trying to use as few font sizes as possible. In this case, three was enough"\[22\] | Minimum sizes |
| T14 | NL-VLA | same ¶ | "Fewer sizes make the design look consistent, which reads as intentional."\[22\] | Reads as intentional |
| T15 | AX | Typography | "Is the text at a readable size? (Primary body copy no smaller than 16px)"\[23\] | 16px body |
| T16 | AX | Typography | "Do the titles and body copy have optimal line height?"\[23\] | Line height |
| T17 | AX | Typography | "Do the paragraphs fall within the optimal character width of 45 – 75 characters? https://readable.now.sh" \[23\] | 45–75 characters |
| T18 | AX | Typography | "Have you considered how your design will read if you closed your eyes and had someone describe what they see in a logical order?"\[23\] | Spoken order |
| T19 | AX | Typography | "Have you considered the responsive nature of text-based content and created rules around truncation and or change of layout based on viewport?"\[23\] | Truncation rules |
| T20 | AX | Typography | "[Developer] Are you using <strong> and <em> appropriately with semantic markup?" / "[Developer] Have you considered creating a 'large font size mode'? Sometimes this can be done with creative development by using the mobile styles on larger viewports." | Semantic markup; large-type mode |

### B. Layout

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| L1 | SK | Review: Layout | "Every element should have intentional spacing." | Deliberate spacing |
| L2 | SK | Review: Layout | "Use a clear alignment structure or grid." | Grid |
| L3 | SK | Review: Layout | "Negative space should define relationships, not appear random." | Space shows relationships |
| L4 | SK | Review: Layout | "Increase breathing room where sections feel cramped." | Add room |
| L5 | SK | Review: Layout | "Ensure scan paths are clear and reduce eye darting." | Scan paths |
| L6 | SK | Review: Layout | "Correct optical misalignments when mathematical alignment looks wrong." | Optical over mathematical |
| L7 | SK | Review: Layout | "Match density to the type and volume of content." | Density fits content |
| L8 | SK | Review: Layout | "Make interaction affordances obvious." | Affordance |
| L9 | SK | Review: Layout | "Remove or layer content when everything does not need to be visible at once." | Layering |
| L10 | SK | Common Mistakes | "Arbitrary spacing \| Gaps that do not follow a consistent spacing rhythm" | No rhythm |
| L11 | SK | Common Mistakes | "Weak hierarchy \| Everything feels equally important" | No priority |
| L12 | SK | Common Mistakes | "Weak affordance \| Interactive elements do not look interactive" | Hidden controls |
| L13 | UIW | Layout | "Have I used a clear grid structure with properly aligned elements that visually balance each other out?"\[21\] | Original wording of L2 |
| L14 | NL-VLA | ¶ "The 12-column…" | "The 12-column approach provides layout flexibility while also maintaining mathematical relationships."\[22\] | 12-column grid |
| L15 | NL-VLA | same ¶ | "When you build with a proven framework from the very beginning, you can make adjustments without breaking the underlying structure."\[22\] | Framework first |
| L16 | AX | Layout | "Can a user visually navigate a page in a logical way?"\[23\] | Logical navigation |
| L17 | AX | Layout | "Is there a clear page title that states the purpose of the page?"\[23\] | Page title |
| L18 | AX | Layout | "Do the headers accurately convey the structure of information?"\[23\] | Headers |
| L19 | AX | Layout | "Does the visual order match the reading order? (Left to right, top to bottom)"\[23\] | Reading order |
| L20 | AX | Layout | "[Developer] Can a screen reader scan your project's interface? (A screen reader will announce headers, specific areas, links, buttons, and controls along the way)" / "[Developer] Do keyboard controls provide a logical and predictable order for navigation?" / "[Developer] Don't put status text or other non-interactive elements into the tab order" | Screen reader, keyboard, tab order |
| L21 | IIDS | 2, 5, 7, 8 | "Grids create order across layouts and devices." / "Proportion creates harmony through scale and spacing." / "Precision appears in alignment, spacing, and hierarchy." / "Order comes before style."\[1\] | IIDS structure principles |
| L22 | IIDS | 1, 4 | "Typography establishes hierarchy, rhythm, and tone."\[1\] / "Communication defines how information is expressed, structured, and revealed."\[1\] | IIDS foundations |

The public web version (AXW) words two of these slightly differently: "Can a user visually navigate what you've designed in a logical way?" and "Do the headers h1, h2, h3, etc. accurately convey the proper structure of information?" The [Developer] items do not appear on AXW.\[23\]

### C. Color

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| C1 | SK | Review: Color | "Use a systematic palette, not ad hoc color picking." | Systematic palette |
| C2 | SK | Review: Color | "Check contrast across text, icons, controls, and states." | Contrast |
| C3 | SK | Review: Color | "Keep structural colors distinct from interactive colors." | Structural ≠ interactive |
| C4 | SK | Review: Color | "Establish a clear CTA hierarchy." | Rank the CTAs |
| C5 | SK | Review: Color | "Simplify gray usage and keep neutrals disciplined." | Few grays |
| C6 | SK | Review: Color | "Use color to support depth and layering." | Color for depth |
| C7 | SK | Review: Color | "In dark interfaces, avoid pure black and pure white unless used intentionally." | Dark UI |
| C8 | SK | Review: Color | "Treat gradients carefully and only when they help the design." | Gradients |
| C9 | SK | Common Mistakes | "Color role confusion \| Accent or CTA colors used decoratively instead of functionally" / "Gray proliferation \| Too many nearly identical neutrals" | Two mistakes |
| C10 | NL-VLA | ¶ "Lastly, background colors…" | "If one shade means 'selected,' another also means 'selected,' and a third means something else entirely, the whole system breaks down."\[22\] | One meaning per shade |
| C11 | NL-VLA | same ¶ | "A quick color check — what does each background mean? — helps you spot and fix conflicts"\[22\] | Audit what each color means |
| C12 | NL-TLC | ¶ after Fig. 2 | "You could even change the color to introduce hesitation and tip off the user that this is an important decision."\[24\] | Color signals weight |
| C13 | AX | Color and Contrast | "Is information conveyed by means other than color alone? (Underlined links, status indicators, etc.)"\[23\] | Not color alone |
| C14 | AX | Color and Contrast | "Does text meet the minimum contrast ratio requirements? (3.0 for large text and informational graphics, 4.5 or higher for all other text)" / "[Developer] Have you considered creating alternate color themes or a high-contrast version? (AAA–7.0 or higher for all text)" | 3.0 / 4.5 / 7.0 thresholds |
| C15 | IIDS | 3 | "Color establishes hierarchy, reinforces meaning, and indicates state."\[1\] | Color's jobs |

AXW's version of C13 adds: "Color coding is possible as long as the color information is supplemented with differences in shape or text." AXW's contrast item gives no numbers.\[23\]

### D. Style

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| S1 | SK | Review: Style | "The design direction should be describable in a few specific adjectives." | Adjectives |
| S2 | SK | Review: Style | "Corner radius choices should be intentional and consistent." | Radii |
| S3 | SK | Review: Style | "Borders and dividers should support hierarchy, not dominate it." | Borders |
| S4 | SK | Review: Style | "Use negative space as a separator before adding more lines." | Space before lines |
| S5 | SK | Review: Style | "Shadows and depth should reinforce the visual model." | Depth |
| S6 | SK | Review: Style | "Buttons and key actions should have considered interaction states." | Button states |
| S7 | SK | Review: Style | "Avoid piling on blur, opacity, and effects without a clear reason." | Effects |
| S8 | SK | Common Mistakes | "Decorative noise \| Borders, shadows, blur, or gradients without a hierarchy purpose" | Noise |
| S9 | NL-TLC | "Why TLC works" | "Most designers skip past TLC and jump straight to style. They chase trendy gradients or fancy shadows"\[24\] | Style too early |
| S10 | IIDS | 12 | "Restraint removes what is unnecessary."\[1\] | Restraint |

### E. Imagery & media

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| I1 | SK | Review: Imagery | "Every image should improve the design." | Images earn their place |
| I2 | SK | Review: Imagery | "Stress-test dynamic imagery against awkward edge cases." | Edge cases |
| I3 | SK | Review: Imagery | "Empty states should still feel designed." | Empty states |
| I4 | SK | Review: Imagery | "Icons should share a clear system for size, stroke, fill, and role." | Icon system |
| I5 | SK | Review: Imagery | "Prefer SVG or CSS when raster assets are unnecessary." | Vector first |
| I6 | SK | Review: Imagery | "Look for opportunities to use illustration, pattern, or branding details intentionally." | Illustration |
| I7 | AX | Media | "Have you avoided text inside of bitmap graphics whenever possible?"\[23\] | No text in bitmaps |
| I8 | AX | Media | "Have you made transcripts available for any audio files? (Helpful for the deaf and for people who aren't in a suitable environment to listen)"\[23\] | Transcripts |
| I9 | AX | Media | "Have you provided closed-captions (and transcriptions) for any video content? (Rev, Descript, etc.)"\[23\] | Captions |
| I10 | AX | Media | "[Developer] Have you checked your icons for a minimum AA Large (3.0) contrast? Have they been properly labeled via the interface design or within the code?" / "[Developer] Does all of your image-based content have alt (alternate text)? (Also helpful if internet connection is slow)" | Icon contrast; alt text |
| I11 | NL-ANIM | ¶ 2; "Quick recap" | "You don't have to keep it animated at all times." / "if you're working with static masked images, union works fine. But for animation … try this blur plus blend mode technique."\[25\] | Use motion sparingly; pick the technique per case |
| I12 | IIDS | 13, 10 | "Icons, photographs, illustrations, video, or future formats serve clarity and meaning, not decoration."\[1\] / "Motion clarifies relationships and supports continuity."\[1\] | Purpose of visuals and motion |

### F. Elements & functionality

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| E1 | SK | Review: Elements | "Navigation should stay focused and easy to scan." | Navigation |
| E2 | SK | Review: Elements | "Inputs need clear default, hover, focus, disabled, and error states." | Input states |
| E3 | SK | Review: Elements | "Forms should ask only for necessary information." | Minimal forms |
| E4 | SK | Review: Elements | "Required versus optional fields should be obvious." | Required vs optional |
| E5 | SK | Review: Elements | "Profile, settings, and user-generated-content states should be considered end to end." | End-to-end states |
| E6 | SK | Review: Elements | "Components should feel complete, not only designed for the happy path." | Beyond the happy path |
| E7 | SK | Common Mistakes | "Missing states \| Hover, focus, disabled, error, empty, or loading states are absent" | Missing states |
| E8 | NL-VLA | ¶ "The weak spot…" | "I always say: make it painfully obvious."\[22\] | Obvious states |
| E9 | NL-VLA | same ¶ | "Wrapping the entire card with a selection indicator made the state unmissable."\[22\] | Whole-card selection |
| E10 | NL-VLA | ¶ on redundancy | "Any time I can see something like /10, /10, /10, over and over, I like to see if there's opportunities to remove that completely."\[22\] | Cut repetition |
| E11 | AX | Layout | "Have you used standardized controls and components in a very intentional way?"\[23\] | Standard controls |
| E12 | AX | Layout | "If you haven't used standardized controls, do you have a very good reason? And have you talked to your developer about implementing it in an accessible way? (Example, auto-suggest lists have a specific way of being implemented to be screen-reader friendly)"\[23\] | Custom controls need a reason |
| E13 | AX | Layout | "Do the interface elements have appropriate labels? (Inputs, checkboxes, radio buttons, etc.)"\[23\] | Labels |
| E14 | AX | Layout | "Do the clickable actions have clear action-oriented labels? (Download, Sign Up, Log Out, etc.)"\[23\] | Verb labels |
| E15 | AX | Layout | "[Developer] Are you using the <a> and <button> tags appropriately? (They can both be triggered by Enter, whereas the <button> element can additionally be triggered with the Spacebar)" / "[Developer] Have you defined Roles, States, and Properties?" | Link vs button; ARIA |
| E16 | AX | Functionality | "Have you provided feedback for user specific user interactions? Clearly communicate what's happened, what can be done next, etc. Validation and error messages?"\[23\] | Feedback |
| E17 | AX | Functionality | "Have you made sure that no part of your interface flashes more than three times per second? (This can cause seizures)"\[23\] | Flashing |
| E18 | AX | Functionality | "Make sure your site or app doesn't change context or activate functionality automatically. (Newsletter popups anyone?)"\[23\] | No automatic changes |
| E19 | AX | Functionality | "[Developer] Have you provided identification for languages <html lang="en">?" / "[Developer] Don't automatically refresh an entire app canvas unless it is really necessary for app functionality. (Assistive technologies generally must assume that a page refresh is a totally new structure.)" / "[Developer] Have you used Accessibility tools to verify screen reading experience? (Accessibility Insights, Axe, etc.)" / "[Developer] If you haven't used only native HTML, have you implemented the correct ARIA roles to bridge the gap? (Note some HTML5 elements don't have accessibility support, so using both HTML5 elements and ARIA roles can be used to cover those gaps.)" | Developer accessibility items |
| E20 | AXW | Layout & Structure | "Have you provided styles for all interactive states, including focus states?"\[23\] | Focus states (web version only) |

IIDS 9: "Affordance makes interaction discoverable. Interfaces suggest what can be done and respond to confirm those actions."\[1\]

### G. Product tactics and process

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| P1 | SK | Review: Getting Started | "Is the human problem being solved clear from the interface?" | Problem clarity |
| P2 | SK | Review: Getting Started | "Does the design complexity match the product complexity?" | Complexity match |
| P3 | SK | Review: Getting Started | "Do the references feel inspired rather than derivative?" | Not derivative |
| P4 | SK | Review: Getting Started | "Do the decisions reflect known business or technical constraints?" | Constraints |
| P5 | UIW | Start | "Do I have a very solid understanding of the human problem I'm solving with this interface?"\[21\] | Original wording of P1 |
| P6 | UIW | Start | "Is this a low, medium, or high complexity project and have I let that drive my decision for designing a low-fidelity version or not?"\[21\] | Complexity decides lo-fi |
| P7 | UIW | Start | "…would I feel comfortable putting my design next to the reference and talking through the areas I used for inspiration, without giving the impression that I copied…"\[21\] | Side-by-side test |
| P8 | UIW | Start | "…am I aware of business and/or technological constraints?"\[21\] | Original wording of P4 |
| P9 | SK | Review: Tactics | "The solution should look explored, not first-draft." | Explored |
| P10 | SK | Review: Tactics | "Mobile should force prioritization where relevant." | Mobile forces priority |
| P11 | SK | Review: Tactics | "Platform conventions should be followed or intentionally broken for a good reason." | Conventions |
| P12 | SK | Review: Tactics | "The work should tell a coherent product story across flows." | Coherent story |
| P13 | SK | Review: Tactics | "Important interactions should be prototyped when motion or state changes matter." | Prototype |
| P14 | PORT | Method: Decide | "Choose 3-12 projects ruthlessly. If it's not a 9/10 or 10/10, cut it or redo it. Don't show work you don't want more of."\[20\] | Portfolio curation |
| P15 | IIDS | 6, 11, 14, 16 | "Clarity directs every design decision." / "Efficiency reduces friction and streamlines flows." / "It avoids dependence on style to create designs that adapt across contexts." / "Interfaces enable confidence and trust by serving the user with clarity, efficiency, and integrity."\[1\] | IIDS product principles |
| P16 | CUR | footer | "Why the principle matters, What it looks like in real client work, and How to apply it to your projects."\[2\] | Lesson framework |
| P17 | NL-VLA | closing | "when your work comes across as clear and consistent, it doesn't just help users. It helps other people trust you as a designer."\[22\] | Trust |

### H. Critique and review method

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| R1 | SK | Quick Start | "Identify the review artifact: screenshot, Figma frame, live UI, or code." | Name the artifact |
| R2 | SK | Quick Start | "Review the categories below and skip anything that is clearly not applicable." | Skip what doesn't apply |
| R3 | SK | Quick Start | "Prioritize the highest-leverage issues first." | Leverage first |
| R4 | SK | Quick Start | "Give specific recommendations, not vague taste-based feedback." | Specific |
| R5 | SK | Evidence Rules | "Base findings on visible evidence. Do not invent issues you cannot verify." | Evidence only |
| R6 | SK | Evidence Rules | "If reviewing code only, call out likely visual risks as assumptions." | Code-only caveat |
| R7 | SK | Evidence Rules | "If reviewing a screenshot only, mention when states, interactions, or responsive behavior cannot be confirmed." | Screenshot caveat |
| R8 | SK | Evidence Rules | "Prefer concrete language like 'The card uses 4 corner radii' over 'The design feels inconsistent.'" | Concrete language |
| R9 | SK | Review Priorities | "1. Clarity of the problem and interface purpose 2. Hierarchy, layout, and interaction clarity 3. Color and state usage 4. Stylistic consistency and polish" | Priority order |
| R10 | SK | Response Format | (paraphrase) Top 3 Priorities; each of the eight categories marked PASS / X issues / N/A; Summary covering overall assessment, strongest area, biggest opportunity. | Output schema |
| R11 | SK | Tone | "Be direct and useful." / "Prefer specific fixes over abstract design theory." | Direct |
| R12 | SK | Tone | "Do not pad the review with praise if the work needs correction." / "If the work is strong, say why with the same level of specificity." | No padding |
| R13 | NL-TLC | ¶ 1–3 | "Typography. Layout. Color. In that order." / "If a UI feels 'off,' 9 times out of 10, the root cause is a breakdown in one of these three areas."\[24\] | TLC order |
| R14 | NL-TLC | "Why TLC works" | "That alone will clean up most designs."\[24\] | TLC is usually enough |
| R15 | NL-VLA | ¶ 2 | "Just a pass to make sure grids, type, and color are pulling in the same direction."\[22\] | Visual language audit |
| R16 | HOME | mid-page | "You can feel when a screen is off before you can say why. Naming it and fixing it with confidence is the skill."\[8\] | Naming what feels "off" |

### I. Claude Code / AI-assisted design

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| AI1 | CC | Note from MDS | "AI is a powerful tool, but the hands powering it are yours."\[7\] | Human agency |
| AI2 | CC | Note from MDS | "What gets built is exactly as good as the context you bring."\[7\] | Context sets quality |
| AI3 | CC | Note from MDS | "how to hand the model enough of what's in your head that it builds against your intent"\[7\] | Transfer intent |
| AI4 | CC | Process 01 | "spec the build, create the context, and hand the model what's in your head before it goes rogue"\[7\] | Spec first |
| AI5 | CC | Process 02 | "Canvas or code, native or custom, what stays and what gets cut. Comprehension checks before the build begins."\[7\] | Decide, then check |
| AI6 | CC | Process | "six modes of working with AI. Ideation, research, spec, build, play, refine." | Six modes |
| AI7 | CC | FAQ ("outgrow?") | "The method outlasts the tools: specs, context, judgment."\[7\] | Durable layer |
| AI8 | CC | FAQ ("every click?") | "The lessons teach the method: how to spec, how to steer, and how to iterate with precision."\[7\] | Spec, steer, iterate |
| AI9 | CC | FAQ ("individual course?") | "The eye from the UI training is what makes the building here good."\[7\] | Eye drives build quality |
| AI10 | WIS | AI & craft | "AI gets you to 80 percent, but it can't finish the work." / "Manual design practice trains the eye that directs AI."\[26\] | 80% claim |
| AI11 | WIS | AI & craft | "It doesn't know how to adjust spacing for rhythm, refine type hierarchy for clarity, or make the microadjustments…"\[26\] | Stated AI limits |
| AI12 | FAQ | ("craft … AI tools?") | "AI generates options—craft helps you evaluate them."\[27\] | Craft evaluates |

NL-CFG, seen only as a snippet: "I'm doubling down on helping designers build strong fundamentals first, then layer in the new tools with confidence."\[28\]

Authorship: AI1–AI3 are explicitly MDS's words. AI4–AI12 are unsigned site copy.

### J. Accessibility closing and resources

| ID | Src | Locator | Verbatim / (paraphrase) | Gloss |
|---|---|---|---|---|
| X1 | AX | Closing | (paraphrase, as you supplied it) Even well-intentioned projects will have mistakes; a perfectly universal solution is unlikely; inclusion is imperfect and requires humility, curiosity, and a desire to learn. | Humility |
| X2 | AXW | Closing | "even the most well-intentioned project is prone to have mistakes, even this one." / "don't let that stop you from trying."\[23\] | Web closing; no "humility, curiosity" wording |
| X3 | AX | More Resources | (paraphrase) 7 listed: Apple, Stark iOS 14, Princeton, UX Design CC, Microsoft Design, Microsoft Inclusive Design, Wix. Inline links: readable.now.sh, usecontrast.com/guide, whitehouse.gov/accessibility. | Attached resource list |
| X4 | AXW | More Resources | 10 listed; adds Practical Accessibility, Accessibility Project, Use Contrast\[23\] | Web resource list |

IIDS 15: "Accessibility is integral to design. Legibility, contrast, and inclusivity are built in from the start."\[1\]

### K. Overlap register

Counts are of distinct documents. AX and AXW are two versions of one checklist, so they count as a single lineage.

| Rule | Where | Distinct sources | Note |
|---|---|---|---|
| Font-size count | SK T1/T8; UIW T9; NL-VLA T13 | 3 | SK condenses UIW |
| Stray sizes | SK T2; UIW T10 | 2 (one lineage) | |
| Weight/case before size | SK T3; UIW T11–T12 | 2 (one lineage) | SK adds "color" |
| 16px | SK T6; AX T15 / AXW | 2 lineages | **Divergence:** SK allows an exception; AX/AXW state none |
| Line length | SK T7; AX T17 | 2 | Only AX gives 45–75 |
| Contrast | SK C2; AX C14/I10; AXW; IIDS 3, 15 | 3 lineages | Only AX gives numbers |
| Interactive states | SK S6/E2/E7; AXW E20; NL-VLA E8/E9; IIDS 9 | 4 | |
| Problem, constraints, references | SK P1/P3/P4; UIW P5/P7/P8 | 2 (one lineage) | |
| Grid | SK L2; UIW L13; NL-VLA L14; IIDS 2 | 4 | Only NL-VLA names 12 columns |
| Style after fundamentals | NL-TLC R13/S9; IIDS 8; SK R9 | 3 | SK ranks problem clarity first; TLC leaves it out |
| Automatic context change | AX E18; AXW | 1 lineage | |

---

## 3. Free assets table

On 2026-09-30, /figma/files showed only a header and a name/email gate ("Get instant access"),\[29\] so the file list comes from your screenshot. Figma Community pages block automated access, so all listing text below comes from search snippets.

| Asset | Own description (short verbatim) | Principle it teaches (own description only) | Inspection |
|---|---|---|---|
| Before & after animation files | Not found as a confirmed MDS listing. A file called "Before&After smart animation" exists, but its creator is unconfirmed and it has no description.\[30\] | [NOT IN SOURCE] | Not inspected; download via the gate |
| Advanced interactive components | "Multiple radio buttons prototyped on a single screen." (creator unconfirmed)\[31\] | Radio-button prototyping, per the description; principle [NOT IN SOURCE] | Not inspected; download |
| Killer auto layout tutorial | No listing found. Secondary: Figmalion #90 quotes MDS's tweet: "There are three critical things you need to understand in order to use it efficiently..."\[32\] | The three things are [NOT IN SOURCE] | Not inspected; download |
| Claude Code animated icons | No listing found. Secondary: Figmalion #238 describes a video on "why Anthropic's Claude app icons feel so satisfying".\[33\] | [NOT IN SOURCE] (no first-party text) | Not inspected; download |
| Ideal UI contrast scores | Not found | [NOT IN SOURCE] | Not inspected; download |
| Opal camera packaging | "I posted a Twitter thread about the Opal camera packaging design." (listing "Opal Breakdown"; MDS's Dribbble shot says he published the file)\[34\]\[35\] | Packaging breakdown; principle [NOT IN SOURCE] | Not inspected; download |
| COVID-19 Isolation UI | Not found. The similar "Quarantine for COVID-19" file is by someone else.\[36\] | [NOT IN SOURCE] | Not inspected |
| Box model animations | "2-frame animation technique for this Twitter thread about the Box Model." (creator "MDS")\[37\] | Technique is stated; principle [NOT IN SOURCE] | Page blocked; download |
| Smart animated blobs | Not found | [NOT IN SOURCE] | Not inspected |
| Lego design system | "The OG design system."\[38\] (creator MDS; "Licensed under CC BY 4.0")\[39\] | [NOT IN SOURCE] | Not inspected; download |
| Variants | Not found as a listing (a Dribbble shot titled "Figma Variants" exists)\[40\] | [NOT IN SOURCE] | Not inspected |
| "Avatar in motion" file + Loom video (linked from NL-ANIM) | "I put together a Figma file so you can see the actual layer setup"\[25\] | 8px layer blur; variants with Smart Animate at 1600ms; color burn/dodge filter; screen-blend mask\[25\] | Links seen, not opened |
| Figma 101 | "Free Figma fundamentals training in just one hour through 12 fast-paced video lessons."\[17\]\[41\] | Tool basics (see 1C) | Partial transcripts |
| UI Checklist + AI skill file | "101 proven checkpoints…";\[17\] "Plus a ready-made AI skill file for automated design audits in Claude Code or Cursor." Items per category: Getting Started 4, Typography 13, Layout 14, Color 15, Style 11, Imagery 16, Elements 15, Tactics 13\[42\]\[43\] | Pre-ship review | Email-gated. The skill file is your attachment (SK). 8 items are visible publicly |
| Accessibility Checklist | "Essential questions and resources to ensure your designs work for everyone."\[17\]\[43\] | See section 2 | Public web version (AXW) plus your attachment (AX) |
| Use Contrast | "Free Figma plugin and macOS app for checking color contrast compliance in real-time."\[17\]\[43\] | Contrast checking | Not inspected |
| IIDS | "A systematic canon … building on Swiss design principles for the digital age."\[17\]\[43\] | 16 principles\[1\] | Fully inspected |
| Lab | "Interactive experiments exploring interface design principles…"\[17\]\[43\] | [NOT IN SOURCE] | Not inspected |
| Newsletter | "Weekly design breakdowns and insights…";\[43\] "Join 44k+ Readers"\[17\]\[22\] | See the NL atoms | 3 issues fetched, 1 seen as a snippet |
| Expense Template | Email template for requesting reimbursement\[17\]\[43\] | Not design content | Not inspected |
| 3 free lessons | "Design Process; Implicit Grid; Lists vs. Cards"\[17\] | [NOT IN SOURCE] | Availability unconfirmed |
| 2024 workshop replays | "Design Process", "UI Design Principles", "Success Strategy"\[18\]\[19\] | [NOT IN SOURCE] | Not inspected |
| Color Shift iOS app | "Automatically extract color combos from dynamic Unsplash photos."\[7\] | This is the finished app built in the Claude Code course\[7\] | Not inspected |

---

## 4. Matt D. Smith profile

**Background:**
- "BFA in Graphic Design from the University of Georgia. Twenty years specializing in interface design across agencies, startups, and global brands." (MDS, Background)\[26\]\[44\]
- "Former adjunct professor and guest lecturer, with workshops delivered at Adobe MAX, Dribbble Hangtime, Figma's Config, Smashing Conference, and more." (MDS)\[44\]
- In the first person, on the older site: "I earned my BFA in Graphic Design from UGA in 2005 … served as an adjunct design professor, guest lectured at Harvard" (?amp=&amp=, "Hey"; snippet)\[3\]
- "Based in Athens, GA…" (MDS)\[44\]
- Current focus: "Building Shift Nudge into the modern design school for interface designers and AI-builders." (MDS, Now)\[44\]

**Products:**
- The Float Label pattern, "now adopted by Apple, Google, and countless companies" (MDS, Noteworthy).\[27\]\[44\]
- The Figma plugins Contrast and Flowkit (MDS, Noteworthy).\[27\]\[44\]
- FloatPrompt, "a text format that turns AI suggestions into AI specifications" (MDS, Noteworthy).\[26\]\[44\]
- The Color Shift iOS app (CC).\[7\]
- IIDS, "formalized in 2025 by MDS" (IIDS).\[1\]

**Companies he has designed for:**
- Named clients are [NOT IN SOURCE]. His pages say only "startups and global brands".
- The logos on the homepage (OpenAI, Anthropic, Figma, Google) show where learners work, not his clients.\[8\]
- Secondary: Brad Frost on /weekend says "I've had the pleasure of working with Matt on client work", with no client named.\[21\]

**Stated philosophy, in his own words:**
- "Typography. Layout. Color. In that order." (NL-TLC)\[24\]
- "make it painfully obvious" (NL-VLA)\[22\]
- "Fewer sizes make the design look consistent, which reads as intentional." (NL-VLA)\[22\]
- "There are always little things you can do with motion and interaction that give a little extra delight." (NL-ANIM ¶ 2)\[25\]
- "What gets built is exactly as good as the context you bring." (CC)\[7\]
- Unsigned company copy, not attributed to him: "Order comes before style." (IIDS 8)\[1\]

**Tools he says he uses:**
- Figma. "No sponsorship here, Figma did not pay me for this, it's just my personal opinion." (F101 Intro, snippet). "I learned to use Figma through trial and error…" (/figma, snippet)\[9\]\[12\]
- Smart Animate, layer blur and blend modes (NL-ANIM).\[25\]
- "Skill files MDS builds with"\[7\] (CC).\[7\]
- Named only in course titles, with how he uses them [NOT IN SOURCE]: GitHub, Vercel, Figma MCP, Agentation, DialKit, Ghostty, GSAP, React.\[7\]
- He points learners to Joey Banks' iOS files and usecontrast.com/guide (F101 Plugins).\[16\]
- Loom and Instagram for walkthroughs (NL-ANIM).\[25\]

**Talks and podcasts:** /mds lists 23 appearances. These include "Config 2024 Talk", Dive Club, Design Better, Badass Podcast ("facilitating learning over bestowing knowledge"), Way of Product #163, Design MBA and Dribbble Hangtime.\[44\] No transcripts were opened, so their content is [NOT IN SOURCE].

**Channels (MDS, Connect):** handle "mds" or "mdsbot" on Instagram, Dribbble, YouTube, X, Figma, GitHub, LinkedIn, Threads and TikTok.\[44\] None were inspected.

---

## 5. The wall

### 5A. Pricing and tiers (verified 2026-09-30)

| Item | Price / term | Source |
|---|---|---|
| PRO | "$1,997 a year": curriculum, critique vault, community\[26\] | WIS Investment (fetched) |
| VIP | "$4,997 a year": adds "the weekly live critique calls, their replays, and a private VIP space"\[26\] | WIS Investment (fetched) |
| Billing | "Membership is $1997/yr USD, billed annually."\[45\] | FAQ (snippet) |
| Guarantee | "Take 60 days. Do the work for one training option and post your progress as you go, then email us for a full refund"\[8\] | HOME FAQ (fetched) |
| Claude Code extra costs | "A Claude account, about $20 a month. Free GitHub and deploy accounts. And for the iOS chapter, a Mac."\[7\] | CC FAQ (fetched) |
| Claude Code on its own | "No." Sold only as part of the membership\[7\] | CC FAQ (fetched) |
| Portfolio Workshop | "$497 USD"; recordings "Lifetime"; sessions in February, year not stated\[20\] | PORT (snippet) |
| Legacy, not current | /upgrade: "Upgrade to Pro $997". Reviews quote old Core/Pro instalments: $199/$299 ×6 (Medium) and $249/$399 (supercharge.design)\[46\]\[47\]\[48\] | snippets |

**Inclusions (HOME, fetched):**
- PRO: "85+ Interface design training", "21+ Claude Code training", "1,000+ Critique vault", "12+ Figma training", "4 Portfolio Workshop", "∞ Shift Nudge AI", "Shift Nudge community", "Certificate of interface design".\[8\]
- VIP: "Weekly Coaching with MDS", "Live workshop replays", "A private VIP cohort space", "Everything in PRO".\[8\]

**Conflicts:**
- Live critique cadence:
  - WIS says "The weekly live critiques run on the VIP tier".\[26\]
  - FAQ (snippet) says members "attend regularly scheduled group live calls".\[27\]
  - /apply (snippet) lists "Bi-weekly live workshops with MDS for 12 months".\[49\]
- Weekly time: FAQ says "5 hours per week"; WIS says "5-7 hours/week".\[26\]\[27\]

### 5B. Paid and unseen: [NOT IN SOURCE]

| Item | What the site says | Status |
|---|---|---|
| Interface lesson bodies (85 stated / 88 listed) | Video + "design exercise"\[2\] | [NOT IN SOURCE] |
| Design exercises | "Each lesson includes a design exercise"\[2\] | [NOT IN SOURCE] |
| Critique vault | "1,000+ recorded critiques"\[26\] | [NOT IN SOURCE] |
| Claude Code lessons (20/21), Tools (9), BTS | Titles only; "24+ Hours of behind the scenes design build footage"\[7\] | [NOT IN SOURCE] |
| Repos | "2 Project repos, web and iOS"\[7\] | [NOT IN SOURCE] |
| MDS skill files | "Skill files MDS builds with" | [NOT IN SOURCE]. Whether your attached SK file is one of them is also [NOT IN SOURCE] |
| Shift Nudge AI | "in members-only Beta … a critique built on MDS's own method"\[8\] | [NOT IN SOURCE] |
| AI Advisor (/advisor) | An "Ask Advisor" button appears on public pages\[26\] | Page not fetched; what it does is [NOT IN SOURCE] |
| VIP coaching | "Weekly Coaching with MDS"; priority "goes to members who submit work and attend regularly"\[8\] | [NOT IN SOURCE] |
| Community | "designers from over 60 countries" (FAQ) | [NOT IN SOURCE] |
| Portfolio sessions 2–4; "Portfolio Review Archive" | Titles only | [NOT IN SOURCE] |
| Certificate | "Certificate of interface design" | Criteria [NOT IN SOURCE] |

### 5C. Behind the wall but partly visible

- All lesson titles and durations (1A–1B).
- The Claude Code Map/Decide/Structure summary and the six modes.
- Two promo video loops on the homepage and /claude (not inspected).
- The Color Shift app, and the interactive demo on /claude ("Try it. Cycle through the photos, drag the sliders, change the colors.").\[7\]
- One visible Claude Code prompt: "Read the spec in color-shift.md and the context files. Before you write anything, tell me what we're building."
- The three free lessons (listed only; availability unconfirmed).
- Part of the AI Portfolio Coach prompt on /portfolio (snippet): "You are a warm, direct portfolio coach guiding a designer through the MDS Method… Ask questions progressively, one phase at a time."
- Newsletter breakdowns of student work ("Every week I review dozens of student projects inside Shift Nudge").\[22\] How these relate to the critique vault is [NOT IN SOURCE].
- The UI checklist's category counts, plus 8 preview items.

---

## 6. Synthesizer's notes (judgment, not source)

**Where the free layer is thickest:**
- Review method (SK, NL-TLC, NL-VLA, UIW) and accessibility (AX/AXW).
- The typography rules on font-size count and the 16px floor. These are the only atoms confirmed by 3 distinct sources.
- SK and AX map most directly onto a critic rubric and an anti-patterns list. SK already has evidence rules and an output schema.

**Where it is thinnest:**
- Style: SK bullets only, with no first-person elaboration.
- Imagery: SK plus one animation essay.
- Elements beyond states and forms: titles only.
- Claude Code practice: marketing-level summaries only.
- Color beyond SK and the contrast numbers: nothing public on "Structural vs. Interactive", "First, Second, Third" or "White & Almost White".

**Which secondary sources quote him accurately:**
- I found no reviewer quoting MDS teaching a principle word for word, so I can't name two or three accurate secondary sources.
- Figmalion #90 has the only verbatim quote with a source (his auto-layout tweet). I did not open the original on X.
- Testimonials describe outcomes, not his words. For example, Akanksha Gupta: "how spacing alone can change how information is understood".\[26\]\[50\]
- The Medium and supercharge.design reviews are useful only for old pricing and course structure.

**Divergences between sources:**
- The 16px exception: SK allows one, AX does not.
- 85 vs 88 interface lessons.
- 20 / 21 / 21+ Claude Code lessons.
- Critique cadence: weekly VIP vs "regularly scheduled" vs bi-weekly.

**Unconfirmed links:** "Smart animated blobs" may relate to the NL-ANIM blur technique, and "Box model animations" to the lesson "The Box Model". No source connects either pair.

---

## 7. Convergence test report

| Test | Run | Result |
|---|---|---|
| Provenance | Yes | Pass. The UIW, FAQ, PORT, F101 and NL-CFG atoms rest on search snippets, and are flagged as such. |
| Paraphrase | Yes | Pass. R10, X1 and X3 are labeled paraphrase. X1 is your own summary and could not be checked against the original wording. |
| Gap | Yes | Pass. Lesson bodies, vault, AI, VIP, clients and talks are marked [NOT IN SOURCE]. 6 of the 11 Figma files were not found. |
| Fidelity | Yes (judgment) | Pass. Risk: unsigned copy (IIDS, WIS, CC FAQ) is attributed to "Shift Nudge", not to MDS. |
| Separation | Yes | Pass. The possible file-to-lesson links and the rubric-fit observations were moved to section 6. |
| Failures | n/a | Figma Community and figma.com/@mds blocked automated access, so two file creators are unconfirmed. The 101-item checklist and the Files list are email-gated. No talk transcripts were read. The enrichment pass was not completed because of size limits. |

---

## 8. Sources (all accessed 2026-09-30)

- shiftnudge.com, fetched in full: /, /curriculum, /claude, /what-is-shift-nudge, /resources, /figma/files (gated), /iids, /mds, /checklist (gated), /accessibility, /weekend, /archive/19068534, /archive/20963207, /archive/21338249
- shiftnudge.com, snippets only: /faq, /free, /figma, /figma/101/*, /schedules/8, /12, /36, /portfolio, /apply, /workshop, /upgrade, /?amp=&amp=, /archive/19400164
- figma.com/community/file (snippets):
  - 1196902716242027393 Box Model Animation
  - 862698328525703034 Lego Design System
  - 1116416621220625244 Opal Breakdown
  - 982793713624211211 Advanced Interactive Components
  - 1214041711245600726 Before&After smart animation
- dribbble.com/shots/18443128-Opal-Design-Breakdown (snippet)
- Figmalion, secondary: figmalion.com/topics/mds, figmalion.com/issue/238 (snippets)
- Secondary reviews, used for old pricing only: medium.com/design-bootcamp "My honest review of the Shift Nudge interface design course"; supercharge.design/blog/the-best-ui-design-courses-in-2024 (snippets)
- Your attachments: sn-ui-checklist SKILL.md; Accessibility Checklist (subscriber-only); Figma Files screenshot

## Sources

1. [IIDS - International Interface Design Style](https://shiftnudge.com/iids)
2. [Curriculum - Shift Nudge](https://shiftnudge.com/curriculum)
3. [Shift Nudge](https://shiftnudge.com/?amp=&amp=)
4. [Recommended 8-Week Schedule - Shift Nudge](https://shiftnudge.com/schedules/8)
5. [Slow & Steady 36-Week Schedule - Shift Nudge](https://shiftnudge.com/schedules/36)
6. [Beast Mode 12-Week Schedule - Shift Nudge](https://shiftnudge.com/schedules/12)
7. [Claude Code for Designers - Shift Nudge](https://www.shiftnudge.com/claude)
8. [Shift Nudge - Professional Interface Design Training](https://www.shiftnudge.com/)
9. [01\. Intro - Figma 101](https://shiftnudge.com/figma/101/intro)
10. [02\. Files - Figma 101](https://shiftnudge.com/figma/101/files)
11. [Shiftnudge](https://shiftnudge.com/figma/101/text)
12. [Figma 101 - Free Figma Course](https://shiftnudge.com/figma)
13. [06\. Images - Figma 101](https://shiftnudge.com/figma/101/images)
14. [08\. Auto layout - Figma 101](https://shiftnudge.com/figma/101/auto-layout)
15. [09\. Components - Figma 101](https://shiftnudge.com/figma/101/components)
16. [10\. Plugins - Figma 101](https://shiftnudge.com/figma/101/plugins)
17. [Shift Nudge](https://shiftnudge.com/free)
18. [Shift Nudge Workshop Replays](https://shiftnudge.com/workshop/replays?ck_subscriber_id=2739512040)
19. [Shift Nudge Workshop](https://shiftnudge.com/workshop)
20. [Shift Nudge - Professional interface design training](https://shiftnudge.com/portfolio)
21. [Shift Nudge](https://shiftnudge.com/weekend)
22. [The Visual Language Audit (and why most designers skip this critical step) - Shift Nudge](https://shiftnudge.com/archive/20963207)
23. [Interface Accessibility Checklist - Shift Nudge](https://shiftnudge.com/accessibility)
24. [Most designers skip this 3-letter UI check - Shift Nudge](https://shiftnudge.com/archive/19068534)
25. [Figma’s hidden animation technique - Shift Nudge](https://www.shiftnudge.com/archive/21338249)
26. [What is Shift Nudge?](https://www.shiftnudge.com/what-is-shift-nudge)
27. [FAQ - Shift Nudge](https://shiftnudge.com/faq)
28. [Shift Nudge - Professional interface design training](https://shiftnudge.com/archive/19400164)
29. [Figma Files - Shift Nudge](https://shiftnudge.com/figma/files)
30. [Before&After smart animation](https://www.figma.com/community/file/1214041711245600726/Before&After-smart-animation)
31. [Advanced Interactive Components](https://www.figma.com/community/file/982793713624211211/Advanced-Interactive-Components)
32. [Community: MDS](https://figmalion.com/topics/mds)
33. [Issue #238: Animating icons. Designer’s toolkit. Model designer.](https://figmalion.com/issue/238)
34. [Opal](https://dribbble.com/shots/18443128-Opal-Design-Breakdown)
35. [Opal Breakdown](https://www.figma.com/community/file/1116416621220625244/opal-breakdown)
36. [Quarantine for COVID-19](https://www.figma.com/community/file/825393131470032655/quarantine-for-covid-19)
37. [Box Model Animation](https://www.figma.com/community/file/1196902716242027393/box-model-animation)
38. [Lego Design System](https://www.figma.com/community/file/862698328525703034/Lego-Design-System)
39. [Lego Design System](https://www.figma.com/community/file/862698328525703034/lego-design-system)
40. [1\. Figma 101 – Learn Figma Fast 3d course education figma shift nudge tutorial](https://dribbble.com/mds)
41. [Resources - Shift Nudge](https://www.shiftnudge.com/resources)
42. [Interface Design Checklist - Shift Nudge](https://shiftnudge.com/checklist)
43. [Resources - Shift Nudge](https://shiftnudge.com/resources)
44. [Matt D. Smith - Founder of Shift Nudge](https://shiftnudge.com/mds)
45. [FAQ - Shift Nudge](https://shiftnudge.com/enrollment)
46. [My honest review of the Shift Nudge interface design course](https://medium.com/design-bootcamp/my-honest-review-of-the-shift-nudge-interface-design-course-770d15f0b4b0)
47. [Shift Nudge](https://shiftnudge.com/upgrade)
48. [The Best UI Design Courses in 2026](https://supercharge.design/blog/the-best-ui-design-courses-in-2024)
49. [Apply - Shift Nudge](https://shiftnudge.com/apply)
50. [Reviews - Shift Nudge](https://shiftnudge.com/reviews)
