/**
 * Experiments in /admin (LAB-10, experiments.md, gap 4, D-LAB-24 to 26):
 * the list's rows, its order, the stale-data marker and the header line, and
 * one experiment's heading, status, marker and tabs. Pure: the configs come
 * from the registry and the counts from `listExperimentStats`, bound in
 * `admin-experiments-data.ts`; this file holds the rules and the words, so it
 * runs under `node --test`.
 *
 * Days since close count London calendar dates (D-LAB-41), from the config's
 * `closedOn` (D-LAB-25), never from a row or the UTC date. The marker shows
 * from the day of close. "Delete data" is an admin's only (D-LAB-26).
 */

import type { TeamRole } from "./team-check.ts";
import { SANDBOX_TIME_ZONE, todayIn } from "./time.ts";

/** What the list needs of a config: its registry fields, nothing loaded. */
export type ExperimentSummary = {
  slug: string;
  title: string;
  designs: readonly unknown[];
  closedOn: string | null;
};

/** One slug's counts, as `listExperimentStats` returns them. */
export type ExperimentCounts = {
  slug: string;
  codes: number;
  sent: number;
  lastActivityAt: Date | null;
  reviewersHoldingData: number;
};

export const EXPERIMENTS_WORDS = {
  heading: "Experiments",
  caption: "Experiments",
  columns: {
    title: "Title",
    status: "Status",
    designs: "Designs",
    reviewers: "Reviewers",
    lastActivity: "Last activity",
    dataHeld: "Data held",
  },
  open: "Open",
  closed: "Closed",
  missing: "—",
  deleteData: "Delete data",
  empty:
    "No experiments yet. Each one is a folder in the code; the demo experiment shows the shape.",
  error: "Couldn't load experiments. Reload the page.",
  partial: "Some counts didn't load. Reload to try again.",
  offline: "You're offline. This list may be out of date.",
  tabs: ["Results", "Reviewers", "Access codes", "Data"] as const,
} as const;

/** Whole days from one ISO date to another, by calendar, never by elapsed milliseconds. */
function calendarDaysBetween(from: string, to: string): number {
  const day = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y!, m! - 1, d!) / 86_400_000;
  };
  return Math.round(day(to) - day(from));
}

/** Days since `closedOn` by London's calendar at `now`: 0 on the day of close. */
export function daysSinceClose(closedOn: string, now: Date): number {
  return calendarDaysBetween(closedOn, todayIn(SANDBOX_TIME_ZONE, now));
}

/** "today", "1 day ago", "34 days ago": London calendar days. */
export function relativeDay(at: Date, now: Date): string {
  const days = calendarDaysBetween(
    todayIn(SANDBOX_TIME_ZONE, at),
    todayIn(SANDBOX_TIME_ZONE, now),
  );
  if (days <= 0) return "today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

const EXACT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SANDBOX_TIME_ZONE,
  timeZoneName: "short",
});

/** The exact time behind a relative date, for hover and focus. */
export function exactTime(at: Date): string {
  return EXACT.format(at);
}

/** `[ASSUMPTION]` singular and same-day forms, as the contract proposes. */
function closedAgo(days: number): string {
  if (days <= 0) return "closed today";
  return days === 1 ? "closed 1 day ago" : `closed ${days} days ago`;
}

/** "Holds data from 3 reviewers · closed 34 days ago" (experiments.md). */
export function staleMarkerText(reviewers: number, days: number): string {
  const who = reviewers === 1 ? "1 reviewer" : `${reviewers} reviewers`;
  return `Holds data from ${who} · ${closedAgo(days)}`;
}

/** "5 codes · 2 sent": codes made, reviewers with a version. */
export function reviewersText(codes: number, sent: number): string {
  return `${codes} ${codes === 1 ? "code" : "codes"} · ${sent} sent`;
}

export const experimentHref = (slug: string) => `/admin/experiments/${slug}`;
export const deleteDataHref = (slug: string) =>
  `/admin/experiments/${slug}/data`;

export type StaleMarker = {
  text: string;
  /** An admin's link to the experiment's Data tab; null for a developer. */
  deleteHref: string | null;
};

export type ExperimentRow = {
  slug: string;
  title: string;
  href: string;
  status: "Open" | "Closed";
  designs: number;
  /** "5 codes · 2 sent", or "—" when the counts failed. */
  reviewers: string;
  lastActivity: { relative: string; exact: string; at: string } | null;
  /** Null when there is nothing to mark: open, nothing held, or counts failed. */
  marker: StaleMarker | null;
  closedOn: string | null;
};

