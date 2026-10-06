/**
 * Durations in milliseconds, so a timeout, a cache lifetime or an expiry reads
 * as `15 * MINUTE_MS` rather than a bare number. Every value is exact; a
 * calendar month or year is not a constant, so neither is here.
 */

export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
