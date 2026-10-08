/**
 * The demo's one `?state=` registry and reader (D-DEMO-29), modelled on
 * `lib/sandbox/shared/state.ts`. A repeated, unknown or unregistered key reads
 * as absent, so the page renders its real data.
 *
 * Ships the universal keys only; each surface ticket adds its own to its file
 * under `surfaces/`.
 */
import { deleteDialog } from "./surfaces/delete-dialog.ts";
import { onboarding } from "./surfaces/onboarding.ts";
import { recordDetail } from "./surfaces/record-detail.ts";
import { recordForm } from "./surfaces/record-form.ts";
import { recordsTable } from "./surfaces/records-table.ts";
import { settings } from "./surfaces/settings.ts";
import type { DemoSurface } from "./surfaces/types.ts";

export type { DemoSurface } from "./surfaces/types.ts";

export const DEMO_SURFACES: Readonly<Record<string, DemoSurface>> = {
  [onboarding.id]: onboarding,
  [recordsTable.id]: recordsTable,
  [recordDetail.id]: recordDetail,
  [recordForm.id]: recordForm,
  [deleteDialog.id]: deleteDialog,
  [settings.id]: settings,
};

/** The registered `?state=` key for `surface`, or null. `raw` is the search param as Next hands it. */
export function readDemoState(
  raw: string | string[] | undefined,
  surface: string,
): string | null {
  if (typeof raw !== "string" || !Object.hasOwn(DEMO_SURFACES, surface))
    return null;
  return DEMO_SURFACES[surface]!.keys.includes(raw) ? raw : null;
}
