# Shape Up at AI speed — Compass report and DealReady cycle charter

Compass (Product Strategist) · Prompt 05 · 30 Sep 2026

Evidence labels: **[verified]** primary source, dated · **[secondary]** named third party · **[judgment]** Compass's call · **[not found]** looked for, not located.

**Assumptions (§7 is unfilled, so these are labeled rather than asserted).** DealReady is at seed, a raise is in flight, and the launch matters to it. The team is Kurt (CEO), Taylor (Head of Product), and the builders. The brief says one agent-equipped engineer; the team I know of has two, Marco and Taras, so the charter is written to work with either. The metrics are the ones in textbook Part 6: time to first trusted insight on a real deal room, and weekly active deal rooms.

**A note on quotes.** Book passages were pulled with a fetch tool that routes each page through a model. I spot-checked fourteen quotes character by character against the live pages. All of them match, though several are fragments of longer sentences. The online book has no page numbers, so locators are chapter plus section heading. Re-check any quote before it leaves the team.

---

## Verdict

**Take Shape Up's shaping and betting discipline almost whole, and replace its calendar.**

The book targets one risk: "the risk of not shipping on time" (Ch. 1). Agents shrink that risk and grow a different one: shipping surface area nobody framed, verified, or needed. So the method's weight moves upstream, into framing and shaping, and downstream, into verification. The six weeks in between collapse.

That is also the direction Singer himself has moved since 2019:
- He added framing as a separate step.
- He now insists an engineer is in the shaping session.
- In 2026 he started running shaping itself through Claude skills.

**The ruling:**
- **Rhythm:** two-week cycles, eight build days plus a two-day cool-down.
- **Appetites:** three sizes.
- **Pitch:** your `brief.md`, split into a frame and a package.
- **Betting table:** two seats (you and Kurt), plus a builder feasibility veto held async.
- **Circuit breaker:** hard, and only one extension of up to two days.
- **Verification:** inside the cycle, per scope.
- **Cool-down:** mostly spent maintaining the agent harness, not grooming a backlog.

**What it replaces:** the shared Linear priority list, and the habit of turning review-meeting feedback into direction for engineers.

---

## 1. The method as written

Source: *Shape Up: Stop Running in Circles and Ship Work that Matters*, Ryan Singer, Basecamp. Read from basecamp.com/shapeup on 30 Sep 2026. The site footer shows ©1999–2026. The site gives no edition number or revision history **[not found]**; the book was published in 2019.

### Appetite
- "You can think of the appetite as a time budget for a standard team size." (Ch. 3, *Setting the appetite*) **[verified]**
- The glossary defines it as time "we want to spend on a project, as opposed to an estimate." **[verified]**
- **Two sizes.** Small batch is one designer and one or two programmers for one or two weeks. Big batch is the same team for the full six weeks.
- **The inversion that matters:** "Estimates start with a design and end with a number. Appetites start with a number and end with a design." (Ch. 3, *Fixed time, variable scope*) **[verified]**
- The chapter also says "Good" is relative: "Without a time limit, there's always a better version." (Ch. 3) **[verified]**

### Shaping
- Shaped work has three properties (Ch. 2):
  - **Rough:** "Everyone can tell by looking at it that it's unfinished."
  - **Solved:** the main elements are there "at the macro level and they connect together."
  - **Bounded:** it "tells the team where to stop." **[verified]**
- **Who shapes.** Shaping is primarily design work that needs technical literacy and business judgment. The book calls it "a closed-door, creative process" (Ch. 2, *Who shapes*). **[verified]**
- **Two tracks.** Shapers work on future cycles while builders build the current one (Ch. 2, *Two tracks*).
- **Four steps:** set boundaries, rough out the elements, address risks and rabbit holes, write the pitch (Ch. 2, *Steps to shaping*). **[verified]**
- **Raw ideas.** The default response to one is "Interesting. Maybe some day." (Ch. 3). **[verified]**
- **Grab-bags.** "redesign the Files section" is "a grab-bag, not a project" (Ch. 3). **[verified]**

### Breadboarding
- Borrowed from electronics. It has three parts (Ch. 4, *Breadboarding*): **[verified]**
  - **places:** screens, dialogs, menus
  - **affordances:** buttons, fields
  - **connection lines** between them
- No visual styling. The goal is to settle the flow and the elements without committing to a layout.

### Fat-marker sketches
- "A sketch made with such broad strokes that adding detail is difficult or impossible" (Ch. 4). **[verified]**
- Leaving detail out "give[s] room to designers in subsequent phases" (Ch. 4, *Room for designers*).
- At this stage, the book says, "we could walk away from the project. We haven't bet on it." (Ch. 4) **[verified]**

