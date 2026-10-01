# Framer for marketing sites — Vitrine investigation

Sep 30, 2026 · Taylor Aucoin · Prompt 02 · Role: Vitrine (Lead Web Designer)

## Verdict

Framer is confirmed as the sanctioned tool for the DealReady marketing site and the Fybr self-serve landing, and rejected for both side-hustle tracks. It wins where a non-engineer must keep editing a small, high-craft site after handoff: content-editor seats at $10/mo, on-page editing, staging and branching on Pro, and as of September 2026 an agent your own Claude Code can drive through `npx @framer/agent`, every change landing on a branch. Its cost is lock-in: Framer does not export HTML for self-hosting, and its own help center contradicts itself on that point (both articles updated September 15, 2026). At seed scale that cost is small, because a 10-page site is now a one-day rebuild with a coding agent. The side hustle stays split: Durable for local service businesses (it bundles bookings, CRM and Google Business Profile work Framer lacks), coded Next.js for creative portfolios (ownership and authorship are the product you sell). Webflow is the one real challenger, on exit rights and CMS scale, but it is mid-pivot to a code-based platform (Source, limited research preview), which makes it the riskier bet this quarter.

The written line for DealReady: anything that touches accounts, product data, or plan logic is product and lives in the app repo; everything a stranger reads before signing up is marketing and lives in Framer (see the boundary ruling below).

## Framer fact sheet (as of September 30, 2026)

The textbook's "Framer AI" is gone as a product name: AI in Framer is now an in-editor Agent with a model picker, plus a bridge that lets outside agents edit the project. All rows are verified on framer.com today unless labeled.

