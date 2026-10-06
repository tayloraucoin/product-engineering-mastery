// Written by scripts/record.ts; edit only the input, then record again.
import type { Fixture } from "./fixture.ts";

export const extractFixture: Fixture = {
  case: "extract",
  promptVersion: "2026-10-04.1",
  model: "claude-opus-5-5",
  recordedOn: "2026-10-04",
  source: "synthetic",
  input:
    "Met Ada Example at the trade fair; she runs partnerships at Example Widgets and asked us to write to ada@example.test.",
  output:
    '{"name":"Ada Example","email":"ada@example.test","company":"Example Widgets"}',
};