### Rabbit holes and no-gos
- **Rabbit holes** are "technical unknowns, unsolved design problems, or misunderstood interdependencies" (Ch. 5). **[verified]**
- **The four probe questions** include "Is there a hard decision we should settle in advance so it doesn't trip up the team?" **[verified]**
- **No-gos.** Use cases the project won't cover are declared out of bounds.
- **Cut back.** Nice-to-haves get cut.
- **The technical check.** Present the shaped work to technical experts, and ask "is X possible in 6-weeks?" rather than "is this possible?" (Ch. 5, *Present to technical experts*). **[verified]**
- **Why it matters:** well-shaped work has thin-tailed risk; an unaddressed rabbit hole makes it fat-tailed.

### The pitch
- **Five ingredients** (Ch. 6): problem, appetite, solution, rabbit holes, no-gos. **[verified]**
- "Without a specific problem, there's no test of fitness to judge whether one solution is better than the other." **[verified]**
- "A problem without a solution is unshaped work." **[verified]**
- At Basecamp, pitches are posted asynchronously so people can read and comment before the table.

### Bets, not backlogs
- "Backlogs are a big weight we don't need to carry." (Ch. 7) **[verified]**
- The table sees only pitches from the last six weeks, or ones someone deliberately revives.
- Everyone keeps their own decentralized lists.
- "Really important ideas will come back to you." (Ch. 7, *Important ideas come back*) **[verified]**

### The betting table
- **Who sits there:** "the CEO (who in our case is the last word on product), CTO, a senior programmer, and a product strategist (myself)." (Ch. 8) **[verified]**
- **When and how long:** it meets during cool-down, and "the call rarely goes longer than an hour or two."
- **Output:** a cycle plan.
- **What a bet means:** bets have a payout, bets are commitments, and "A smart bet has a cap on the downside." **[verified]**
- **Questions the table asks** (Ch. 9): Does the problem matter? Is the appetite right? Is the solution attractive? Is this the right time? Are the right people available?
- **Kick-off:** after the table, a kick-off message names the bets and the people.

### Six-week cycles and cool-down
- **Why six weeks:** "We learned that two weeks is too short to get anything meaningful done." Six weeks is "long enough to finish something meaningful and still short enough to see the end from the beginning." (Ch. 8) **[verified]**
- **Cool-down** is two weeks after each cycle. The glossary says it is for "ad-hoc tasks, fix bugs, and hold a betting table." Builders are "free to work on whatever they want."
- **Uninterrupted time:** "We do not allow the team to be interrupted or pulled away to do other things." (Ch. 8) **[verified]**
- **Bugs** are not an automatic excuse to interrupt. They wait for cool-down, or they compete at the table.

### Circuit breaker
- "If they don't finish, by default the project doesn't get an extension." (Ch. 8) **[verified]**
- The glossary frames it as risk management: cancel by default rather than extend by default.
- **Extensions are the rare exception.** They need two things (Ch. 14, *When to extend a project*): **[verified]**
  - the remaining tasks are must-haves
  - "the outstanding work must be all downhill. No unsolved problems; no open questions."
- **Clean slate:** unfinished work never carries over automatically. It must be re-shaped and re-bet (Ch. 8, *Keep the slate clean*).

### Building
- **Assign projects, not tasks.** "Nobody plays the role of the 'taskmaster'" (Ch. 10). **[verified]**
- **Done means deployed.** Testing and QA "needs to happen *within* the cycle" (Ch. 10). **[verified]**
- **Imagined vs discovered tasks.** "The way to really figure out what needs to be done is to start doing real work." (Ch. 10) **[verified]**
- **Get one piece done.** Integrate one vertical slice early. Start in the middle, with a piece that is core, small, and novel (Ch. 11).

### Scopes
- The project is broken into scopes "that can be finished independently of each other" (Ch. 12). **[verified]**
- **Three signs the scopes are right:** you can see the whole project; conversation flows; new tasks have an obvious bucket.
- **Scope shapes:** layer cakes, icebergs, and a "Chowder" list for loose tasks.
- **Nice-to-haves** are marked with a ~ (Ch. 12).

### Hill charts
- **Uphill** is "figuring out what our approach is." **Downhill** is "execution." (Ch. 13) **[verified]**
- "A dot that doesn't move is effectively a raised hand." (Ch. 13) **[verified]**
- Push the scariest work uphill first.