| Area | What is true today | Label |
| --- | --- | --- |
| Agent | Updates copy, layout, styles, CMS, SEO metadata, alt text, responsive breakpoints and custom code components, keeping every change editable on the canvas. Models selectable: GPT, Sonnet, Opus, Fable, with reasoning levels ([Agents](https://www.framer.com/agents/)) | Verified |
| Skills | Launched September 22, 2026: saved instructions for design system, writing style or CMS workflow; can reference `@pages`, `@components`, `@styles`; travel with remixed projects ([Updates](https://www.framer.com/updates)) | Verified |
| External agents | Claude Code, Cursor, Codex, Antigravity connect via `npx @framer/agent setup` and a `/framer` skill; read and write canvas, components and CMS; can publish; every external-agent change lands on a branch. Listed as Preview, free during preview ([External agents](https://www.framer.com/agents/external/), [Pricing](https://www.framer.com/pricing)) | Verified |
| DESIGN.md | Framer's own agent page shows a DESIGN.md file used as a reference to restyle a site | Verified (vendor demo) |
| Localization | AI translation, up to 20 locales at $20 per locale per month | Verified |
| CMS | Basic: 2 collections, 1,000 items. Pro: 10 collections, 2,500 items, expandable to 40 and 40,000. New List field and inline editing for content editors shipped September 8, 2026 ([CMS List Field](https://www.framer.com/updates/cms-list-field)) | Verified |
| Hosting | Basic: 20 CDN locations, 50 GB. Pro: 300+ locations, 100 GB, redirects, staging, branching with previews. Advanced hosting add-on $200/mo for up to 6 rewrites and custom headers | Verified |
| Collaboration | Viewers free. Full editors $20/mo. Content editors $10/mo (CMS, localization, on-page editing). 10 seats max below Enterprise | Verified |
| A/B testing | Convert add-on: $50 per 500,000 events, up to 5 tests | Verified |
| Export and lock-in | One help article says no HTML export or self-hosting and sites cannot be downloaded as static bundles. A second, same update date, says every site can be downloaded and hosted anywhere. Treat as no export; CMS exports to CSV or JSON via plugins. Third-party scrapers exist ([no-export article](https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/), [portability article](https://www.framer.com/help/articles/porting-your-data-from-framer/)) | Verified contradiction |
| Pricing | Free $0 (non-commercial). Basic $10/mo, Pro $30/mo, both billed yearly; Enterprise custom. Credits for AI: 1,000/mo Basic, 3,000/mo Pro. Page caps 30 (Basic) and 150 (Pro, up to 700) | Verified |

Not found: a monthly-billed price for Basic and Pro (the page shows yearly), and any Framer-specific platform-wide Core Web Vitals figure. The "reasoning toggle" from the textbook now appears as per-model reasoning levels (the September 1 update names "Opus 5 Fast with Light reasoning").

## Why marketing sites are a different genre, and where Framer wins

A marketing site has a different job, owner, cadence and visitor than product UI, so it earns a different tool. The product helps a returning, signed-in user finish a task inside a system; the marketing site must convince a cold stranger on a phone in thirty seconds. The product is changed by engineers through review; the site is changed weekly by whoever owns the message. Product UI obeys the design system; the site spends expression the system would forbid (a bolder type moment, a hero image, one signature interaction).

| Test | Framer vs a coded Next.js site | Winner |
| --- | --- | --- |
| Thirty-second (cold phone visitor understands and acts) | Tool-neutral: it is a design outcome. Framer makes iteration on the hero and CTA cheaper for the owner, so the test gets re-run more often | Framer, narrowly |
| Two bars (mid-range phone, poor connection) | Coded wins on ceiling: you control every byte and ship zero JS on static pages. Framer server-renders, pre-renders, resizes images and serves from 300+ locations on Pro, but hydrates a React runtime on every page and makes heavy scroll animation one prompt away. Not measured this pass (see open items) | Coded, on ceiling; Framer, on floor for a non-engineer |
| Editability (owner changes things after handoff without breaking them) | Framer: content-editor role, inline CMS editing, on-page editing, staging, branches. Coded: every non-content change needs an engineer or an agent session in the repo | Framer, clearly |
| System fit (shares tokens and components with the product) | Coded site imports the product's tokens and components directly. Framer can only be told about them (a Skill or a DESIGN.md reference); drift is managed, not prevented | Coded |
| Exit (leaving later) | Coded: you own everything. Framer: no export; CMS via CSV/JSON plugins; rebuild from the published site | Coded |

What a non-technical owner can safely change in Framer: copy, images, CMS items (posts, case studies, FAQs, team), SEO fields, locales, and anything inside a component's exposed properties. What they can break: layout outside components, breakpoints, spacing, and any freeform canvas edit a full editor seat allows. The fix is structural: give the owner a content-editor seat, build every section as a component with limited properties, and keep the full editor seat with you.

Judgment: for sites under about 30 pages whose main risk is going stale, editability outweighs system fit and exit. That is both DealReady and Fybr today.

## Competitive set

Webflow is the only competitor that beats Framer on a dimension that matters for DealReady or Fybr; the rest win in genres we are not in.

**Webflow.** Beats Framer on exit and scale. Code export (HTML and CSS; CMS pages excluded, forms stop working) comes with the Core workspace at $19/mo yearly. Premium ($25/mo yearly) includes 20,000 CMS items and 40 collections, an MCP server on every plan, GSAP-based interactions, and Webflow Cloud to host Next.js or Astro apps on the same domain. Full seats cost $39/mo against Framer's $20. The catch: Webflow unveiled Source at Webflow Conf '26, a limited research preview where agents work directly on real code, and promises a supported migration path "when Source is ready" ([pricing](https://webflow.com/pricing), [Source](https://webflow.com/source); verified). Choosing Webflow now means choosing a platform whose own maker says the future is code.

**Coded site plus headless CMS.** Beats Framer on ownership, token sharing, git review and performance ceiling, and it is where your agent conventions already work. The cost is that every design change needs an engineer. Sanity has a free tier suitable for a small team; Payload is MIT and self-hosted, but Payload Cloud has paused new projects since Figma acquired it in June 2025 (secondary, several 2026 sources). Right when the builder is also the long-term maintainer.

**Wix Studio and Wix Harmony.** Beats Framer on field speed: Wix posts the highest mobile Core Web Vitals pass rate of the major builders, 80.7% of origins in May 2026 CrUX data, versus Squarespace 70.2% and Webflow 68.9% (secondary, [PageSpeed Matters](https://www.pagespeedmatters.com/resources/guides/wordpress-vs-webflow-vs-squarespace-speed-comparison) citing HTTP Archive). Harmony, the AI builder launched January 21, 2026, has no CMS yet, and Wix sites cannot leave Wix hosting (secondary). Right for a small business that needs bookings or a store; wrong for an authored brand.

**Squarespace.** Beats Framer for an owner with no designer who wants a template that holds its shape. Prices rose on July 6, 2026: Basic $19, Core $29, Plus $49 a month billed yearly (secondary, consistent across three sources). Loses on authorship and on AI depth.

**Durable.** Beats Framer for local service businesses. Launch is $25/mo ($22 yearly) and bundles custom domain, bookings, a CRM, an AI lead-reply agent, a blog agent, Google Business Profile work and directory listings; Grow is $49/mo ($41 yearly). No HTML editing ([pricing](https://durable.com/pricing), verified). Loses badly on design control.

**2026 AI-native entrants.** The category's real new competitor is the coding agent itself: Framer's own comparison pages now list Claude Code, Codex, Lovable, v0 and Replit ([pricing page footer](https://www.framer.com/pricing), verified). Source by Webflow is the most serious new platform but is invitation-only. Figma Sites is still labeled beta with a basic CMS (secondary). None of them beats Framer for a non-engineer-maintained marketing site this quarter.

## Boundary ruling: marketing site vs product surface

A page is marketing, and lives in Framer, only if a stranger can use it with no account, no product data, and no logic the product also runs. It becomes a product surface, and lives in the app repo, the moment any one of these is true:

1. It creates, reads or checks an account: signup, login, SSO, invite acceptance, "try it on your data room."
2. It computes something billing or the product also computes: seat or usage pricing, a live plan picker, a risk-score demo.
3. It must render real product components to be truthful: an interactive demo of the diligence table or the provenance panel.
4. It holds per-visitor state beyond a form submission.
5. It would need a product engineer to change it more than once a month.

Domain rule: Framer serves `dealready.com`; the product serves `app.dealready.com`; every CTA that starts an account deep-links into the app. Do not buy Framer's $200/mo rewrite add-on to put app routes under the marketing domain at seed stage.

| DealReady surface | Where it lives | Why |
| --- | --- | --- |
| Home, how it works, security overview, about, blog, changelog | Framer | Content only; owner edits weekly |
| Book a demo or join waitlist | Framer form to the CRM | Sends to sales, never to the product database |
| Pricing page with fixed plan cards | Framer | Prices are copy, changed rarely |
| Pricing with seats, usage or checkout | App repo | Plan logic must match billing (rule 2) |
| Signup, login, trial, "upload a data room" | App repo | Touches accounts and confidential data (rule 1) |
| Interactive product demo or calculator | App repo, linked or embedded from the app | Needs real components or logic (rules 2 and 3) |
| Trust and compliance claims | Framer, with every claim approved by whoever owns compliance | Content, but a false claim is a trust failure on a trust product |

Gray-zone rule: when unsure, build it in the app and link to it. Moving a page from the app to Framer later is cheap; untangling a product flow out of a site builder is not.

## Verdict per use case

Two Framer sites, two non-Framer tracks; prices are USD per month, billed yearly unless noted.

| Use case | Tool | Why | Cost | Handoff to a non-engineer | Switch when |
| --- | --- | --- | --- | --- | --- |
| DealReady marketing site | Framer Pro | Small, high-craft site that someone other than you must keep current; staging and branches protect a trust brand from a bad edit | $30 site + $10 per content editor = about $40 | Owner gets a content-editor seat; every section is a component with limited properties; a Framer Skill carries DealReady's voice, type and banned patterns; you keep the full editor seat | Pricing gains live plan logic; the home page needs a real product demo; the site passes 150 pages; Framer confirms or tightens the no-export policy and raises prices |
| Fybr self-serve landing and pricing | Framer Pro | Operators arrive from Google, so the CMS carries one page per segment (pulp mills, sawmills, pellet plants); Mike already works with Claude, and external agents let him change the site on a branch | $30 | Mike is workspace owner; content through the CMS; any agent edit reviewed on its branch before publish | Pricing needs live plan logic or checkout (move it to the app); Fybr wants shared components with the product; Pro's redirects cannot cover the legacy site's URLs |
| Side hustle, local-business track | Durable Launch | The client needs bookings, lead replies, a CRM and Google Business Profile work more than design; Durable bundles all of them and the owner edits by chatting to it | $25 monthly or $22 yearly, paid by the client | Client owns the account and billing from day one | Your revised ICP (niches where the site drives the decision) starts losing deals on looks: pilot a higher-priced tier then, but not on Framer by default |
| Side hustle, coded creative track | Next.js on your client boilerplate | Ownership, authorship and a style guide are what the $2,000 offer sells; the Vitrine process, review layer and agent conventions already run here | Hosting per client, not re-verified this pass | Self-edit guide plus the $500 admin-panel add-on | More than a third of clients buy the admin panel or send routine content edits back to you: then add a Framer tier for content-heavy clients |

For clients, in their words: Framer is "a site your team can update without calling a developer"; Durable is "your website, booking calendar and lead inbox in one bill"; the coded track is "a site that is yours outright, built to your taste, that no platform can reprice."

## Convergence tests run

I ran the tests against Framer's documented behavior and its own agent examples, not against rendered client sites; the two-bars test is still owed.

| Test | Finding | Status |
| --- | --- | --- |
| Template | Framer's own agent example prompts include a testimonials carousel, a 2x3 grid of feature cards, a liquid-gradient hero shader, parallax, scroll-triggered fade-ins and a launch countdown timer. Left alone, the agent reaches for our banned slop tells and manufactured urgency | Fails by default; passes only with a Skill that bans them by name |
| Swap | Marketplace templates invite a site that could belong to any seed-stage SaaS | Start from a blank canvas and the DESIGN.md Skill, never from a template |
| Editability | Content-editor seats, inline CMS editing (September 8, 2026) and branches cover the owner's real edits; freeform layout edits are where sites break | Passes with component-only sections and seat discipline |
| Thirty-second | Tool-neutral; depends on the hero and CTA we design | Not applicable to the tool |
| Two bars | My PageSpeed Insights run against framer.com was rate-limited (HTTP 429), and I found no platform-wide CrUX figure for Framer. A 50-site sample by a Framer agency reports 74% passing all three Core Web Vitals ([FramerLab](https://www.framerlab.dev/insights/framer-core-web-vitals-benchmark); secondary, small, likely favorable sample) | Unverified: measure before launch |
| Trace | Every verdict row traces to a verified price or feature, or is labeled judgment | Passes |

## Assumptions and open items

- [ ] Measure two bars before committing: run PageSpeed Insights (mobile) on three live Framer sites of similar weight, and check the Core Web Vitals Technology Report dashboard filtered to Framer. Budget: LCP under 2.5 s at p75.
- [ ] Ask Framer support which export article is current, in writing, and file the answer with the DealReady vendor list.
- [ ] Confirm who edits the DealReady site after handoff. [ASSUMPTION: Kurt or a future marketer, on one content-editor seat.]
- [ ] Confirm what fybrsolutions.com runs on and whether the self-serve landing sits on it, a subdomain, or a new domain. [ASSUMPTION: a new Framer site with redirects from any legacy URLs.]
- [ ] Confirm whether Fybr pricing is fixed cards or live plan logic; the boundary ruling decides where it lives.
- [ ] Re-verify Vercel hosting cost for coded-track clients; not checked this pass.
- [ ] Revisit Webflow when Source leaves research preview; its code-first direction could change the exit calculus.

[ASSUMPTION: all prices in USD, yearly billing, as shown on vendor pages September 30, 2026. Durable's client fee in your offer is quoted in CAD.]

## Sources

All pages opened September 30, 2026.

Primary

- [Framer pricing](https://www.framer.com/pricing)
- [Framer updates](https://www.framer.com/updates), including [Skills](https://www.framer.com/updates/skills) (September 22, 2026) and [CMS List Field](https://www.framer.com/updates/cms-list-field) (September 8, 2026)
- [Framer Agents](https://www.framer.com/agents/)
- [Framer External Agents](https://www.framer.com/agents/external/)
- [Framer help: Can I export my website to HTML and self-host it?](https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/) (updated September 15, 2026)
- [Framer help: Porting your data from Framer](https://www.framer.com/help/articles/porting-your-data-from-framer/) (updated September 15, 2026)
- [Webflow pricing](https://webflow.com/pricing)
- [Source by Webflow](https://webflow.com/source)
- [Durable pricing](https://durable.com/pricing)

Secondary

- [PageSpeed Matters: WordPress vs Webflow vs Squarespace speed comparison](https://www.pagespeedmatters.com/resources/guides/wordpress-vs-webflow-vs-squarespace-speed-comparison), citing HTTP Archive CrUX, May 2026
- [FramerLab: Framer Core Web Vitals benchmark](https://www.framerlab.dev/insights/framer-core-web-vitals-benchmark), 50-site sample, first half of 2026
- [Top Site Hosters: Squarespace price increase](https://topsitehosters.com/blog/squarespace-is-raising-prices-by-up-to-26-heres-what-it-costs-you/), effective July 6, 2026
- [Wix Expert Studio: What is Wix Harmony](https://www.wixexpertstudio.com/post/what-is-wix-harmony-2026)
- [Wayf: Sanity vs Payload](https://wayf.ai/blog/sanity-vs-payload/), July 2026
- [Hedrick: Framer vs Figma in 2026](https://hedrick.io/post/framer-vs-figma), on Figma Sites' CMS
