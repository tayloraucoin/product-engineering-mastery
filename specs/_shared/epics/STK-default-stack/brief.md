---
epic: STK
status: draft
---

# Brief — The default stack and the new-project guide

> Framed in the Quartermaster thread of 2026-10-03 from Taylor's brain dump and his answers to the graded migration list. Evidence for every "today" claim is [`research/prior-repos-audit.md`](research/prior-repos-audit.md).

## Job

- **Trigger:** "I have a briefing for a new project. Duplicate the starter, switch off what this project does not use, set the brand, and let me start on the product."
- **Baseline:** each new product is started by copying the previous product and re-scoping it by hand. Conscious Connections was copied into Synapse this way. What goes wrong: fixes made in one repo never reach the others (the environment default was corrected in Synapse and stayed wrong in Conscious Connections); brand files are duplicated per app; project-specific code is carried along; and nothing lists which files to delete when a vendor is not used, so leftovers stay.

## User

- Taylor, usually working alone, directing a coding agent that does the duplication and configuration from a briefing. Occasionally a second developer joins and needs a local setup that does not depend on Taylor's accounts.

## Metric

- **Signal:** a qualitative bar, named plainly: a cold agent session, given only a briefing and the guide, produces a product repo that passes `yarn verify`, with every unused vendor removed and no file, variable or dependency of a removed vendor left behind.
- **By when:** the first real product started from the starter after this epic ships.
- **Kill criterion:** the first real port needs more hand repair than copying Synapse would have.

## Evidence

- Three product repos audited on 2026-10-03 (verified, read from the code): the same environment, database, auth, brand and component-workshop patterns were rebuilt three times, improving each time, with the improvements stranded in the newest repo.
- Counter-evidence: the starter's own rulings (EN-05, conventions rule 9) argue that nothing should exist before its first consumer, and a pre-built stack is code to maintain with no product exercising it. Taylor ruled on 2026-10-03 that a convention set in advance, even as a folder holding only a README, is better than one invented per project.

## Appetite

- Big batch: ten working days (Taylor, 2026-10-03), with the guide and the environment module first so a port is possible before the batch ends.

## Mode

- Production.

## Decision this unblocks

- Whether the next product starts from this repo instead of from a copy of Synapse, and whether the Phase 5 port dry-run tests "duplicate, then remove" in place of "copy selected pieces".

## Knowledge gaps

1. What does the API layer between the apps and the data do in the house stack, when is it the right tool and when is it more than a product needs? (`prompts/01-research-api-layer.md`)
2. Which error-monitoring tool should be the house default, given that product analytics is moving to PostHog? (`prompts/01-research-error-monitoring.md`)
3. How should users exist in a local database when sign-in runs on a hosted project, and what is the clean form of the mimicry the three repos patched in? (`prompts/01-research-local-auth-users.md`)