### Decide when to stop and scope hammering
- "Instead of comparing up against the ideal, compare down to baseline—the current reality for customers." (Ch. 14) **[verified]**
- "Scope grows naturally." **[verified]**
- **Hammering questions:** "Is this a 'must-have'?", "Could we ship without this?", and is this "a new problem or a pre-existing one that customers already live with?" (Ch. 14) **[verified]**
- **QA is for the edges.** "QA can limit their attention to edge cases because the designers and programmers take responsibility for the basic quality of their work." (Ch. 14) **[verified]**

### After shipping
- "The raw ideas that just came in from customer feedback aren't actionable yet. They need to be shaped." (Ch. 15, *Feedback needs to be shaped*) **[verified]**
- Saying yes to follow-up work is "like taking on debt."

### What the book says about team size and stage
- **It was written for a company past startup scale.** Basecamp "grew from four people to over fifty" (Ch. 1). The practices describe a company with a separate senior shaping group and several two- or three-person build teams. **[verified]**
- **Appendix 2, *Adjust to Your Size*, separates basic truths from specific practices** **[verified]**, paraphrased here:
  - **Truths for any size:** shape before committing, bet deliberately within a time limit, and separate unknowns from knowns when sequencing.
  - **Practices that scale with size:** cycle length, cool-down, formal pitches, the betting table, and specialized roles.
- **"Small enough to wing it."** A tiny team can drop formal cycles, cool-downs, pitches and the betting table. The same people alternate between shaping and building, and project lengths vary. The one discipline kept: be deliberate about which hat you're wearing and which phase you're in.
- **Where Singer places the method's peak value:** 30–50 people, the point where founders can no longer oversee everything directly (Lenny's Podcast show notes, 30 Mar 2025) **[secondary]**.
- **On new products** (Ch. 9, *R&D mode*): senior people build it themselves, and "the aim is to spike, not to ship." **[verified]** Production mode follows. Cleanup mode is pre-launch, unshaped, and "shouldn't last longer than two cycles." **[verified]**
- **Appendix 3 on how to begin:** "Build your shipping muscles before you worry too much about improving your research or discovery process." **[verified]**

**What this means for us [judgment]:** by the book's own appendix, a four-person team is allowed to wing it. Section 3 explains why we shouldn't, entirely.

---

## 2. Critiques and revisions

### Singer's own revisions (primary)

**Framing is now a separate step before shaping.**
- In *Framing* (27 Apr 2022) he writes: "Framing is all about the problem and the business value." **[verified]**
- *Three "what about…?" questions* (16 Aug 2023) moves the business case to the front. The pitch happens during framing, not after shaping, because most companies can't choose between several shaped options at the last minute. **[verified]**
- *What's the right level of detail when shaping?* (6 Feb 2026) separates the two documents' jobs, asking: "Am I trying to get approval or create clarity?" **[verified]**
- **The consequence:** the book's single pitch is now two artifacts with two checkpoints.

**Undershaped work is the main way adoption fails.**
- *Common Pitfalls When Adopting Shape Up* (28 Oct 2025) names three failure modes **[verified]**:
  - shaping without technical depth
  - blurring framing into shaping
  - mixing reactive work into shaped projects
- The fix for the first: senior technical people sit in the shaping session.
- Checkpoints named in that post: Candidate → Frame Go → Shape Go.

**The package, flexible cycles, and "ramp-up."** On the *Shapers & Builders* podcast (1 May 2023, "Getting to Shape Up 2.0") **[secondary: I read this through a summary of the transcript, so it is paraphrased]**:
- The pitch becomes a "package."
- Six-week cycles are not mandatory.
- A betting table that chooses among many pitches is a luxury most companies don't have.
- Cool-down is reconsidered as "ramp-up," time for the loose ends a focused cycle leaves behind.

**The betting table in his own current practice.** *End-To-End with Shape Up: A Real-World Case Study* (18 Nov 2025) **[verified]**:
- A single candidate moved through a Kanban of checkpoints. There was no competitive table.
- Shaping was two 2-hour whiteboard sessions: Singer as fractional CPO with a senior engineer, then again with a sales subject-matter expert added.
- **Why it matters for us [judgment]:** this is the closest published analogue to a two-person table.

**Scope of the method.** *Shape Up is for features, not all development work* (17 Aug 2021) **[verified]**:
- Reactive work belongs in a separate prioritized Kanban.
- "Feature work is a very different animal from other kinds of work."

