import type { DemoSurface } from "./types.ts";
import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";

export const recordForm: DemoSurface = {
  id: "record-form",
  route: "/demo/records/[id]/edit",
  samplePath: `/demo/records/${HALVORSEN_ID}/edit`,
  keys: ["empty", "loading", "error", "partial", "offline"],
};