export type ExperimentsList = {
  rows: ExperimentRow[];
  /** "2 closed experiments still hold reviewers' data.", or null. */
  headerLine: string | null;
  /** The counts did not load: every count cell reads "—". */
  partial: boolean;
};

function marker(
  config: ExperimentSummary,
  counts: ExperimentCounts | undefined,
  role: TeamRole,
  now: Date,
): StaleMarker | null {
  if (config.closedOn === null || !counts || counts.reviewersHoldingData === 0)
    return null;
  return {
    text: staleMarkerText(
      counts.reviewersHoldingData,
      daysSinceClose(config.closedOn, now),
    ),
    deleteHref: role === "admin" ? deleteDataHref(config.slug) : null,
  };
}

function headerLine(stale: number): string | null {
  if (stale === 0) return null;
  return stale === 1
    ? "1 closed experiment still holds reviewers' data."
    : `${stale} closed experiments still hold reviewers' data.`;
}

/**
 * The list: open experiments first, latest activity first (none last), then
 * closed ones, latest close first. `stats` null means the counts failed: the
 * rows still list, with "—" for every count, and no header line.
 */
export function experimentRows(
  configs: readonly ExperimentSummary[],
  stats: readonly ExperimentCounts[] | null,
  role: TeamRole,
  now: Date,
): ExperimentsList {
  const bySlug = new Map((stats ?? []).map((s) => [s.slug, s]));
  const rows = configs.map((config): ExperimentRow => {
    const counts = bySlug.get(config.slug);
    const at = counts?.lastActivityAt ?? null;
    return {
      slug: config.slug,
      title: config.title,
      href: experimentHref(config.slug),
      status: config.closedOn === null ? "Open" : "Closed",
      designs: config.designs.length,
      reviewers: counts
        ? reviewersText(counts.codes, counts.sent)
        : EXPERIMENTS_WORDS.missing,
      lastActivity: at
        ? {
            relative: relativeDay(at, now),
            exact: exactTime(at),
            at: at.toISOString(),
          }
        : null,
      marker: marker(config, counts, role, now),
      closedOn: config.closedOn,
    };
  });
  rows.sort(compareRows);
  return {
    rows,
    headerLine: stats ? headerLine(rows.filter((r) => r.marker).length) : null,
    partial: stats === null,
  };
}

function compareRows(a: ExperimentRow, b: ExperimentRow): number {
  if (a.status !== b.status) return a.status === "Open" ? -1 : 1;
  if (a.status === "Open") {
    const at = (r: ExperimentRow) => r.lastActivity?.at ?? "";
    return at(b).localeCompare(at(a)) || a.title.localeCompare(b.title);
  }
  return (
    (b.closedOn ?? "").localeCompare(a.closedOn ?? "") ||
    a.title.localeCompare(b.title)
  );
}

export type ExperimentTab = { label: string; href: string };

/** Results, Reviewers, Access codes, Data: each its own route (R6, D-LAB-22). */
export function experimentTabs(slug: string): ExperimentTab[] {
  const base = experimentHref(slug);
  const [results, reviewers, codes, data] = EXPERIMENTS_WORDS.tabs;
  return [
    { label: results, href: base },
    { label: reviewers, href: `${base}/reviewers` },
    { label: codes, href: `${base}/codes` },
    { label: data, href: `${base}/data` },
  ];
}

export type ExperimentHeader = {
  title: string;
  status: "Open" | "Closed";
  marker: StaleMarker | null;
  tabs: ExperimentTab[];
};

export function experimentHeader(
  config: ExperimentSummary,
  stats: ExperimentCounts | null,
  role: TeamRole,
  now: Date,
): ExperimentHeader {
  return {
    title: config.title,
    status: config.closedOn === null ? "Open" : "Closed",
    marker: marker(config, stats ?? undefined, role, now),
    tabs: experimentTabs(config.slug),
  };
}

export type ExperimentLayoutDeps = {
  findExperiment(slug: string): ExperimentSummary | null;
  /** The one slug's counts, or null when they failed. Called only for a registered slug. */
  loadStats(slug: string): Promise<ExperimentCounts | null>;
};

/**
 * The `[slug]` layout's decision, after the team guard: an unregistered slug
 * is not-found before any database read; a registered one gets its header.
 */
