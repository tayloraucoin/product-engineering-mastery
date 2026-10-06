/**
 * The sandbox's one time zone (D-LAB-41). An experiment's `closedOn` is
 * checked against today here, and the confirmation email (LAB-20) formats its
 * times here with the zone named. The gate's lock time and the ended page's
 * date use the reader's own locale and zone instead.
 */
export const SANDBOX_TIME_ZONE = "Europe/London";

/**
 * The calendar date in `zone` at the instant `now`, as an ISO date
 * (`YYYY-MM-DD`). Never `now.toISOString()`: that is the UTC date, a day
 * behind London between midnight and 1am in British Summer Time.
 */
export function todayIn(zone: string, now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