**Estimates.** *When engineers say "that'll take months!"* (17 Apr 2025) **[verified]**:
- "Engineers are being completely rational when they respond to fuzziness with more time."
- Sharper shaping is the fix, not pressure.

**Discovery.** *We did all this discovery… now how do we decide?* (12 Nov 2024) **[verified]**:
- Deciding means elimination: "It's the ability to eliminate many, many things that aligns us on the one thing."
- The method: ask what customers do instead and what goes wrong. That is the book's "baseline" concept, turned into a research question.

**AI.** Shaping itself is being moved onto agents.
- `github.com/rjs/shaping-skills` **[verified — README read; commit dates not found]** holds Claude skills for:
  - `/framing-doc`, which turns transcripts into a framing document
  - `/shaping`
  - `/breadboarding`
  - `/kickoff-doc`
- It also has a hook that checks for ripple effects whenever a shaping document changes.
- His X posts, dated from the post IDs **[secondary: search-result text only; X blocks fetching]**:
  - 8 Jan 2026: says Claude Code can now one-shot "a reasonable breadboard."
  - 7 Feb 2026: says the skills' workflow "mirrors the human flow very closely."
  - 11 Feb 2026: says skills are good at how to do things but not at enforcing order, hence the hook.
- **What this shows [judgment]:** the author is using AI to speed up shaping, not to skip it.

### What teams report breaking (secondary)

**Customaite** (Alex Wauters, 9 Dec 2025, *2 years with Shape-Up, and why we switched back*):
- Projects were smaller than the cycle, so they had to plan months ahead.
- Appetite was applied inconsistently.
- Cool-down became a parking lot that urgent work ate.
- The rigidity crowded out technical design work.
- The root problem, unclear product direction, was never addressed.
- In their words: "we lost the flexibility to reprioritize every two weeks, but we didn't gain the benefit of deep, singular focus."

