import { ownerName } from "../../_lib/query";
import { formatDate } from "../../../../_lib/format";
import type { RecordSummary } from "../../../../_lib/record";

const VALUE = new Intl.NumberFormat("en-US", { useGrouping: true });

/** The Annual value (USD) cell: the unit is in the header. */
export function formatValue(amount: number): string {
  return VALUE.format(amount);
}

/** The Renews cell at 1440: "2 Nov 2026", "Ended 1 Aug 2026", "Not set". */
export function renewsWords(record: RecordSummary): string {
  if (record.renewsOn) return formatDate(record.renewsOn);
  if (record.endedOn) return `Ended ${formatDate(record.endedOn)}`;
  return "Not set";
}

/**
 * The 390 one-line meta, the only wording change D-DEMO-15 allows:
 * "Tomas Reyes · 7,250 USD · renews 2 Nov 2026".
 */
export function metaWords(record: RecordSummary, ownerLoaded: boolean): string {
  const owner = ownerLoaded ? ownerName(record.ownerId) : "Owner not loaded";
  const renews = record.renewsOn
    ? `renews ${formatDate(record.renewsOn)}`
    : record.endedOn
      ? `ended ${formatDate(record.endedOn)}`
      : "renewal not set";
  return `${owner} · ${formatValue(record.annualValueUsd)} USD · ${renews}`;
}

export function recordHref(record: RecordSummary): string {
  return `/demo/records/${record.id}`;
}
