import type { IsoDate } from "./record.ts";

/** The demo's only "now". Every relative word reads from it, so captures never drift. */
export const DEMO_TODAY: IsoDate = "2026-10-08";

const DAY_MS = 86_400_000;

function toUtcMs(iso: IsoDate): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

function unit(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** "3 days ago", "Yesterday", "Today", "in 12 days", counted from DEMO_TODAY. */
export function relativeDay(iso: IsoDate, today: IsoDate = DEMO_TODAY): string {
  const diff = daysBetween(iso, today); // positive = past
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === -1) return "Tomorrow";
  const abs = Math.abs(diff);
  const span =
    abs < 30
      ? unit(abs, "day")
      : abs < 365
        ? unit(Math.floor(abs / 30), "month")
        : unit(Math.floor(abs / 365), "year");
  return diff > 0 ? `${span} ago` : `in ${span}`;
}