**Trustpair** (7 Feb 2023, *Why the ShapeUp method just wasn't for us*; the R&D team grew from 4–5 people to about 30):
- Review and QA piled up at the end of each cycle.
- Deadline pressure produced debt.
- Support work didn't fit the cool-down model, and "Support was seen as a punishment for developers."
- There was no guidance on scaling.

**Nathan Baschez** (*Shape Up for Startups*, 18 Sep 2019), adapting it for pre-launch teams:
- variable cycle lengths
- a short daily cool-down instead of an end-of-cycle one
- separate bets for shaping and for building
- everyone shapes and builds

**Pawel Brodzinski**, *Shape Up Won't Do Much for Product Teams*: the page returned an error and was not read **[not found]**.

**The pattern across these [judgment]:**
- Shape Up breaks at small scale in three places:
  - the cycle is longer than the work
  - cool-down absorbs reactive work
  - the end of the cycle becomes a quality bottleneck
- It does not break at shaping. Nobody reports that shaping made things worse. Singer reports that too little of it is the main failure.

### Continuous discovery (Torres)

- **No primary Torres text reconciling continuous discovery with Shape Up was found [not found].** Her Opportunity Solution Tree page (producttalk.org, updated 29 Sep 2026) doesn't mention Shape Up, appetite or cycles. **[verified]**
- **What she does say:**
  - Discovery reduces the risk of a bet, and the tree is updated as interviews accumulate **[verified]**.
  - Discovery and delivery are intertwined, not phases, and delivery is sometimes needed to test assumptions (Shortform summary of *Continuous Discovery Habits*, 6 Jan 2025) **[secondary]**.
  - AI is again putting "even more emphasis on Delivery" at the expense of asking whether we're building the right thing (ITX podcast episode page, 20 Jan 2026) **[secondary]**.
- **The reconciliation is therefore mine [judgment]:**
  - The tree is where frames come from. An opportunity branch plus evidence is a candidate.
  - Weekly interviews run on the shaping track, continuously, and don't stop for the cycle. This is the book's two-track model, with discovery as part of the shaping track.
  - A prototype built during shaping is an assumption test shown in those interviews.
  - Singer's "what do customers do instead" and the book's "baseline" are the same thing as a Torres opportunity, seen from the build side.

---

## 3. The AI-speed argument

Everything in this section is **[judgment]** unless tagged otherwise. The book predates AI and says nothing about it.

### The case that cycles should shrink

- **The book's reason for six weeks is about throughput.** Two weeks was "too short to get anything meaningful done" **[verified]**, for human builders in 2019. If an agent-equipped builder produces in about six days what a small team produced in six weeks, the same logic gives a much shorter cycle.
- **At seed, learning speed is what matters.** Three interviews a week produce new evidence faster than a six-week cycle can act on it. Customaite's failure (the cycle is longer than the work) is the failure you'd hit immediately.
- **Singer has already said six weeks is a maximum, not a rule.**

### The case that the constraint moves rather than shrinks

- **Agents compress the downhill, not the uphill.** Figuring out the approach, finding discovered tasks, and resolving how pieces interact is judgment work. So is contact with reality: real deal rooms, real documents, real users.
- **Verification doesn't compress at the same rate as generation.** For a trust product, every added surface area is added liability. An AI claim with wrong provenance is not a cosmetic bug; it is the product failing.
- **Customer behavior doesn't compress at all.** Investors do diligence on their own deal timelines. The 48-hour replay review and the next three interviews happen on the calendar, not at agent speed.
- **So the scarce resource is no longer engineer-weeks.** It is the Head of Product's shaping and verification attention, plus customer evidence.

### Compass's call

**Both are right about different things.**
- **The calendar shrinks:** two weeks, not six.
- **Appetite doesn't get smaller in meaning; it changes units.** It still answers "what is this problem worth?" But what it caps is no longer mainly build time. It caps how much surface area we are willing to frame, verify, and support. The same appetite now buys far more code than it used to, and that is the danger.
- **The risk being targeted flips:**
  - The book's circuit breaker protects against *not shipping*.
  - Ours must also protect against *shipping too much*.
  - Scope hammering is now aimed at over-building. "Could we ship without this?" becomes a question you ask of finished, working code the agent produced, not just of planned work.

**Why formalize at four people when the appendix says wing it?**
- **Agent throughput makes a four-person team produce like a much larger one.** The book solves two problems: direction (what to build, when to stop) and coordination (who does what). Direction problems scale with output, not headcount, so this team hits them early. Coordination problems scale with headcount, so this team doesn't have them yet.
- **Hence the split:** full discipline on shaping, betting and the circuit breaker; minimal ceremony everywhere else.
- **This team's specific failure mode is also a direction failure.** It has iterated in circles, and the fundraise needs progress that is legible.

### Where Recipe A's verify step sits

Verification sits in three places.

1. **Designed in shaping.** The package specifies the states matrix, the rubric additions for this feature, and the events. A critic with nothing specific to check just checks for generic polish.
2. **Run per scope during the cycle.** A scope isn't done until the builder's critic pass is clean: three breakpoints, every state, rubric scored, at most three rounds. This is the book's "QA is for the edges" **[verified]**: builders own basic quality, and the agent critic is how they own it. Your edge pass (day 7) covers the trust edge cases a rubric misses: conflicting documents, low-confidence extractions, a missing source.
3. **Read in cool-down.** The 48-hour flag-and-replay review of what shipped happens in the cool-down after the cycle.

Put this way, verification is inside "done means deployed," not a phase after it. That addresses Trustpair's end-of-cycle QA bottleneck, because quality is checked continuously, not at the end.

### What a pitch is when the prototype can exist before the table

**The danger has two parts:**
- **The prototype becomes a sunk cost.** "It already works, just ship it" skips the no-gos, the states and verification.
- **It becomes over-specified.** The book warns that wireframes are too concrete. A working prototype is more concrete still, and removes the latitude the builders need.

**The rule:**
- **Before the table, prototypes are evidence, not candidates.** Each one answers a named rabbit hole, or serves as an assumption test shown in an interview.
- **It lives on a throwaway branch and is never merged.**
- **The package cites what it proved.** The package still carries the breadboard and fat-marker level of solution, so the builders keep room to design.
- **Diverge in the right place.** Layout-level divergence (Recipe A's three directions) happens in shaping, because choosing the direction is part of making work "solved." Detail-level divergence happens inside scopes during the cycle.

---

## 4. The ruling: adopt, adapt, leave

**Adopt as written**
- Appetite instead of estimates; appetites start with a number and end with a design.
- Shaped work is rough, solved and bounded; breadboards and fat-marker sketches.
- Rabbit holes and no-gos, named in advance.
- Fixed time, variable scope; compare to baseline; scope hammering.
- The circuit breaker: no extension by default, and a clean slate.
- No central backlog; decentralized lists; "Interesting. Maybe some day."
- Assign projects, not tasks; scopes; one piece done first; done means deployed.
- Uninterrupted time, with one named exception (below).
- Feedback gets shaped before anyone acts on it.
- Declaring the mode (R&D, production, cleanup) at each table. DealReady's redesign starts in R&D mode.

**Adapt**
- **Cycle:** 6 weeks → 8 build days. Cool-down: 2 weeks → 2 days, repurposed for harness maintenance.
- **Appetites:** big batch = one cycle; small batch = 1–3 days; spike = 1 day or less, never ships.
- **Pitch → your `brief.md`**, in two parts: a frame (approval) and a package (clarity), after Singer 2022–2026.
- **Shaping:** Taylor shapes with agents (Singer's skills are a ready starting point), plus one technical shaping session with a builder per package, after Singer 2025.
- **Betting table:** two seats, plus a builder feasibility veto held asynchronously.
- **Hill charts:** keep the uphill/downhill vocabulary as a status on each Linear scope. Drop the chart tool.
- **QA for the edges → the verify step**, with the agent critic as the builders' basic-quality mechanism.
- **Bugs:** wait for cool-down, except a trust defect in production, which interrupts immediately.

**Leave**
- **Six-week cycles and two-week cool-downs.** They were sized to human throughput.
- **Choosing among many pitches.** It's a luxury at our scale, as Singer himself now says. Our table is usually "bet or don't bet on this package, and which small batches."
- **A separate shaping group and specialist teams.** We keep the separation of *phases*, not of people.
- **Builders "free to work on whatever they want" in cool-down.** Not at seed with a raise in flight. Pinned for after the raise.
- **A dedicated QA role**, and the Basecamp-specific tooling in Appendix 1.

---

## 5. DealReady cycle charter (v1, paste into the handbook)

> **DealReady cycle charter — v1, October 2026**
>
> **Why this exists.** We decide what a problem is worth before we build, we build it in a fixed time, and we stop. Agents make building cheap; this charter protects the expensive parts: deciding, verifying, and learning.
>
> **1. Rhythm.** Every two weeks: 8 build days (Monday of week 1 through Wednesday of week 2), then 2 cool-down days (Thursday–Friday). Betting table: Friday of cool-down, 45 minutes maximum. The next cycle starts Monday.
>
> **2. Appetites.** Three sizes only. *Big batch:* one full cycle, whole build team. *Small batch:* 1–3 build days, shipped inside the cycle. *Spike:* 1 day or less, answers one named question, never ships. Anything bigger is split into sequenced bets, each worth shipping on its own against today's baseline.
>
> **3. Mode.** Declared at every table: *R&D* (Head of Product and builder together; spike, don't ship; set the foundations), *Production*, or *Cleanup* (pre-launch only, one cycle maximum, unshaped).
>
> **4. The pitch is the brief.** `/specs/<feature>/brief.md`, in two parts.
> *Frame (approval, "Frame go"):* **Job:** the trigger, and what the user does today without this (the baseline). **User:** role, state, moment. **Metric:** which pre-named signal moves, by when, and the kill criterion. **Evidence:** the Opportunity Solution Tree branch and interview references, labeled. **Appetite.**
> *Package (clarity, "Bet"):* **Solution:** breadboard plus fat-marker sketches, one page. **Constraints:** design system only; provenance on every AI claim. **Rabbit holes:** each one with how it was resolved (spike, prototype, or decision). **Non-goals.** **States:** the required state matrix. **Verification & instrumentation:** rubric additions, events, flag name.
> A package with an empty field does not go to the table.
>
> **5. Shaping.** The Head of Product shapes on a parallel track during the cycle. Each package gets one technical shaping session with a builder, 90 minutes maximum, held in cool-down or a pre-booked slot. This is the only scheduled pull on builders mid-cycle. Prototypes before the table are evidence, not candidates: throwaway branch, never merged, and the question each one answered is written into the package.
>
> **6. Betting table.** Seats: **Kurt**, who has the last word on whether we bet, and **Head of Product**, who brings packages and owns scope inside a bet. Builders read packages at least 24 hours before the table; any builder can mark a package "not possible in this appetite," which sends it back to shaping, not to the table. Advisors feed framing; they don't hold seats. On the table: only packages posted this cycle, or deliberately revived. No backlog review. Output: the cycle plan (bets, people, mode), posted as a kickoff note the same day. If nothing is shaped, the answer is a spike cycle or cleanup, never an unshaped bet.
>
> **7. During the cycle.** Builders own the project. They create the scopes in Linear; nobody assigns tasks. Every scope is marked uphill or downhill; a scope that hasn't moved in 2 days is a raised hand. Day 4: a 10-minute async check, and anything still uphill gets hammered. No interruptions, with one exception: a trust defect in production (a wrong claim or wrong provenance shown to a user) is fixed immediately, and the bet's scope, not its date, absorbs it. Investor and demo requests go to the Head of Product as raw ideas.
>
> **8. Verification is inside the cycle.** No scope is done until its critic pass is clean (3 breakpoints, every state, rubric scored, 3 rounds maximum). After 3 failed prompts on the same problem: hand-edit, or log the design-system gap. Day 7: Head of Product edge pass on trust edge cases. Day 8: deploy.
>
> **9. Done means deployed.** In production, behind a flag, events firing, critic pass clean, enabled for at least one real deal room.
>
> **10. Circuit breaker.** At the end of day 8, unshipped work does not roll over. One extension of up to 2 days (it eats cool-down) is allowed only if every remaining scope is downhill and a must-have, and only once per bet. Otherwise the bet is killed and a one-paragraph lesson is logged. To come back, it is re-framed and re-shaped as a new pitch.
>
> **11. Cool-down, in this order.** (a) Written 30-minute readout of flags and replays on what shipped. (b) Harness maintenance: update `CLAUDE.md`, `DESIGN.md`, anti-patterns and the critic rubric from every failure this cycle. (c) Non-trust bugs and small reactive items. (d) Technical shaping session. (e) Betting table.
>
> **12. Discovery never stops.** Three customer conversations a week, on the Head of Product's track. The Opportunity Solution Tree is updated every cool-down. Interviews double as assumption tests for prototypes. Feedback never goes straight to builders; it goes to shaping.
>
> **13. Lists.** No central backlog. The Head of Product keeps pins; builders keep their own bug and tech lists; Kurt keeps his raw ideas. The default answer to a raw idea: "Interesting. Maybe some day." Important ideas come back.
>
> **14. Review.** This charter is reviewed after cycle 3. Changes go through the decision log.

**The same charter ports to Fybr [judgment].** Mike holds the last word, discovery is operator calls plus onboarding replays, and the circuit breaker is unchanged. It is not part of this ruling.

---

## 6. The displaced item

Two habits are retired:

- **The shared Linear priority list you and Kurt manage.** It is a central backlog by another name, and it is the mechanism that lets a team iterate in circles. Linear stays, demoted to the scope tracker inside a bet: one Linear project per bet, issues created by builders, Linear cycles set to two weeks. The planning list goes to zero. Kurt's ideas and your pins become decentralized lists, and they reach the table only as frames.
- **Turning review-meeting feedback into direction for engineers.** That is task assignment, and it is the book's "taskmaster" by another name. Feedback now goes to shaping. The weekly product/UI review becomes the cool-down demo plus the table, every two weeks.

**Net change:**
- Meetings drop from a weekly review to a biweekly demo plus a 45-minute table.
- List maintenance drops to zero.
- The consistent handoff format you wanted for the engineers already exists: it is the package. There is no separate handoff document.

---

## 7. Running the first betting table next week

Monday 12 October is Canadian Thanksgiving, so cycle 1 runs short.

- **Mon 5 – Wed 7 Oct:** frame one candidate from the Opportunity Solution Tree. It will likely be the first-trusted-insight path on a real deal room, in R&D mode. Run one 90-minute technical shaping session with a builder, and breadboard it (Singer's `/breadboarding` skill is a usable starting point).
- **Thu 8 Oct:** post the package, plus any small batches, for 24 hours of async builder review.
- **Fri 9 Oct:** betting table with Kurt, 45 minutes. Post the kickoff note.
- **Cycle 1:** Tue 13 – Wed 21 Oct (7 build days). Cool-down: Thu 22 – Fri 23 Oct.
- **Cycle 2:** starts Mon 26 Oct and runs the full 8 days.

**Before Friday, get one decision from Kurt:** that he is the last word on whether to bet, and you are the last word on scope inside a bet. Without that split, a two-person table has no way to break a tie.

---

## Sources

**Primary — the book** (read 30 Sep 2026)
- [Shape Up, table of contents](https://basecamp.com/shapeup)
- [Ch. 1 Introduction](https://basecamp.com/shapeup/0.3-chapter-01) · [Ch. 2 Principles of Shaping](https://basecamp.com/shapeup/1.1-chapter-02) · [Ch. 3 Set Boundaries](https://basecamp.com/shapeup/1.2-chapter-03) · [Ch. 4 Find the Elements](https://basecamp.com/shapeup/1.3-chapter-04) · [Ch. 5 Risks and Rabbit Holes](https://basecamp.com/shapeup/1.4-chapter-05) · [Ch. 6 Write the Pitch](https://basecamp.com/shapeup/1.5-chapter-06)
- [Ch. 7 Bets, Not Backlogs](https://basecamp.com/shapeup/2.1-chapter-07) · [Ch. 8 The Betting Table](https://basecamp.com/shapeup/2.2-chapter-08) · [Ch. 9 Place Your Bets](https://basecamp.com/shapeup/2.3-chapter-09)
- [Ch. 10 Hand Over Responsibility](https://basecamp.com/shapeup/3.1-chapter-10) · [Ch. 11 Get One Piece Done](https://basecamp.com/shapeup/3.2-chapter-11) · [Ch. 12 Map the Scopes](https://basecamp.com/shapeup/3.3-chapter-12) · [Ch. 13 Show Progress](https://basecamp.com/shapeup/3.4-chapter-13) · [Ch. 14 Decide When to Stop](https://basecamp.com/shapeup/3.5-chapter-14) · [Ch. 15 Move On](https://basecamp.com/shapeup/3.6-chapter-15) · [Conclusion](https://basecamp.com/shapeup/3.7-conclusion)
- [Appendix: Adjust to Your Size](https://basecamp.com/shapeup/4.1-appendix-02) · [Appendix: How to Begin to Shape Up](https://basecamp.com/shapeup/4.2-appendix-03) · [Glossary](https://basecamp.com/shapeup/4.5-appendix-06)

**Primary — Singer's later writing**
- [Framing (27 Apr 2022)](https://www.ryansinger.co/framing/)
- [Three "what about…?" questions (16 Aug 2023)](https://www.ryansinger.co/three-what-abouts/)
- [Shape Up is for features, not all development work (17 Aug 2021)](https://www.ryansinger.co/shape-up-is-for-features-not-all-development-work/)
- [We did all this discovery… now how do we decide? (12 Nov 2024)](https://www.ryansinger.co/discovery-how-to-decide/)
- [When engineers say "that'll take months!" (17 Apr 2025)](https://www.ryansinger.co/when-engineers-say-thatll-take-months/)
- [Common Pitfalls When Adopting Shape Up (28 Oct 2025)](https://www.ryansinger.co/pitfalls-when-adopting-shape-up/)
- [End-To-End with Shape Up: A Real-World Case Study (18 Nov 2025)](https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/)
- [What's the right level of detail when shaping? (6 Feb 2026)](https://www.ryansinger.co/whats-the-right-level-of-detail-when-shaping/)
- [rjs/shaping-skills (GitHub)](https://github.com/rjs/shaping-skills)

**Secondary**
- [Shapers & Builders podcast: Getting to Shape Up 2.0 (1 May 2023)](https://shapersbuilders.transistor.fm/episodes/getting-to-shape-up-2-0-ryan-singer-author-of-shape-up-founder-at-felt-presence/transcript)
- [Lenny's Podcast: A better way to plan, build, and ship products (30 Mar 2025)](https://www.lennysnewsletter.com/p/shape-up-ryan-singer)
- Singer on X, from search-result text only: [8 Jan 2026](https://x.com/rjs/status/2009270833009561643) · [7 Feb 2026](https://x.com/rjs/status/2020184536194428951) · [11 Feb 2026](https://x.com/rjs/status/2021558086025318482)
- [Customaite, 2 years with Shape-Up, and why we switched back (9 Dec 2025)](https://scalex.dev/blog/2-years-with-shape-up/)
- [Trustpair, Why the ShapeUp method just wasn't for us (7 Feb 2023)](https://jobs.trustpair.com/posts/why-the-shapeup-method-just-wasn-t-for-us)
- [Nathan Baschez, Shape Up for Startups (18 Sep 2019)](https://nathan.substack.com/p/shape-up-for-startups)
- [Product Talk, Opportunity Solution Trees (updated 29 Sep 2026)](https://www.producttalk.org/opportunity-solution-trees/) — primary for Torres, but silent on Shape Up
- [Shortform, Product Discovery and Delivery Are Intertwined (6 Jan 2025)](https://www.shortform.com/blog/product-discovery-and-delivery/)
- [ITX podcast 179, Teresa Torres: Is AI Re-Prioritizing Delivery Over Discovery (Again)? (20 Jan 2026)](https://itx.com/podcast/179-teresa-torres-is-ai-reprioritizing-delivery-over-discovery-again/)

**Not read:** [Pawel Brodzinski, Shape Up Won't Do Much for Product Teams](https://pawelbrodzinski.substack.com/p/shape-up-wont-do-much-for-product) (the page returned an error).
