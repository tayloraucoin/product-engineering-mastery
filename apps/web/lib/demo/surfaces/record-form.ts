import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";
import type { DemoSurface } from "./types.ts";

/** One registry entry for both form routes; `/demo/records/new` reads the same keys. */
export const recordForm: DemoSurface = {
  id: "record-form",
  route: "/demo/records/[id]/edit",
  samplePath: `/demo/records/${HALVORSEN_ID}/edit`,
  keys: [
    "invalid",
    "submitting",
    "empty",
    "loading",
    "error",
    "partial",
    "offline",
    "dirty",
  ],
};
