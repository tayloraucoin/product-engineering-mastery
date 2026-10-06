---
title: "P-G — Measurement layer"
description: Commission when the first product instruments a feature, to turn the metrics templates into an enforced taxonomy with versioned definitions.
layer: prompts
status: draft
thread: P-G
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---

# P-G — Measurement layer

> **Stub — commission before running.** Renumbered from the Toolkit Map's primer 18 (`docs/research/toolkit/toolkit-map.md`, Appendix) per `conflicts.md` CF-29, with product names generalized. Sharpen the ask against the repo as it stands when you commission it.

**Model:** deepest available. **Inject:** Tally leads; engineering consulted for enforcement; Plumb captains. **Attach:** `00-shared-context`, the Tally role prompt, `docs/measurement/metrics/*.template.md`, `docs/runbooks/variant-testing.md`.

**Decision served.** The final formats for `events.md`, `definitions.md`, the metrics changelog and the readout and experiment templates, and the mechanism that rejects an unknown event before it ships.

**Ask.**

1. How PostHog, Segment and dbt MetricFlow name, version and deprecate events and metrics, dated.
2. Whether the house grammar (`object_action`, snake_case, past tense; CF-45) holds, or a versioned amendment to PostHog's `category:object_action`, present tense, is worth it. Both series are kept either way.
3. A versioning scheme that keeps both series of a changed metric.
4. Enforcement options compared: a typed registry, analytics-tool schema features, lint.

**Done criteria.** A build fails on an event name missing from `events.md`; a definition change without a changelog entry fails CI; a sample readout passes Tally's tests.

**Not wanted.** Dashboards, tool migrations, North Star debates (Compass owns those), statistics the scale cannot support.
