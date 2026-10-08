import type { IsoDate } from "./record.ts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const USD = new Intl.NumberFormat("en-US", { useGrouping: true });

/** "52,000 USD": en-US grouping plus the code. */
export function formatUsd(amount: number): string {
  return `${USD.format(amount)} USD`;
}

/**
 * "5 Oct 2026": en-GB `d MMM yyyy` in UTC. The month names are spelled out so
 * a newer ICU's "Sept" can never change a capture.
 */
export function formatDate(iso: IsoDate): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m! - 1]} ${y}`;
}

export function versionCountWords(count: number): string {
  if (count === 0) return "no versions yet";
  if (count === 1) return "its only version";
  return `all ${count} versions`;
}