export async function resolveExperimentHeader(
  deps: ExperimentLayoutDeps,
  slug: string,
  role: TeamRole,
  now: Date,
): Promise<
  { kind: "not-found" } | { kind: "found"; header: ExperimentHeader }
> {
  const config = deps.findExperiment(slug);
  if (!config) return { kind: "not-found" };
  const stats = await deps.loadStats(slug);
  return { kind: "found", header: experimentHeader(config, stats, role, now) };
}

/** The Experiments list's `?state=` keys (experiments.md), each registered as `team` in state.ts. */
export const EXPERIMENTS_STATE_KEYS = [
  "expts-empty",
  "expts-loading",
  "expts-error",
  "expts-partial",
  "expts-offline",
  "expts-success",
  "expts-stale",
  "expts-developer",
] as const;
export type ExperimentsStateKey = (typeof EXPERIMENTS_STATE_KEYS)[number];

export type ExperimentsView = {
  list: ExperimentsList | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
};

/** An ISO date `days` London days before `now`. */
function londonDaysBefore(now: Date, days: number): string {
  const [y, m, d] = todayIn(SANDBOX_TIME_ZONE, now).split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! - days)).toISOString().slice(0, 10);
}

/** Synthetic experiments and counts for the state keys; the slugs are invented. */
function fixtures(now: Date): {
  configs: ExperimentSummary[];
  stats: ExperimentCounts[];
} {
  const ago = (days: number, hours = 0) =>
    new Date(now.getTime() - (days * 24 + hours) * 3_600_000);
  const two = [{}, {}];
  return {
    configs: [
      {
        slug: "pricing-2026",
        title: "Pricing page, 2026",
        designs: two,
        closedOn: null,
      },
      {
        slug: "onboarding-2026",
        title: "Onboarding, 2026",
        designs: [{}, {}, {}],
        closedOn: null,
      },
      {
        slug: "checkout-2026",
        title: "Checkout, 2026",
        designs: two,
        closedOn: londonDaysBefore(now, 34),
      },
      {
        slug: "signup-2026",
        title: "Sign-up form, 2026",
        designs: two,
        closedOn: londonDaysBefore(now, 6),
      },
      {
        slug: "nav-2025",
        title: "Navigation, 2025",
        designs: two,
        closedOn: londonDaysBefore(now, 120),
      },
    ],
    stats: [
      {
        slug: "pricing-2026",
        codes: 5,
        sent: 2,
        lastActivityAt: ago(3),
        reviewersHoldingData: 5,
      },
      {
        slug: "onboarding-2026",
        codes: 3,
        sent: 0,
        lastActivityAt: ago(0, 2),
        reviewersHoldingData: 3,
      },
      {
        slug: "checkout-2026",
        codes: 4,
        sent: 3,
        lastActivityAt: ago(36),
        reviewersHoldingData: 3,
      },
      {
        slug: "signup-2026",
        codes: 2,
        sent: 2,
        lastActivityAt: ago(7),
        reviewersHoldingData: 2,
      },
      {
        slug: "nav-2025",
        codes: 0,
        sent: 0,
        lastActivityAt: null,
        reviewersHoldingData: 0,
      },
    ],
  };
}

/**
 * What the list shows for a `?state=` key that passed `readSandboxState`, or
 * null for the real page. `expts-developer` shows the developer's view
 * whatever the viewer's role; every other key shows the viewer's own.
 */
export function experimentsStateView(
  state: string | null,
  role: TeamRole,
  now: Date,
): ExperimentsView | null {
  const { configs, stats } = fixtures(now);
  const view = (list: ExperimentsList | null): ExperimentsView => ({
    list,
    loading: false,
    error: false,
    offline: false,
  });
  const fresh = configs.filter(
    (c) => c.closedOn === null || c.slug === "nav-2025",
  );
  switch (state as ExperimentsStateKey | null) {
    case "expts-empty":
      return view(experimentRows([], [], role, now));
    case "expts-loading":
      return { ...view(null), loading: true };
    case "expts-error":
      return { ...view(null), error: true };
    case "expts-partial":
      return view(experimentRows(configs, null, role, now));
    case "expts-offline":
      return {
        ...view(experimentRows(configs, stats, role, now)),
        offline: true,
      };
    case "expts-success":
      return view(experimentRows(fresh, stats, role, now));
    case "expts-stale":
      return view(experimentRows(configs, stats, role, now));
    case "expts-developer":
      return view(experimentRows(configs, stats, "developer", now));
    default:
      return null;
  }
}
