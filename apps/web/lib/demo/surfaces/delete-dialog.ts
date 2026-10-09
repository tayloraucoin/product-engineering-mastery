import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";
import type { DemoSurface } from "./types.ts";

export const deleteDialog: DemoSurface = {
  id: "delete-dialog",
  route: "/demo/records/[id]?dialog=delete",
  samplePath: `/demo/records/${HALVORSEN_ID}?dialog=delete`,
  keys: ["deleting", "error", "partial", "offline"],
};
