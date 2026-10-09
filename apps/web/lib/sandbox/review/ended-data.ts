/**
 * The ended page's one read, bound to the request's world (LAB-21): the
 * reviewer's latest send's instant through @pem/db/sandbox. The rules are in
 * ended.ts. A failed read throws, to the app's error page.
 */

import "server-only";

import { latestSentAt } from "@pem/db/sandbox";

import type { ViewerResult } from "../shared/access-check.ts";
import { sandboxDb } from "../shared/access.ts";
import { endedPageWith, type EndedDeps, type EndedProps } from "./ended.ts";

const deps: EndedDeps = {
  latestSentAt: (viewer) => latestSentAt(sandboxDb(), viewer, {}),
};

export function endedPageFor(
  result: ViewerResult,
  stateKey: string | null,
): Promise<EndedProps | null> {
  return endedPageWith(deps, result, stateKey);
}
