import type { DemoSurface } from "./types.ts";
import { HALVORSEN_ID } from "../../../app/demo/_lib/fixtures/index.ts";

export const deleteDialog: DemoSurface = {
  id: "delete-dialog",
  route: "/demo/records/[id]?dialog=delete",
  samplePath: `/demo/records/${HALVORSEN_ID}?dialog=delete`,
  keys: ["error", "partial", "offline"],
};
