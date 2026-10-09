/** The demo's data shapes (data-contract.md). Dates are ISO strings in state, never a Date. */

export type RecordId = `rec_${string}`; // rec_ plus 4 lowercase hex
export type IsoDate = string; // "2026-11-02"
export type Status = "active" | "expiring" | "draft" | "terminated";

export const STATUSES: readonly Status[] = [
  "active",
  "expiring",
  "draft",
  "terminated",
];

export interface Owner {
  id: string;
  name: string;
}

/** The records index (D-DEMO-20): names a record before its body loads. */
export interface RecordSummary {
  id: RecordId;
  vendor: string;
  ownerId: string;
  status: Status;
  annualValueUsd: number;
  renewsOn: IsoDate | null;
  endedOn: IsoDate | null;
  versionCount: number;
  lastChange: { on: IsoDate; by: string | "you" };
}

export interface Version {
  n: number;
  on: IsoDate;
  by: string;
  summary: string;
  clauses: string[];
}

/** Newest version first; an empty list means no terms yet. */
export interface RecordBody {
  id: RecordId;
  versions: Version[];
}

export interface DemoPrefs {
  v: 1;
  onboarded: boolean;
  compactRows: boolean;
  defaultSort: "vendor-asc" | "renews-asc" | "value-desc";
}

export function isRecordId(value: unknown): value is RecordId {
  return typeof value === "string" && /^rec_[0-9a-f]{4}$/.test(value);
}
