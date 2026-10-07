# Dense Dashboards in Working Tools: Research Notes Q1-Q8, Rule Appendix and dashboard-01 Critique

The home screen of a working tool should be a queue or table of the items waiting on the user, with one row per item and a way to act on each row. A grid of KPI cards does not do this job. shadcn's dashboard-01 puts four KPI cards and a chart above its table, so for a working tool it opens on the wrong job.\[1\] Its table is the strongest part of the block and should be promoted to the home's primary region.\[2\]

## TL;DR

- **Job:** in a working tool, the home exists to resume, triage and act on work. The research found no study showing that card or metric homes serve working-tool users as well as queue, table or view homes. The disconfirming search turned up only one weak preference result, which does not loosen the canon. A-03 and A-09 stand, and one narrow [PROPOSED] amendment allows a count strip whose numbers link to rows.
- **Evidence strength:** the rules that can be Blocking rest on the canon or on primary sources checked this session. Those sources cover two things. Sensory feedback cuts mode errors (Sellen, Kurtenbach and Buxton 1992).\[3\] People stop attending to repeated warnings (Vance et al. 2018, MIS Quarterly).\[4\] Rules that lean on contested or essay-based laws are held at Consider. Those laws are Choice Overload, Miller 7±2, Zeigarnik, Tesler, Parkinson and Doherty's 400 ms.
- **dashboard-01, as seen live 2026-10-07:** the user's recollection is correct. Four KPI cards with trend badges, an interactive area chart, and a tabbed table with drag-to-reorder rows. The added recollection is partly confirmed: a "Customize Columns" menu and a chart range defaulting to "Last 3 months" were seen, but the row-detail drawer was not seen live.\[1\] Scored against the appendix, the block fails DASH-JOB-01, DASH-JOB-04 and DASH-STATE-01/02. It passes DASH-ATTN-04 if status is confirmed to use icon plus text.

---

## Conventions used in every note

- **Labels:**
  - verified = primary source seen this session, with the date seen.
  - secondary = someone else's report, named.
  - judgment = Envoy, Vesper or Sage's own call.
- **Sage's grades:** measured, replicated core, contested, collapsed, folk psychology.
- **Severity:** Blocking, Should-fix, Consider.
- **Dates:** live pages were read 2026-10-07. The notes carry the brief's date, 2026-10-06. Both dates are kept so the gap is visible.
- **Unverified sources:** any source listed as "not re-checked this session" is cited from the brief's recall. It carries no new flag and cannot be the only basis for a Blocking rule.
- **Example data:** every pass and fail example uses made-up data.

---

```yaml
title: "Q1 Job: what a working tool's home is for"
description: "Resume, triage, monitor or navigate; when a queue or table beats a card grid"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "designing or critiquing a home, admin home or dashboard in a working tool"
```

# Q1. Job. What is a working tool's home or dashboard for: resuming work, triage, monitoring or navigation? When should it be a queue or table rather than a grid of cards and metrics (canon A-03, A-09)?

## Answer

A working tool's home is for resuming and triaging work. Monitoring comes second, and navigation is the sidebar's job, not the home's. The dashboard literature treats "dashboard" as a family, not a single form:
- Sarikaya et al. (IEEE TVCG, 2019) group their examples into seven clusters. Some support decisions and some support awareness. Their coding scheme separates strategic, tactical, operational and learning purposes.\[5\]\[6\]
- Bach et al. (IEEE TVCG, 2023) review 144 dashboards. They describe eight pattern groups and genres such as narrative, analytical and embedded.\[7\]

Neither paper shows that the reporting form, big numbers in tiled charts, suits operational work. Makers of working tools build the home around an inbox. Linear's Triage is "a special inbox for your team" with its own shortcut (G then T). Its job is to review, update and prioritise issues before they enter the workflow.\[8\]

