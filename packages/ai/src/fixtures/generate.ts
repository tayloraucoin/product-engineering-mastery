// Written by scripts/record.ts; edit only the input, then record again.
import type { Fixture } from "./fixture.ts";

export const generateFixture: Fixture = {
  case: "generate",
  promptVersion: "2026-10-04.1",
  model: "claude-opus-5-5",
  recordedOn: "2026-10-04",
  source: "synthetic",
  input:
    "The starter ships one package per concern: the database, sign-in, email, billing and AI each live in their own workspace package, and an app reaches a vendor only through that package. Each removable module has a runbook that deletes its files, variables and dependencies, and a check that fails if anything is left behind.",
  output:
    "The starter keeps each vendor behind its own package, and every removable module has a runbook and a check that proves it was removed cleanly.",
};
