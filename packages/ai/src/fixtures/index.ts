/** Every case's recorded fixture, by case id. */

import type { CaseId } from "../models.ts";
import { chatFixture } from "./chat.ts";
import { extractFixture } from "./extract.ts";
import type { Fixture } from "./fixture.ts";
import { generateFixture } from "./generate.ts";

export type { Fixture };

export const FIXTURES: Record<CaseId, Fixture> = {
  extract: extractFixture,
  chat: chatFixture,
  generate: generateFixture,
};