The rule: the primary region of the home is a queue or table of items the user can act on. Any number shown is a link to the rows that make it, with its source and period stated (A-09's alternative). A card or metric grid is acceptable only on a reporting surface that is reached from the home, not on the home itself.

The disconfirming evidence was searched for, and no comparison of card homes against queue homes for working-tool users was found. One weak result exists. A Springer chapter on technology-roadmap prototypes reports that users favoured a flat "Dashboard" design over a nested drill-down for its simplicity. It had seven stakeholders, compared against drill-down rather than a queue, and was not a working tool.\[9\] It supports only the narrow [PROPOSED] amendment E-1 below.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| The paper surveys business literature and collects examples to identify "clusters of dashboard designs with similar analysis goals, audiences, and decision support". The genre is plural. | Sarikaya, Correll, Bartram, Tory & Fisher, "What Do We Talk About When We Talk About Dashboards?", IEEE TVCG 2019, pp. 682-692, doi:10.1109/TVCG.2018.2864903. Author page seen 2026-10-07 | verified | Sage: descriptive taxonomy, not an effect study, so no effect size. Clusters 1 and 5 target decision-making and clusters 3 and 4 target awareness. |
| The coding dimensions include Strategic, Tactical, Operational and Learning, plus audience and visualisation literacy. | Sarikaya et al. InfoVis 2018 talk slides (author site), seen 2026-10-07 | verified | Supports the split between operational and reporting dashboards. Volume number conflict: see F-2. |
| The review covers 144 dashboards, finds eight groups of design patterns, discusses genres (narrative, analytical, embedded) and ran a two-week workshop with 23 participants. | Bach, Freeman, Abdul-Rahman, Turkay, Khan, Fan & Chen, "Dashboard Design Patterns", IEEE TVCG 29(1):342-352, 2023, doi:10.1109/TVCG.2022.3209448. arXiv 2205.00757v2 seen 2026-10-07 | verified | Sage: design-pattern review; it does not test performance. No pattern in it favours KPI tiles for operational work. Claims about specific pattern names were not captured. |
| Triage is a team inbox for issues from integrations or from people outside the team. You review, update and prioritise before the workflow. Navigate with G then T. | Linear Docs, "Triage", seen 2026-10-07 | verified (vendor primary for behaviour) | Maker evidence that the home of work is an inbox or queue. Triage responsibility (a rotating owner) was announced by Linear in October 2023 (secondary, Linear's own social post). |
| Monitoring dashboards are about "learning about new data in real time". | Danyel Fisher, blog post "Visualization Genres: Monitoring and Dashboards", 2024-09-18 | secondary (co-author's essay) | Supports monitoring as a separate job from triage. |
| Users favoured a flat dashboard over a nested drill-down for simplicity. | "Designing Interactive Technology Roadmaps: A Visual Analytics Approach", Springer chapter (abstract seen 2026-10-07) | secondary-weight primary (abstract only) | The only disconfirming signal found. Seven stakeholders, a non-working-tool domain, and drill-down rather than queue as the comparator. Sage: measured preference, tiny sample, not replicated. |
| Card grids can raise perceived usability without raising usability. | Aesthetic-Usability, reference layer flags V (Kurosu & Kashimura 1995), R (Tractinsky 2000), O | judgment on flagged law | This explains why card homes are liked in demos. It does not show they work. |

## Not found

- Any controlled or field study comparing card or metric homes with queue, table or view homes for working-tool users.
- Linear's own text on what "Inbox" (as distinct from Triage) is for, and the Linear Method's text on the home. Neither was retrieved this session.
- GitHub's writing on its dashboard or home feed purpose. Not retrieved.
- Few and Tufte passages that carry over to working tools. Not retrieved, so not cited.

## Promote to library

Yes. This note fixes the job definition that every other DASH file depends on. The verified primary sources are the dashboard-genre papers and Linear's Triage docs.

---

```yaml
title: "Q2 Density: when it helps, when it hurts, what settings achieve"
description: "Calm density, comfortable/compact settings, progressive disclosure, load by analogy"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "setting row height, density options or disclosure on a records table or home"
```

# Q2. Density. When does density help and when does it hurt? What makes a dense screen calm? What do density settings (comfortable/compact) and progressive disclosure actually achieve? Intrinsic versus extraneous load.

## Answer

Density helps when the user compares many items along the same attributes, which is the core activity in triage, CRMs and admin tables. It hurts when it does one of three things:
- truncates the field that identifies the row;
- nests containers so that borders outnumber data (A-10, C-P04);
- puts more distinct regions on the screen than the job needs (C-P12).

A dense screen reads as calm when four things hold:
- one focal point (C-P02);
- group spacing larger than in-group spacing (C-P04);
- numbers that align (C-P10);
- nothing that moves for style (A-14).

Design systems treat density as a user preference, not a designer verdict:
- Salesforce SLDS 2 offers "comfy" (the default) and "compact" as a per-user setting, and says interfaces must work in both.\[10\]
- IBM Carbon's data table has five row sizes from extra small to extra large, with medium as the default.\[11\] It says tables should be given space "to display data without truncation".\[12\]

So density settings achieve user control over rows per screen, not better comprehension in themselves. Progressive disclosure moves secondary fields to the detail panel. It does not move them to hover-only tooltips, which hide state.

"Intrinsic versus extraneous load" is a useful analogy at most. Cognitive load theory comes from instructional design (Sweller 1988, flag R), and its transfer to UI is by analogy only. It may justify removing chrome that carries no data. It cannot set a row count.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| SLDS 2 offers two density settings, comfy and compact. Comfy is the default. Density is a user preference, and interfaces must work in both. | Salesforce Lightning Design System 2, "Display Density", seen 2026-10-07 | verified | Vendor primary. The "up to 30% more information" figure for compact appears only in third-party help pages (CWRU, Marks Group), so it is secondary. |
| Carbon data table: five header and row sizes, xs, sm, md, lg and xl. Medium is the default. Place tables with "plenty of space to display data without truncation". | IBM Carbon, Data table usage and guidelines, seen 2026-10-07 | verified | The pixel values are excluded, because the user's tokens own them. |
| Cloudscape: comfortable is the default and compact is for "data intensive views". Users can always switch. Compact "can hinder readability". | Cloudscape "Content density", read via a third-party docs mirror (glama.ai), seen 2026-10-07 | secondary | A mirror, not the vendor site. Treat as secondary until checked on cloudscape.design. |
| Salesforce form density moves labels inline in compact. Admins set the org default and cannot override a user's choice. | Salesforce Developers, "Changing the Display Density", seen 2026-10-07 | verified | Shows that density changes layout as well as spacing. |
| Cognitive load theory comes from instructional design (Sweller 1988, Cognitive Science 12(2):257-285). | Reference-layer flag R. Not re-checked this session | flag as given (R) | Sage: replicated core in instruction, folk psychology when applied to screens by analogy. It cannot carry a numeric rule. |
| Chunking (Miller 1956) and Miller's Law, 7±2. | Reference-layer flags: Chunking R; Miller's Law R, O | flag as given | Sage: folk psychology as a count limit. Cowan 2001 suggests about 4 chunks. It is not used for any row or column count. |

## Not found

- Any controlled study comparing task time or error rate between comfortable and compact table density in working tools.
- NN/g's articles on content density and data tables. Not retrieved this session.
- Atlassian, GitLab Pajamas and Material Design 3 density guidance. Not retrieved.
- Sweller, van Merriënboer & Paas 1998. Not re-checked.

## Promote to library

Yes, but only the density-as-preference and no-truncation-of-identity findings, which have vendor primary sources. The cognitive-load framing stays a caveat.

---

```yaml
title: "Q3 Views: table, board, calendar, timeline; saved views; context; list-detail"
description: "View types, saved/personal/shared views, filter-sort-group, context on switch"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "adding view types, saved views, filters, or a detail panel to a records table"
```

# Q3. Views. Table, board, calendar and timeline views. Saved, personal and shared views; filter, sort and group. Keeping context when switching views. List-and-detail versus side panel versus full page.

## Answer

A view is a saved query plus a layout. Offer a board, calendar or timeline only when the records have a field that layout encodes: a status for a board, a date for a calendar, a start and end for a timeline. This follows C-P03, "structure says something true".

Saved views should be named, visible as tabs or a list, and tied to the actual filter and sort state. Shopify Polaris' index filters work this way: each tab is a saved view built from a sort, filter or query, and editing a view's filters lets the user save it as new.\[13\] Personal and shared views must be visibly distinct, so that editing a shared view never silently changes a teammate's screen.

Context must survive a round trip. Opening a record and coming back should restore the filters, sort, scroll position and selection. During triage, open records in a side panel or list-and-detail layout so the queue stays visible, with the open row selected (C-P07). Use a full page for deep editing, not for triage.

Manual drag-to-reorder is a view mode in its own right. It is honest only when the active sort is "manual". When a column sort is on, drag handles say something false.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Index filters: tabs are saved views, each a subset that has been sorted, filtered or queried and saved with a name. Editing filters of an existing view can save it as a new view. There is a toggle between "View" mode and "Filter" mode. | Shopify Polaris "Index filters", read via the ownego Polaris Vue port, seen 2026-10-07 | secondary | A port that reproduces the Polaris docs. Check on polaris.shopify.com before promoting. Note that Polaris itself calls filter editing a "mode". |
| Index tables should support sorting and filtering for long lists, should navigate to a detail page on click, and bulk actions follow verb + noun. | Shopify Polaris "Index table", via the ownego port, seen 2026-10-07 | secondary | Same caveat. |
| Users asked Polaris to keep table headers visible during bulk selection, because they reference the headers while scanning. | Shopify polaris-react-archive issue #10756, 2023-09-28 | secondary (user report) | Context-keeping evidence from practitioners, not a study. |
| Data tables should not be placed inside data tables or small containers. | IBM Carbon Data table usage, seen 2026-10-07 | verified | Supports side panel rather than nested table for detail. |
| Linear's Triage view has a dedicated shortcut and lives under the team in the sidebar. | Linear Docs "Triage", seen 2026-10-07 | verified | Supports the view as a first-class destination. |

## Not found

- Linear's views docs, GitHub Projects views docs, and Notion and Airtable database-view docs. Not retrieved this session, so there are no claims about their current behaviour.
- Any controlled study comparing side panel, list-and-detail and full page for triage throughput.
- NN/g's guidance on list-detail and data tables. Not retrieved.

## Promote to library

Yes, as rules DASH-VIEW-01 to 05. The saved-view evidence is secondary and should be re-checked on Polaris' own site before the file leaves draft.

---

```yaml
title: "Q4 Modes: novice/expert, read/edit, focus; mode errors; quasimodes"
description: "When a mode is right, when it is a trap, how to show the current mode"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "adding edit mode, bulk-select mode, filter mode, focus mode or an expert mode"
```

# Q4. Modes. Novice versus expert, read versus edit, focus modes. Mode errors, and how to make the current mode visible. When a mode is the right tool and when it is a trap. Include quasimodes (held or spring-loaded modes) as the middle ground.

## Answer

A mode is the right tool when one input must mean different things and the states last long enough to be worth naming. Examples are bulk-select, where a click selects instead of opening, and edit, where keystrokes change data. A mode is a trap when its state is shown only by the system and lives away from where the user is looking.

The strongest primary evidence found is Sellen, Kurtenbach and Buxton (1992). In a text-editing task, both visual and kinesthetic feedback reduced mode errors. User-maintained feedback, such as holding a foot pedal, was more effective than system-maintained visual feedback, which users can avoid looking at.\[3\] Two practical consequences follow:
- Every latched mode shows a persistent indicator at the point of action, such as a selection bar with a count, or an edit border on the cell.
- Short operations should be quasimodes (held keys) or one-shot commands rather than latched modes.

"Novice versus expert" should not be a mode. The ACM Computing Surveys review of novice-to-expert transitions (Cockburn, Gutwin, Scarr and Malacria, ACM Computing Surveys 47(2), published 12 November 2014) reports that many expert interface components are seldom used. It finds that users persistently fail to adopt faster methods. So accelerators belong on the same surface, shown beside menu items and in the command palette. An "advanced mode" that hides features fails novices and experts alike.

Inline-editable cells are a hidden mode. When an input looks like text at rest, as in dashboard-01's Target and Limit cells, read and edit are not visibly distinct (C-P07).

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Visual and kinesthetic feedback both reduced mode errors. User-maintained feedback prevents mode errors more effectively than system-maintained feedback. | Sellen, Kurtenbach & Buxton, "The Prevention of Mode Errors Through Sensory Feedback", Human-Computer Interaction 7(2):141-164, 1992. Author PDF (Microsoft Research) and Toronto IRG abstract seen 2026-10-07 | verified | Sage: measured, two experiments on a text-editing task. Effect sizes not captured. Generalising from a foot pedal to held keys is an inference. |
| For experts using the foot pedal, visual feedback was redundant. | Toronto Input Research Group abstract, seen 2026-10-07 | verified | Supports quasimodes as the middle ground. |
| Research shows "many expert interface components are seldom used" and that users persistently fail to adopt faster methods. | Cockburn, Gutwin, Scarr & Malacria, "Supporting Novice to Expert Transitions in User Interfaces", ACM Computing Surveys 2014, doi:10.1145/2659796. Abstract seen 2026-10-07 | verified | Sage: replicated core (a survey of many studies). |
| Norman 1981 on action slips and mode errors. Raskin, The Humane Interface (2000), on quasimodes. | Brief's recall. Not re-checked this session | not verified | Used for vocabulary only. No rule rests on them alone. |
| Polaris names its filter-editing state a "Filter" mode, entered by a toggle button. | Polaris Index filters via the ownego port, seen 2026-10-07 | secondary | An example of a well-signalled latched mode. |

## Not found

- Raskin's text on quasimodes and Norman 1981's taxonomy. Not retrieved.
- Any study of mode errors in inline-editable data tables specifically.
- Vendor docs on "focus mode" in Linear or Superhuman. Not retrieved.

## Promote to library

Yes. Sellen et al. is a verified primary source and carries DASH-MODE-01 at Blocking.

---

```yaml
title: "Q5 Workflows: keyboard loops, palettes, bulk actions, confirm vs undo, resumption"
description: "Shortcut adoption, selection scope, habituation to confirmations, interruption recovery"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "designing row actions, bulk actions, destructive actions, shortcuts or return-to-work"
```

# Q5. Workflows. Keyboard-first loops, command palettes, bulk actions and selection. Confirm versus undo, framed explicitly around habituation to confirmation dialogs and warnings. Interruptions, and returning to where you left off. Route resumption to the Ovsiankina finding, not Zeigarnik.

## Answer

**Keyboard.** People do not move to the keyboard just because shortcuts exist. Lane, Napier, Peres and Sandor (2005) titled their paper "Failure to Make the Transition", and Cockburn et al. (2014) found the same tendency across studies.\[14\]\[15\] Shortcuts must therefore be shown where the pointer user already looks: beside each row-menu item, and in a command palette that lists the same commands with the same keys. Keyboard row navigation must not animate (A-15, C-P11).

**Bulk actions.** Bulk actions need an explicit selection count and an explicit scope: "12 selected on this page" against "Select all 68". A Polaris issue (#11786, 2024) reports that the paginated "select all" selected every row rather than the current page. That shows how easily scope gets ambiguous.

**Confirm versus undo.** This is a habituation question. Vance et al. (MIS Quarterly, 2018) measured habituation to security warnings with fMRI and eye tracking over a five-day workweek. Their field experiment followed 140 Android users who saw 7,248 warnings over three weeks (MIS Quarterly 42(2):355-380). Adherence fell much more slowly, and stayed high, among users who saw polymorphic warnings whose appearance changed. Temple University's Fox School reported in January 2020 (secondary) that nearly 80 percent of the polymorphic group still adhered, against 55 percent of those shown static warnings. A routine confirmation dialog is a warning shown hundreds of times, so it becomes something the user clicks through without reading. The canon's C-P09 pattern follows: "Delete 3 records", then a toast "3 records deleted" with Undo. Confirmation is reserved for actions that truly cannot be undone, and it names its object and count.

**Resumption.** Use the Ovsiankina effect. Ghibellini and Meier's 2025 meta-analysis found "a general tendency to resume tasks" and no memory advantage for unfinished tasks.\[16\] The design move is to give the opportunity to resume, not to rely on the user remembering. Restore the last record, view, scroll position and unsaved draft, and mark the draft as unfinished. Mark, Gudith and Klocke (2008) found that interrupted people worked faster at the cost of more stress, frustration, time pressure and effort.\[17\] So recovery support lowers cost even when speed looks unharmed.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Habituation to security warnings develops over a five-day workweek (fMRI and eye tracking). In the field, adherence "substantially decreased over the three weeks". Polymorphic design reduced habituation. | Vance, Jenkins, Anderson, Bjornn & Kirwan, "Tuning Out Security Warnings...", MIS Quarterly 42(2):355-380, 2018. BYU ScholarsArchive abstract seen 2026-10-07 | verified | Sage: measured, with several studies from one lab group (BYU). Transfer from security warnings to confirmation dialogs is an inference, but a close one. |
| A polymorphic warning was more resistant to habituation, with n=25 in fMRI and n=80 in mouse-cursor tracking on personal computers. | Anderson, Vance, Kirwan, Jenkins & Eargle, "From Warning to Wallpaper", 2016. BYU abstract seen 2026-10-07 | verified | The canon prefers undo over varying the dialog. Polymorphism is noted, not recommended. |
| Ovsiankina effect is a general tendency; the Zeigarnik effect "lacks universal validity". There is no memory advantage for unfinished tasks. | Ghibellini & Meier, Humanities and Social Sciences Communications 12, article 962, published 2025-07-01, doi:10.1057/s41599-025-05000-w. Nature.com abstract seen 2026-10-07 | verified | Sage: Zeigarnik recall advantage collapsed; Ovsiankina replicated core. The reference layer's d_z = 0.15 was not re-checked. Secondary reports (Glasp article) give a recall ratio of 0.99 across 37 studies and a resumption rate of 66.79% against a 50% baseline. |
| Interrupted participants completed tasks faster with no quality difference, but reported more stress, frustration, time pressure and effort. | Mark, Gudith & Klocke, "The cost of interrupted work: more speed and stress", CHI 2008, pp. 107-110, doi:10.1145/1357054.1357072. Semantic Scholar abstract seen 2026-10-07 | verified | Sage: measured. The primary CHI 2008 paper reports 48 subjects interrupted every two minutes. Mean task time was 22.77 min at baseline, against 20.31 min (same-context interruptions) and 20.60 min (different-context), with no quality difference. The widely repeated "23 minutes 15 seconds" recovery figure is attributed to this paper by a blog but was not found in the abstract (see F-4). |
| Lane et al. (2005) report a failure to transition from menus and toolbars to keyboard shortcuts. | International Journal of Human-Computer Interaction 18(2):133-144. Citation confirmed via ACM reference lists, seen 2026-10-07 | verified (citation), secondary (findings) | The "<10% shortcut use" figure comes from a secondary summary (DEV Community) and is not used in any rule. |
| Iqbal & Horvitz 2007 on disruption and recovery of computing tasks. | CHI 2007, pp. 677-686, doi:10.1145/1240624.1240730. Citation seen in an arXiv reference list, 2026-10-07 | verified (citation only) | Findings were not read this session. |
| Altmann & Trafton 2002 (memory for goals), Grossman et al. 2007 (hotkey learning), Bravo-Lillo et al. (warnings). | Brief's recall. Not re-checked | not verified | No rule rests on them alone. |

## Not found

- Superhuman's own keyboard-first writing and Raycast's command palette docs. Not retrieved.
- Bravo-Lillo et al. papers. Not retrieved.
- A study of undo versus confirm in data tables specifically.
- The Altmann & Trafton 2002 text.

## Promote to library

Yes. Habituation (verified), Ovsiankina (verified) and the canon's C-P09 together give the strongest-evidenced rules in this report.

---

```yaml
title: "Q6 Attention and change: standout item, change markers, live vs stale, status"
description: "Pop-out vs recall, change blindness, refresh pace, status by more than color"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "showing priority, changed rows, live updates, freshness or status"
```

# Q6. Attention and change. One standout item: split perception (visual search, pop-out) from memory (Von Restorff). Change markers and change blindness. Live versus stale data, and refresh pace. Status shown by more than color. Point to WCAG 1.4.1 only.

## Answer

**One standout item.** Ground the salience rule in perception, not memory. Visual search research holds that an item differing from its neighbours in a single feature is found fast, and that this advantage shrinks as more items differ. This is Treisman and Gelade 1980 and Wolfe's guided search; both are recalled, not re-checked this session. The design rule is C-P02: at most one standout per view, made by quieting its neighbours, and given to the item that needs action. The Von Restorff effect (1933, flag V) is about recall of an isolated item afterwards. It is the weaker basis and is not used to justify salience.

**Changes.** Change blindness research (Rensink, O'Regan & Clark 1997, recalled) shows that changes made during a disruption or flicker are easily missed. A transient flash is therefore both canon-banned (A-14) and unreliable. Mark changed rows with a persistent static marker that stays until the row is viewed.

**Live data.** Live data must not reorder rows under the pointer. Hold inserts behind a "3 new, show" control while the user is interacting.

**Freshness.** Any data that refreshes shows an "Updated 09:42" time. Data older than its refresh interval should be marked as stale. The canon does not list "stale" as a state, so [PROPOSED] amendment E-2 adds it. The Should-fix rule DASH-ATTN-05 stands on its own reasoning, not on E-2.

**Status.** Status always carries text, an icon or a shape as well as color (C-P05). WCAG 1.4.1 applies here.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Von Restorff 1933, doi:10.1007/BF02409636: isolation improves recall. | Reference-layer flag V. Not re-checked this session | flag as given (V) | Sage: replicated core, but it is a memory effect. It is the weaker basis for a perception rule. |
| Pop-out in visual search (Treisman & Gelade 1980; Wolfe, guided search). | Brief's recall. Not re-checked | not verified | Sage would grade it replicated core if verified. It is held as support for C-P02, not as the base of a Blocking rule. |
| Change blindness (Rensink, O'Regan & Clark 1997). | Brief's recall. Not re-checked | not verified | DASH-ATTN-02 rests on canon A-14, not on this paper. |
| Repeated identical alerts habituate. | Vance et al. 2018, seen 2026-10-07 | verified | Supports keeping change markers static and few. Flashing everything trains users to ignore flashes. |
| Response-time limits: 0.1 s feels instantaneous, 1 s keeps flow of thought, 10 s keeps attention. Unchanged since 1993. | Nielsen, "Response Times: The 3 Important Limits" (excerpt from Usability Engineering, 1993), NN/g, seen 2026-10-07 | secondary (practitioner) | Basis for refresh feedback and the A-20 ruling (F-1). |
| Status must not rely on color alone. | Canon C-P05. WCAG 1.4.1 applies | canon | WCAG detail is owned by the other thread. |

## Not found

- Any study of refresh rate against task performance in ops consoles.
- Primary texts of Treisman & Gelade, Wolfe and Rensink et al. Not retrieved.
- NN/g on change indicators. Not retrieved.

## Promote to library

Yes. The perception-versus-memory split and the persistent-marker rule should go into the reference layer. The router should drop the not-yet-written von-restorff file from the Dashboard row (section D).

---

```yaml
title: "Q7 Customization: widgets, layouts, who carries complexity"
description: "Tesler, defaults, paradox of the active user, whether people customize"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "adding configurable widgets, column choosers, layout editors or adaptive ordering"
```

# Q7. Customization. Configurable widgets and layouts. Who carries the complexity: Tesler, defaults, the paradox of the active user, and evidence on whether people actually customize.

## Answer

Most people do not customize, so the default is the product. Banovic et al. (CHI 2012) summarise Mackay's 1991 CHI study as showing that most users do not customize, and that what triggers customization lies largely outside the software.\[18\] The paradox of the active user (Carroll & Rosson 1987, flag R) points the same way: people want to get on with the task, not set up the tool.

Adaptive systems that rearrange themselves are not the answer either. Findlater and McGrenere (CHI 2004) found static split menus significantly faster than adaptive ones. Adaptable menus, which the user rearranges, were faster than adaptive ones under some conditions, and most users preferred the adaptable kind.

The rules that follow:
- Defaults must serve the main job on day one. An example is the queue filtered to "assigned to me, needs review".
- The tool never reorders menus, widgets or columns on its own.
- Customization lives in saved views (columns, density, filters), with a visible personal/shared distinction and a reset. It does not live in drag-and-drop widget grids.

Tesler's "conservation of complexity" (flag E) can frame the defaults decision, but it cannot carry a rule alone.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Static menu significantly faster than adaptive. Adaptable faster than adaptive under certain conditions. Most users preferred the adaptable menu. | Findlater & McGrenere, "A comparison of static, adaptive, and adaptable menus", CHI 2004, pp. 89-96, doi:10.1145/985692.985704. Abstract seen 2026-10-07 | verified | Sage: measured, a single study on menus. A later paraphrase in another paper conflicts with this (F-5). The abstract governs. |
| Mackay showed that most users do not customize. Novice users mostly did not customize a purely adaptable system. | Banovic, Chevalier, Grossman & Fitzmaurice, "Triggering triggers and burying barriers to customizing software", CHI 2012, summarising Mackay, CHI 1991, pp. 153-160 | secondary (Banovic et al. on Mackay) | Mackay's own text was not read this session. |
| Raising exposure to and awareness of customization features, and adding social influence, significantly affected customization behaviour. | Banovic et al., CHI 2012, abstract seen 2026-10-07 | verified | Customization is driven by exposure, not just by availability. |
| In a role-based IDE, developers preferred fine-grained capabilities to coarse roles. Most left default roles. | Findlater et al., CHI 2008 note, "Evaluation of a role-based approach for customizing a complex development environment" (14 developers), seen 2026-10-07 | verified | Sage: measured, interview study. Supports defaults carrying the load. |
| Tesler's Law. | Reference-layer flag E (interview in Saffer; Tognazzini counterpoint) | flag as given (E) | Consider-only. |
| Paradox of the Active User. | Reference-layer flag R (Carroll & Rosson 1987) | flag as given (R) | Sage: measured (observational). Not re-checked. |

## Not found

- Mackay 1991's own figures on how many users customized.
- Any study of drag-and-drop dashboard widget customization uptake in working tools.
- Airtable and Notion docs on personal against shared views. Not retrieved.

## Promote to library

Yes. The Findlater result is verified and directly blocks adaptive reordering. The Mackay finding should stay labelled secondary until the original is read.

---

```yaml
title: "Q8 States: empty, loading, partial, stale, error, offline"
description: "Every reachable state of home and records table, against canon C-P08"
layer: research
status: draft
thread: dense-dashboards
role: Envoy
date: 2026-10-06
last_reviewed: 2026-10-07
supersedes: none
load_when: "any surface that fetches data: admin home, records table, record detail"
```

# Q8. States: empty, loading, partial, stale, error and offline (canon C-P08).

## Answer

Every region that fetches data needs a designed state for each of these cases. Each state also has to tell the user what to do next.

| State | What the region shows |
|---|---|
| Empty, no records yet | Says what will be here, offers the first action, and hides filters and bulk controls (C-P08). |
| Empty, filters match nothing | Says so and offers "Clear filters", because the remedy differs from the first case. |
| Loading | A skeleton of the final layout, with no shimmer on table skeletons (A-14, A-18). |
| Partial | "2 of 3 sources loaded", with a retry on the failed region. |
| Error | Shown in place at region level, keeping the last good data and marking it. |
| Offline | A persistent indicator. Actions are disabled with a reason, or queued and labelled as queued. |
| Stale | Data past its refresh interval, marked with its age. |

"Stale" is not in the canon's state list. That gap is real for working tools, so [PROPOSED] amendment E-2 adds it. No rule is based on E-2. DASH-ATTN-05 covers freshness on its own evidence and is held at Should-fix.

As seen 2026-10-07, dashboard-01 ships no loading state, and its empty state (from source recall) is the bare string "No results." under a full toolbar. That is the canon's own counter-example.

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| The canon's state list is empty, loading, error, partial, offline and success. "Stale" is absent. | User canon C-P08 (brief) | canon | Basis for E-2. |
| dashboard-01: no loading or skeleton state. Empty text "No results.". | Research subagent reading the live preview 2026-10-07 and recalling the source | secondary ([U]: not confirmed in source) | Check against data-table.tsx before scoring as fact (G-3). |
| 10 s is the attention limit. Above 1 s users notice a delay. Give continuous feedback when the delay is long. | NN/g, Nielsen 1993, seen 2026-10-07 | secondary | Supports showing real stages (A-20) and stale age. |
| Repeated identical alerts habituate. | Vance et al. 2018 | verified | Error and offline banners should be persistent and singular, not repeated toasts. |

## Not found

- GOV.UK Design System and Atlassian guidance on empty and error states. Not retrieved this session.
- Any study of stale-data indicators and decision quality.

## Promote to library

Yes. States are the most checkable area, and the canon already supplies most of the floor.

---

## A. Law ledger

| Law | Grade (flag as given; re-checked where possible; never raised) | Scope | How it applies to working-tool dashboards | Where the popular version goes too far |
|---|---|---|---|---|
| Hick's Law | R, O. Not re-checked | Choice time among known, learned options | Command palette and row menu for experts choosing a familiar command. Supports stable menu order (with Findlater 2004). | Applied to scanning unfamiliar lists, which is linear search, and turned into "fewer options always". |
| Fitts's Law | R. Not re-checked | Pointer and touch target acquisition | Row-action and bulk-bar targets for mouse users. | Applied to the keyboard, where it does not apply. |
| Cognitive Load | R (Sweller 1988; the site cites a mismatched title). Not re-checked | Instructional design; UI by analogy only | Removing chrome that carries no data (C-P12). Cannot set counts. | Treated as a measured UI law with thresholds. |
| Chunking | R (Miller 1956) | Memory span of grouped items | Grouping columns and fields; group spacing (C-P04). | Used to set numeric limits. |
| Miller's Law | R, O | As above | Not used for any count. | "7±2 items max" was never a count limit; Cowan 2001 argues about 4 chunks. |
| Choice Overload | R, C. Re-checked 2026-10-07: Scheibehenne et al. 2010 abstract seen, mean effect "virtually zero" across 63 conditions and 50 experiments (N = 5,036), C confirmed | Consumer assortment choice | Consider-only. Cannot justify hiding views or filters. | "More options always paralyse". Moderators matter. Chernev, Böckenholt and Goodman make that case in their commentary in the same October 2010 issue of the Journal of Consumer Research. The Scheibehenne et al. abstract itself says no sufficient conditions for choice overload could be identified. (Their 2015 meta-analysis was not retrieved.) |
| Doherty Threshold | partially V, O. 400 ms not found in the source | System response time | Acknowledge input fast. Ruled against NN/g limits (F-1). | The 400 ms figure is quoted as a finding. |
| Zeigarnik | R, C. Re-checked 2026-10-07: Ghibellini & Meier abstract seen, conclusion confirmed | Memory for interrupted tasks | Not used. Resumption goes to Ovsiankina. | "Unfinished tasks are remembered better". The meta-analysis found no memory advantage. |
| Ovsiankina (not in reference layer) | New entry. Abstract and conclusion seen live 2026-10-07 (Ghibellini & Meier 2025) | Tendency to resume interrupted tasks when given the chance | Restore last record, view and draft; offer "Resume". | Sometimes conflated with Zeigarnik. It concerns resumption, not memory. |
| Von Restorff | V (1933). Not re-checked this session | Recall of an isolated item | Not the basis for salience rules; perception research is. | Used as a perception or salience law. |
| Aesthetic-Usability | V (Kurosu & Kashimura 1995), R (Tractinsky 2000), O | Perceived usability | Explains why card homes demo well (Q1). | "Pretty is more usable". The source measured perception. |
| Paradox of the Active User | R (Carroll & Rosson 1987) | Learning behaviour of users who want to get on with the task | Defaults carry the job. Accelerators must be shown in place. | Retold as "users never read". |
| Tesler's Law | E | Interview claim about where complexity lives | Consider-only framing for defaults. | Treated as a law. |
| Parkinson's Law | E, O | Humorous 1955 essay | Not used. No artificial deadlines or countdowns (A-19). | Quoted as evidence for time pressure in UI. |
| Jakob's Law | E, NF | Coinage | Not used to carry any rule. Convention arguments rest on vendor docs instead. | Treated as a study. |

## B. Rule appendix

Each file follows the draft law-file format. The budget line is copied as given. Files with six rules may run past 500 tokens; Vesper recommends splitting those when the reference pass compiles them.

```markdown
---
name: dash-job
family: dashboard
laws: [cognitive-load, chunking]
load_when: "designing or critiquing a working-tool home or admin home"
budget: "<= 40 lines, <= 500 tokens"
source: "canon A-03, A-09, C-P03; Sarikaya et al. 2019; Bach et al. 2023; Linear Triage docs (seen 2026-10-07); Ghibellini & Meier 2025"
---
Provenance: verified primary (dashboard papers, Linear docs, Ghibellini & Meier) plus canon.
Caveat: no study compares card homes with queue homes; Q1 rules rest on canon and job analysis.
## Rules
- DASH-JOB-01 [DIRECT canon A-03, A-09] Home's primary region is a queue or table of actionable items, not a metric/card grid. load_when: home layout.
- DASH-JOB-02 [INFERRED Linear Triage docs; Sarikaya operational vs strategic] Home includes an item-level entry to work (assigned to me / needs review). load_when: home content.
- DASH-JOB-03 [INFERRED Ghibellini & Meier 2025, Ovsiankina] Home offers resume: last record or view opened. load_when: home, return visits.
- DASH-JOB-04 [DIRECT canon A-09 alternative, C-P03] Every number on home states source and period and links to its rows. load_when: any metric.
- DASH-JOB-05 [INFERRED Sarikaya/Bach genre split; judgment] A reporting chart sits below the queue or on a reporting page. load_when: chart on home.
## Detect
DASH-JOB-01 Blocking: first viewport's largest region is >= 3 equal cards of big number + label.
DASH-JOB-02 Should-fix: no list of individual items with a per-row action on the home.
DASH-JOB-03 Should-fix: return visit shows no "Resume" or last-opened item.
DASH-JOB-04 Blocking: a metric or delta lacks period/comparison text or cannot be clicked to filtered rows.
DASH-JOB-05 Should-fix: a chart renders above the first row of the work queue.
## Pass / Fail (demo app; made-up data)
DASH-JOB-01 Pass: admin home opens on "Needs review (12)" table of records. Fail: dashboard-01 as shipped, four KPI cards first.
DASH-JOB-02 Pass: "Assigned to me" rows REC-0412 to REC-0423. Fail: home lists only totals.
DASH-JOB-03 Pass: "Resume REC-0418 Acme Freight renewal". Fail: home always opens at top with no trace.
DASH-JOB-04 Pass: "Overdue 7 (vs 4 last week, source: records)" links to the filtered table. Fail: "+12.5%" badge with no basis.
DASH-JOB-05 Pass: chart on Reports page. Fail: dashboard-01's "Total Visitors" chart above the table.
```

```markdown
---
name: dash-dens
family: dashboard
laws: [cognitive-load, chunking]
load_when: "setting density, row height, disclosure or region count on home or records table"
budget: "<= 40 lines, <= 500 tokens"
source: "canon C-P04, A-10, C-P12; SLDS 2 Display Density; IBM Carbon Data table (both seen 2026-10-07)"
---
Provenance: vendor primary docs plus canon. Cognitive load used by analogy only.
Caveat: no controlled study of compact versus comfortable density in working tools was found.
## Rules
- DASH-DENS-01 [DIRECT SLDS 2, Carbon] Records table offers density as a per-user preference that persists. load_when: records table.
- DASH-DENS-02 [DIRECT canon C-P04, A-10] No table inside a bordered card inside a bordered panel. load_when: any table container.
- DASH-DENS-03 [DIRECT Carbon "without truncation"] The row's identifying field never truncates at default width. load_when: column widths.
- DASH-DENS-04 [INFERRED judgment; progressive disclosure] Secondary fields go to the detail panel, never hover-only. load_when: hidden fields.
- DASH-DENS-05 [DIRECT canon C-P12] No region, tab or section without a real job (placeholders, empty tabs). load_when: home and table tabs.
## Detect
DASH-DENS-01 Should-fix: no density control, or choice resets after reload.
DASH-DENS-02 Blocking: three nested bordered containers around table data.
DASH-DENS-03 Should-fix: record name shows an ellipsis at default width.
DASH-DENS-04 Should-fix: a field appears only in a hover tooltip.
DASH-DENS-05 Blocking: a tab or region renders placeholder or duplicate content.
## Pass / Fail (made-up data)
DASH-DENS-01 Pass: "Density: Comfortable / Compact" kept per user. Fail: fixed row height only.
DASH-DENS-02 Pass: records table on page surface with hairlines. Fail: card > bordered table > bordered badges.
DASH-DENS-03 Pass: "Northwind Logistics renewal" in full. Fail: "Northwind Lo...".
DASH-DENS-04 Pass: owner and notes shown in the side panel. Fail: owner only on hover.
DASH-DENS-05 Pass: tabs map to saved views with real rows. Fail: dashboard-01 tabs with placeholder bodies ([U], confirm).
```

```markdown
---
name: dash-view
family: dashboard
laws: []
load_when: "adding views, saved views, filter/sort/group, or a detail panel to records"
budget: "<= 40 lines, <= 500 tokens"
source: "canon C-P03, C-P07; Polaris Index filters/Index table (secondary via port, seen 2026-10-07); Carbon Data table"
---
Provenance: canon plus secondary vendor docs; Linear Triage verified.
Caveat: Polaris evidence read via a port; re-check on the vendor site.
## Rules
- DASH-VIEW-01 [INFERRED Polaris Index filters] Filter+sort state can be saved as a named view; current view name visible. load_when: filters.
- DASH-VIEW-02 [INFERRED judgment; Polaris #10756] Returning from a record restores filters, sort, scroll and selection. load_when: list-to-detail.
- DASH-VIEW-03 [DIRECT canon C-P03] Drag-reorder handles appear only when sort is "manual". load_when: reorderable rows.
- DASH-VIEW-04 [INFERRED Carbon placement; judgment] Triage opens rows in a side panel keeping the list visible. load_when: triage queue.
- DASH-VIEW-05 [DIRECT canon C-P07] The row whose detail is open shows whole-row selection plus a marker. load_when: detail open.
## Detect
DASH-VIEW-01 Should-fix: after filtering, no "Save view"; tabs not tied to filter state.
DASH-VIEW-02 Should-fix: trace open record -> back resets filters or scroll to top.
DASH-VIEW-03 Should-fix: drag handles visible while a column sort is active.
DASH-VIEW-04 Should-fix: opening a row in triage replaces the list with a full page.
DASH-VIEW-05 Blocking: open record's row is not visibly selected.
## Pass / Fail (made-up data)
DASH-VIEW-01 Pass: "Overdue - mine" tab saved from filters. Fail: filters lost on tab switch.
DASH-VIEW-02 Pass: back to row 37 of 68, same filters. Fail: back to page 1, unfiltered.
DASH-VIEW-03 Pass: "Sort: Manual" shows handles. Fail: dashboard-01 handles shown alongside sortable data.
DASH-VIEW-04 Pass: REC-0418 opens right panel, queue still visible. Fail: full-page jump per row.
DASH-VIEW-05 Pass: REC-0418 row tinted with left marker. Fail: no row state while panel open.
```

```markdown
---
name: dash-mode
family: dashboard
laws: [cognitive-load]
load_when: "adding edit, bulk-select, filter, focus or expert modes"
budget: "<= 40 lines, <= 500 tokens"
source: "Sellen, Kurtenbach & Buxton 1992 (verified 2026-10-07); Cockburn et al. 2014 (verified abstract); canon C-P07"
---
Provenance: verified primary for mode feedback and expert transitions; Raskin and Norman not re-checked.
Caveat: Sellen et al. used text editing with a foot pedal; transfer to held keys is inferred.
## Rules
- DASH-MODE-01 [DIRECT Sellen et al. 1992] Every latched mode shows a persistent indicator at the point of action. load_when: any mode.
- DASH-MODE-02 [INFERRED Sellen et al. user-maintained feedback] Short operations use a held key or one-shot command, not a latched mode. load_when: transient tools.
- DASH-MODE-03 [DIRECT canon C-P07] Inline-editable cells are visibly distinct from read cells at rest and in edit. load_when: editable tables.
- DASH-MODE-04 [INFERRED Cockburn et al. 2014] No "advanced mode" toggle; accelerators layered on the same UI. load_when: expert features.
- DASH-MODE-05 [INFERRED judgment] Focus mode is user-entered, named on screen, exited by the same key. load_when: focus mode.
## Detect
DASH-MODE-01 Blocking: bulk-select or edit mode active with no on-screen indicator near the table.
DASH-MODE-02 Should-fix: a single-use action requires toggling a mode on and off.
DASH-MODE-03 Should-fix: an input cell is indistinguishable from text at rest.
DASH-MODE-04 Should-fix: a setting hides features behind "Advanced".
DASH-MODE-05 Consider: focus mode hides navigation with no visible name or exit.
## Pass / Fail (made-up data)
DASH-MODE-01 Pass: "3 selected - Clear" bar replaces toolbar. Fail: checkboxes ticked, toolbar unchanged.
DASH-MODE-02 Pass: hold Shift to range-select. Fail: "Range mode" button.
DASH-MODE-03 Pass: Limit cell shows edit affordance on focus. Fail: dashboard-01 Target/Limit inputs look like text ([V] inputs; styling to confirm).
DASH-MODE-04 Pass: shortcut hints in row menu. Fail: "Expert mode" toggle in settings.
DASH-MODE-05 Pass: "Focus: Needs review - Esc to exit". Fail: sidebar vanishes silently.
```

```markdown
---
name: dash-flow
family: dashboard
laws: [hicks-law, fittss-law]
load_when: "row actions, bulk actions, destructive actions, shortcuts, return-to-work"
budget: "<= 40 lines, <= 500 tokens"
source: "canon C-P09, A-15, C-P11; Vance et al. 2018; Anderson et al. 2016; Ghibellini & Meier 2025; Lane et al. 2005; Cockburn et al. 2014; Polaris #11786"
---
Provenance: verified primary for habituation and resumption; canon for confirm/undo and motion.
Caveat: Hick applies to known commands only; Fitts to pointer only, never keyboard.
## Rules
- DASH-FLOW-01 [DIRECT canon C-P09] Destructive bulk action is labelled with count and object; result toast has Undo. load_when: delete/archive.
- DASH-FLOW-02 [DIRECT Vance et al. 2018; Anderson et al. 2016] Confirmation dialogs only for truly irreversible actions. load_when: any confirm.
- DASH-FLOW-03 [INFERRED Lane et al. 2005; Cockburn et al. 2014] Each row-menu item shows its shortcut; palette lists the same keys. load_when: row actions.
- DASH-FLOW-04 [INFERRED Polaris #11786] Selection states count and scope (page vs all N). load_when: bulk select.
- DASH-FLOW-05 [INFERRED Ghibellini & Meier 2025; Mark et al. 2008] After interruption, restore last record, position and draft; mark draft unfinished. load_when: navigation away/reload.
- DASH-FLOW-06 [DIRECT canon A-15, C-P11] Keyboard row navigation and sort do not animate. load_when: j/k, arrows, sort.
## Detect
DASH-FLOW-01 Blocking: "Are you sure?" with OK/Cancel, or delete with no Undo.
DASH-FLOW-02 Blocking: a confirm dialog guards a reversible action.
DASH-FLOW-03 Should-fix: row menu items show no shortcut.
DASH-FLOW-04 Should-fix: "Select all" without stating page or total scope.
DASH-FLOW-05 Should-fix: reload loses an unsaved edit or the open record.
DASH-FLOW-06 Blocking: highlight or rows tween on key press or sort.
## Pass / Fail (made-up data)
DASH-FLOW-01 Pass: "Delete 3 records" -> "3 records deleted - Undo". Fail: "Are you sure?" OK/Cancel.
DASH-FLOW-02 Pass: archive with Undo, no dialog. Fail: dialog on every status change.
DASH-FLOW-03 Pass: "Edit  E". Fail: dashboard-01 menu "Edit / Make a copy / Favorite / Delete" without keys ([U]).
DASH-FLOW-04 Pass: "10 selected on this page - Select all 68". Fail: header checkbox silently selects all 68.
DASH-FLOW-05 Pass: "Draft on REC-0418 unsaved - Resume". Fail: draft gone after reload.
DASH-FLOW-06 Pass: selection jumps row to row. Fail: smooth-scrolling highlight.
```

```markdown
---
name: dash-attn
family: dashboard
laws: [doherty-threshold]
load_when: "priority emphasis, changed rows, live updates, freshness, status"
budget: "<= 40 lines, <= 500 tokens"
source: "canon C-P02, A-14, C-P05; NN/g response-time limits (seen 2026-10-07); Vance et al. 2018; Von Restorff (V, recall only)"
---
Provenance: canon plus verified habituation; perception papers recalled, not re-checked.
Caveat: Von Restorff is a recall effect and does not justify salience; WCAG 1.4.1 applies to status.
## Rules
- DASH-ATTN-01 [DIRECT canon C-P02] At most one standout item per view, and it is the item needing action. load_when: emphasis.
- DASH-ATTN-02 [DIRECT canon A-14] Changes shown by a persistent static marker, never only a flash. load_when: updates.
- DASH-ATTN-03 [INFERRED change blindness, recalled; canon A-14] Live inserts never reorder rows during interaction; "N new - show". load_when: live tables.
- DASH-ATTN-04 [DIRECT canon C-P05; WCAG 1.4.1] Status carries text, icon or shape as well as color. load_when: status.
- DASH-ATTN-05 [INFERRED NN/g limits; judgment] Refreshing data shows "Updated hh:mm"; past interval, age is marked. load_when: live data.
## Detect
DASH-ATTN-01 Blocking: two or more items styled as primary emphasis in one view.
DASH-ATTN-02 Blocking: a change is shown only by a transient flash or animation.
DASH-ATTN-03 Should-fix: rows shift position under the pointer without user action.
DASH-ATTN-04 Blocking: a status distinguishable only by hue.
DASH-ATTN-05 Should-fix: auto-refreshing region with no timestamp.
## Pass / Fail (made-up data)
DASH-ATTN-01 Pass: one "Overdue" row emphasised, neighbours quiet. Fail: four colored trend badges plus a solid CTA.
DASH-ATTN-02 Pass: dot "changed" on REC-0415 until viewed. Fail: yellow flash fades in 1 s.
DASH-ATTN-03 Pass: "3 new records - show". Fail: new rows push the hovered row down.
DASH-ATTN-04 Pass: "Done" with check icon. Fail: green/amber dots only.
DASH-ATTN-05 Pass: "Updated 09:42 - 12 min ago". Fail: no freshness cue.
```

```markdown
---
name: dash-cust
family: dashboard
laws: [choice-overload]
load_when: "column choosers, saved views, layout editors, widget grids, adaptive ordering"
budget: "<= 40 lines, <= 500 tokens"
source: "Findlater & McGrenere 2004 (verified abstract); Banovic et al. 2012 on Mackay 1991 (secondary); Carroll & Rosson 1987 (R); Tesler (E)"
---
Provenance: one verified menu study plus secondary on customization uptake.
Caveat: choice-overload is C and Tesler is E; neither carries a rule alone.
## Rules
- DASH-CUST-01 [INFERRED Banovic et al. on Mackay; Carroll & Rosson R] Default home and view serve the main job with zero setup. load_when: first run.
- DASH-CUST-02 [DIRECT Findlater & McGrenere 2004] No automatic reordering of menus, widgets or columns by usage. load_when: adaptive features.
- DASH-CUST-03 [INFERRED judgment] Customization lives in saved views (columns, density, filters), not widget grids. load_when: layout editors.
- DASH-CUST-04 [INFERRED judgment] Personal vs shared views are labelled; editing shared views is explicit. load_when: shared views.
- DASH-CUST-05 [INFERRED Tesler E, Consider only] System absorbs setup: sensible default filters per role. load_when: defaults.
## Detect
DASH-CUST-01 Should-fix: home is empty or generic until configured.
DASH-CUST-02 Should-fix: item order changes between sessions without user action.
DASH-CUST-03 Should-fix: widget drag-grid exists while records have no saved views.
DASH-CUST-04 Should-fix: a change to a view alters teammates' screens without warning.
DASH-CUST-05 Consider: first-run view shows all records unfiltered for every role.
## Pass / Fail (made-up data)
DASH-CUST-01 Pass: day one shows "Assigned to me (5)". Fail: "Add your first widget".
DASH-CUST-02 Pass: nav order fixed. Fail: "Reports" jumps to top after use.
DASH-CUST-03 Pass: "Customize Columns" saved into the view. Fail: widget grid editor on home.
DASH-CUST-04 Pass: "Shared - Team Ops" badge, "Save as personal". Fail: silent overwrite.
DASH-CUST-05 Pass: reviewers default to "Needs review". Fail: all 68 rows, no filter.
```

```markdown
---
name: dash-state
family: dashboard
laws: [doherty-threshold]
load_when: "any surface that fetches data: admin home, records table, record detail"
budget: "<= 40 lines, <= 500 tokens"
source: "canon C-P08, A-14, A-18, A-20; NN/g response-time limits (seen 2026-10-07)"
---
Provenance: canon floor; NN/g secondary for timing.
Caveat: "stale" is not a canon state; see [PROPOSED] E-2. No rule here is based on it.
## Rules
- DASH-STATE-01 [DIRECT canon C-P08] Empty records table says what will be here, offers first action, hides filters and bulk controls. load_when: zero records.
- DASH-STATE-02 [DIRECT canon C-P08, A-18, A-14] Loading is a skeleton of the final layout, no spinner, no shimmer on table skeleton. load_when: fetch.
- DASH-STATE-03 [INFERRED canon C-P08] Zero results with active filters says so and offers "Clear filters". load_when: filtered empty.
- DASH-STATE-04 [DIRECT canon C-P08] Error and partial states are designed per region, with retry and the failed count. load_when: fetch failure.
- DASH-STATE-05 [DIRECT canon C-P08] Offline shows a persistent indicator; actions disabled with reason or queued and labelled. load_when: network loss.
## Detect
DASH-STATE-01 Blocking: full toolbar and filters over an empty table ("No results.").
DASH-STATE-02 Blocking: centered spinner, blank region, or shimmering table skeleton on load.
DASH-STATE-03 Should-fix: filtered empty and true empty use the same message.
DASH-STATE-04 Blocking: a failed region shows nothing or the whole page errors.
DASH-STATE-05 Blocking: offline actions fail silently.
## Pass / Fail (made-up data)
DASH-STATE-01 Pass: "Records you import appear here - Import CSV". Fail: dashboard-01 "No results." under toolbar ([U]).
DASH-STATE-02 Pass: 10 grey static row skeletons. Fail: dashboard-01 has no loading state ([U]).
DASH-STATE-03 Pass: "No records match 'Overdue' - Clear filters". Fail: "No results."
DASH-STATE-04 Pass: "Activity failed to load - Retry; table OK". Fail: blank home.
DASH-STATE-05 Pass: "Offline - 2 changes queued". Fail: Save spins forever.
```

## C. Critique of dashboard-01

**What was observed (dated):**
- From the live blocks page, 2026-10-07: the block is described as "A dashboard with sidebar, charts and data table". The files are page.tsx, data.json, app-sidebar, chart-area-interactive, data-table, nav-documents, nav-main, nav-secondary, nav-user, section-cards and site-header. page.tsx renders SiteHeader, then SectionCards, then ChartAreaInteractive, then DataTable.
- From the research subagent's reading of the live preview, 2026-10-07, marked [V]:
  - Four cards. "Total Revenue $1,250.00 +12.5%", "New Customers 1,234 -20%", "Active Accounts 45,678 +12.5%", "Growth Rate 4.5% +4.5%".
  - A "Total Visitors" chart with a "Last 3 months" default.
  - A "Customize Columns" menu and an "Add Section" button.
  - A "Drag to reorder" handle on each row, and the footer "0 of 68 row(s) selected."
  - "Page 1 of 7" pagination.
  - Inline Target and Limit inputs, an "Assign reviewer" select, and an "Open menu" row action.
  - Sidebar items "Quick Create", "Inbox", "Dashboard", "Lifecycle", "Analytics", "Projects", "Team".
- Items marked [U] are from source recall and not confirmed: tab labels, the drawer, the menu items and the destructive Delete, the toast text, and the empty-state string. No commit hash was captured (G-3).

**Correction to the [ASSUMPTION]:** the user's recollection is correct on all four counts. Of the added recollection:
- Confirmed: the column-visibility control ("Customize Columns") and a time-range default.
- Recalled but not seen live: the time-range options (90/30/7 days) and the row-detail drawer.
- Not in either recollection: inline-editable cells, a reviewer select, a row actions menu, pagination, an "Add Section" button, and a header titled "Documents".

**What the rules or canon reject:**

| Finding | Rule / canon | Severity |
|---|---|---|
| Four equal KPI cards form the first region of the home. | DASH-JOB-01; A-03, A-09 | Blocking |
| Trend badges ("+12.5%", "-20%") lack a stated comparison basis in the badge, and no card links to rows. The "Total Revenue" card may carry a visitors footnote ("Visitors for the last 6 months"); if confirmed, that is a C-P03 truth failure. | DASH-JOB-04; C-P03 | Blocking (footnote mismatch pending confirmation) |
| A "Total Visitors" reporting chart sits above the work table. | DASH-JOB-05 | Should-fix |
| Four colored trend badges compete for emphasis. | DASH-ATTN-01; C-P02 | Blocking if they are styled as emphasis; check the rendered colors |
| Drag handles sit next to sortable or paginated data, so the manual order can conflict with sort. | DASH-VIEW-03; C-P03 | Should-fix |
| Placeholder tabs ("Past Performance", "Key Personnel", "Focus Documents") [U]. | DASH-DENS-05; C-P12 | Blocking if confirmed |
| Inline Target/Limit inputs in a read table. | DASH-MODE-03; C-P07 | Should-fix |
| No loading state [U]. | DASH-STATE-02; C-P08, A-18 | Blocking if confirmed |
| "No results." under the full toolbar [U]. | DASH-STATE-01; C-P08 counter-example | Blocking if confirmed |
| Save toast "Saving {header}" then "Done" [U] does not say what happened. | C-P09 | Should-fix |
| Row menu shows no shortcuts [U]. | DASH-FLOW-03 | Should-fix |
| No saved views; tabs are not tied to filter state. | DASH-VIEW-01 | Should-fix |
| No freshness timestamp on data. | DASH-ATTN-05 | Should-fix |

**What it gets right:**
- It includes a real data table with real columns: Header, Section Type, Status, Target, Limit, Reviewer. This is A-03's own alternative.
- Column visibility ("Customize Columns") supports DASH-CUST-03.
- An explicit selection count ("0 of 68 row(s) selected.") partly satisfies DASH-FLOW-04 and DASH-MODE-01. Selection scope ("Select all") is not confirmed.
- Pagination states the page position ("Page 1 of 7").
- Status pairs an icon with text [U], which would pass DASH-ATTN-04 and C-P05.
- Delete sits inside a row menu, not as a red solid button on every row [U]. That avoids C-P02's counter-example.
- An "Inbox" item in the sidebar acknowledges the queue job, even though the home does not lead with it.

**Vesper's fix, in one line:** move the DataTable to the top as a "Needs review" saved view, and put the chart on Analytics. Replace the four cards with the [PROPOSED] E-1 count strip at most.

## D. Router proposal

| Row | Load (max three) | Why |
|---|---|---|
| Dashboard (replaces the current row) | dash-job, dash-attn, dash-state | The job, emphasis and freshness, and the states. von-restorff is dropped: it is not written, and it is a recall effect. cognitive-load and chunking move inside dash-job's laws line as context, not as separate loads. |
| Records table (new) | dash-view, dash-dens, dash-flow | The second example surface. |
| Saved views (new) | dash-view, dash-cust, choice-overload | choice-overload is loaded only for its C caveat, so that it is not misapplied. |
| Mode switch (new) | dash-mode, cognitive-load | cognitive-load is by analogy. |
| Bulk action (new) | dash-flow, dash-mode, fittss-law | fittss-law is for pointer targets only. |
| Live/stale data (new) | dash-attn, dash-state, doherty-threshold | doherty-threshold is loaded with its O caveat and the F-1 ruling. |

## E. Proposed canon amendments

No rule in section B is based on any of these.

- **E-1 [PROPOSED]** (amends A-03/A-09). A single-row count strip is allowed above a queue when every number is a link to its filtered rows and states its period. It carries no trend badges, icon tiles or sparklines. Basis: weak preference evidence (Q1) and judgment. A card grid as the primary region is still banned.
- **E-2 [PROPOSED]** (amends C-P08). Add "stale" to states.md. Data past its refresh interval shows its age, and actions on it are labelled as acting on data as of that time. Basis: Q6 and Q8 judgment, plus NN/g response-time limits (secondary).
- **E-3 [PROPOSED]** (amends A-20's wording, tightening it). Replace "Acknowledge within 400ms" with this rule. Acknowledge input within 0.1 s, so the outcome feels caused by the user. Show real stages when work exceeds 1 s. Show percent-done, counting only finished work, beyond 10 s. Basis: NN/g 0.1/1/10 s limits (1993, seen 2026-10-07). The 400 ms Doherty figure was not found in its source. This replaces the figure with a stricter one, so it does not loosen the rule.
- **E-4 [PROPOSED]** (amends C-P09). Allow a single confirmation for truly irreversible actions, but only if it names the object and count and uses a typed or held confirmation, never OK/Cancel. Basis: habituation evidence (Vance et al. 2018).

## F. Conflicts between sources and rulings

- **F-1. A-20's 400 ms against NN/g and Miller 1968.** The 400 ms figure was not found in the Doherty source (reference-layer flag O). NN/g's limits are 0.1, 1 and 10 s.\[19\] Miller 1968 was not retrieved. Ruling: A-20 stands unchanged, and E-3 proposes the stricter NN/g-based wording.
- **F-2. Sarikaya et al. volume.** The author page lists "29(1): 682-692" next to the 2019 date. IEEE VIS and ACM Digital Library citations give volume 25, issue 1, pp. 682-692, January 2019. Ruling: cite as IEEE TVCG 25(1):682-692, 2019, doi:10.1109/TVCG.2018.2864903, and treat the author page's "29" as an error.
- **F-3. Bach et al. date.** The DOI and Warwick record say January 2023, available 26 September 2022. arXiv says 2022. Ruling: 2023, the journal issue date.
- **F-4. Mark et al. 2008 "23 min 15 s".** A blog attributes the figure to the CHI 2008 paper, but the abstract seen does not contain it. Ruling: the figure is not used.
- **F-5. Findlater & McGrenere 2004 paraphrase.** A later citing paper says adaptive menus "improved efficiency for users who did not actively customize". The abstract says static was significantly faster than adaptive. Ruling: the abstract governs.
- **F-6. Salesforce "30% more".** The figure appears only in third-party help pages, not in SLDS 2. Ruling: secondary, and not used in rules.
- **F-7. Polaris select-all scope.** The docs (via the port) recommend bulk actions. Issue #11786 (2024) reports that paginated select-all selects every row by default. Ruling: scope must be explicit (DASH-FLOW-04). No Polaris behaviour today is claimed beyond the issue date.
- **F-8. [NEEDS DECISION] Example sections.** The reference layer's CI lint requires a DealReady section and a Fybr section in every rule file. This brief asks for demo-app and dashboard-01 examples. This report follows the brief, so the rule files in section B will fail that lint until the user decides. The options are to relax the lint for the DASH family, or to add DealReady and Fybr sections in the reference pass.

## G. Assumptions

- **G-1 [ASSUMPTION]:** the "admin home" is dashboard-01 placed in the demo app shell, per the brief's ruling. The records table is the second surface.
- **G-2 [ASSUMPTION]:** the demo app's records match dashboard-01's data.json shape (id, header, type, status, target, limit, reviewer; 68 rows) wherever an example cites dashboard-01 directly. Other examples use invented record IDs (REC-0412 and so on).
- **G-3 [ASSUMPTION]:** items marked [U] in section C reflect the current source. They come from the subagent's recall. GitHub source files and the commit hash could not be opened this session. A shadcn issue (#11389, per the subagent) tracks a TanStack Table v9 migration that touches data-table.tsx, so details may change.
- **G-4 [ASSUMPTION]:** the habituation findings on security warnings transfer to routine confirmation dialogs in working tools.
- **G-5 [ASSUMPTION]:** live observations dated 2026-10-07 hold for the note date 2026-10-06.

## H. Not found (consolidated)

- A comparative study of card or metric homes against queue, table or view homes for working-tool users. This was the disconfirming target. Only weak preference evidence was found.
- The dashboard-01 commit hash and direct source-file reads; the drawer, tab labels, menu items and toast strings were not confirmed live.
- Primary texts not re-checked this session:
  - Hick 1952, Hyman 1953, Fitts 1954, Sweller 1988 and 1998, Treisman & Gelade 1980, Wolfe's guided search, Rensink et al. 1997.
  - Norman 1981, Raskin 2000, Grossman et al. 2007, Altmann & Trafton 2002, Bravo-Lillo et al.
  - Carroll & Rosson 1987, Miller 1968, Doherty & Thadani 1982.
  - Chernev, Böckenholt & Goodman 2015, Mackay 1991 (original text), Few, Tufte.
- Vendor and maker docs not retrieved:
  - Linear Inbox, Linear views and the Linear Method; Superhuman; GitHub Projects views; Notion and Airtable views; Raycast.
  - Atlassian Design System, GitLab Pajamas, Material Design 3, GOV.UK Design System.
  - NN/g on data tables, complex applications, content density and the 10 heuristics.
- Effect sizes for Sellen et al. 1992 and Findlater & McGrenere 2004.

## I. Sources, dated

Per this report's publication rules, there is no separate reference list. Each source is named and dated where it is used: in the Evidence tables, the Law ledger and section F. Verification status at a glance:
- **Seen live 2026-10-07, primary:**
  - Papers: Sarikaya et al. (author page and slides); Bach et al. (arXiv and Warwick record); Ghibellini & Meier (Nature.com); Sellen et al. (author PDF); Vance et al. 2018 and Anderson et al. 2016 (BYU); Mark et al. 2008, Findlater & McGrenere 2004 and Cockburn et al. 2014 (abstracts); Scheibehenne et al. 2010 (OUP abstract); Banovic et al. 2012.
  - Docs: Linear Triage docs; SLDS 2 Display Density; Salesforce Developers density pages; IBM Carbon Data table; the shadcn blocks page.
- **Secondary, seen 2026-10-07:** NN/g response-time article (practitioner); Polaris docs via the ownego port; Cloudscape via a docs mirror; Polaris GitHub issues; Fisher's blog; the dashboard-01 preview via the research subagent.
- **Flag as given, not re-checked:** every law in section A not marked re-checked, and every source listed under H.

## Sources

1. [dashboard-01](https://ui.shadcn.com/view/new-york-v4/dashboard-01)
2. [shadcn/ui Data Table: The Complete Guide + 10 Templates (2026) - AdminLTE.IO](https://adminlte.io/blog/shadcn-ui-data-table-templates/)
3. [University of Toronto Input Research Group](https://www.dgp.toronto.edu/OTP/papers/bill.buxton/IRG.html)
4. [scholarsarchive.byu.edu](https://scholarsarchive.byu.edu/facpub/6495)
5. [What Do We Talk About When We Talk About Dashboards?](https://alper.datav.is/assets/publications/dashboards/dashboards-talk-infovis2018.pdf)
6. [Dashboards](https://alper.datav.is/publications/dashboards/)
7. [Dashboard Design Patterns](https://arxiv.org/abs/2205.00757)
8. [Triage](https://linear.app/docs/triage)
9. [Designing Interactive Technology Roadmaps: A Visual Analytics Approach](https://link.springer.com/chapter/10.1007/978-3-032-16454-4_16)
10. [Display Density · Lightning Design System 2](https://www.lightningdesignsystem.com/2e1ef8501/p/805bbe)
11. [Data table](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines)
12. [Data table](https://carbondesignsystem.com/components/data-table/usage/)
13. [Index filters — Shopify Polaris Vue by ownego](https://ownego.github.io/polaris-vue/components/IndexFilters)
14. [Supporting Novice to Expert Transitions in User Interfaces](https://dl.acm.org/doi/10.1145/2659796)
15. [FingerArc and FingerChord](https://dl.acm.org/doi/10.1145/3242587.3242589)
16. [Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects - Humanities and Social Sciences Communications](https://www.nature.com/articles/s41599-025-05000-w)
17. [\[PDF\] The cost of interrupted work: more speed and stress](https://www.semanticscholar.org/paper/The-cost-of-interrupted-work:-more-speed-and-stress-Mark-Gudith/b8da65570a3955db52b117b9bedd8f131316501d)
18. [(PDF) Triggering triggers and burying barriers to customizing software](https://www.researchgate.net/publication/254005152_Triggering_triggers_and_burying_barriers_to_customizing_software)
19. [Website Response Times - NN/G](https://www.nngroup.com/articles/website-response-times/)
