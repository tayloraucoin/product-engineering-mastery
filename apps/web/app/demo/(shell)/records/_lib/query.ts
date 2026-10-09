import { OWNERS } from "../../../_lib/fixtures/index.ts";
import {
  STATUSES,
  type DemoPrefs,
  type RecordSummary,
  type Status,
} from "../../../_lib/record.ts";

/**
 * The table's URL (records-table.md): `?q=`, `?status=`, `?owner=` and
 * `?sort=<column>-<asc|desc>`. The URL is the only place filters and sort
 * live; the view reads them back from here on every render.
 */

export const SORT_COLUMNS = [
  "vendor",
  "owner",
  "status",
  "value",
  "renews",
] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];
export type SortDirection = "asc" | "desc";
export interface RecordsSort {
  column: SortColumn;
  direction: SortDirection;
}

export interface RecordsQuery {
  /** Vendor contains, case-insensitive; "" when absent. */
  q: string;
  status: Status | null;
  owner: string | null;
  /** Null when `?sort=` is absent: the prefs default applies. */
  sort: RecordsSort | null;
}

export type SearchParamsInput =
  URLSearchParams | Readonly<Record<string, string | string[] | undefined>>;

export const STATUS_LABELS: Readonly<Record<Status, string>> = {
  active: "Active",
  expiring: "Expiring",
  draft: "Draft",
  terminated: "Terminated",
};

const OWNER_NAMES: ReadonlyMap<string, string> = new Map(
  OWNERS.map((owner) => [owner.id, owner.name]),
);

export function ownerName(ownerId: string): string {
  return OWNER_NAMES.get(ownerId) ?? ownerId;
}

/** One value, or null when it is missing or repeated. */
function readOne(params: SearchParamsInput, key: string): string | null {
  if (params instanceof URLSearchParams) {
    const all = params.getAll(key);
    return all.length === 1 ? all[0]! : null;
  }
  const value = params[key];
  return typeof value === "string" ? value : null;
}

export function parseSort(raw: string | null): RecordsSort | null {
  if (raw === null) return null;
  const match = /^([a-z]+)-(asc|desc)$/.exec(raw);
  if (!match || !SORT_COLUMNS.includes(match[1] as SortColumn)) return null;
  return {
    column: match[1] as SortColumn,
    direction: match[2] as SortDirection,
  };
}

export function serializeSort(sort: RecordsSort): string {
  return `${sort.column}-${sort.direction}`;
}

/** Every param read tolerantly: an invalid value reads as absent. */
export function parseRecordsQuery(params: SearchParamsInput): RecordsQuery {
  const q = readOne(params, "q")?.trim() ?? "";
  const status = readOne(params, "status");
  const owner = readOne(params, "owner");
  return {
    q,
    status: STATUSES.includes(status as Status) ? (status as Status) : null,
    owner: owner !== null && OWNER_NAMES.has(owner) ? owner : null,
    sort: parseSort(readOne(params, "sort")),
  };
}

/** The sort in force: the URL's, else the prefs default. */
export function effectiveSort(
  query: RecordsQuery,
  defaultSort: DemoPrefs["defaultSort"],
): RecordsSort {
  return query.sort ?? parseSort(defaultSort)!;
}

export function hasFilters(query: RecordsQuery): boolean {
  return query.q !== "" || query.status !== null || query.owner !== null;
}

/** `?q=…&status=…&owner=…&sort=…`, absent values left out; "" when none. */
export function buildRecordsSearch(query: RecordsQuery): string {
  const params = new URLSearchParams();
  if (query.q !== "") params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.owner) params.set("owner", query.owner);
  if (query.sort) params.set("sort", serializeSort(query.sort));
  const search = params.toString();
  return search === "" ? "" : `?${search}`;
}

export function filterRecords(
  records: readonly RecordSummary[],
  query: RecordsQuery,
): RecordSummary[] {
  const needle = query.q.toLowerCase();
  return records.filter(
    (record) =>
      (needle === "" || record.vendor.toLowerCase().includes(needle)) &&
      (query.status === null || record.status === query.status) &&
      (query.owner === null || record.ownerId === query.owner),
  );
}

const COLLATOR = new Intl.Collator("en", { sensitivity: "base" });

/**
 * A stable sort with the vendor as the tie-break. A record with no renewal
 * date sorts after every dated one in both directions.
 */
export function sortRecords(
  records: readonly RecordSummary[],
  sort: RecordsSort,
): RecordSummary[] {
  const sign = sort.direction === "asc" ? 1 : -1;
  const byVendor = (a: RecordSummary, b: RecordSummary) =>
    COLLATOR.compare(a.vendor, b.vendor);
  const compare = (a: RecordSummary, b: RecordSummary): number => {
    switch (sort.column) {
      case "vendor":
        return sign * byVendor(a, b);
      case "owner":
        return (
          sign * COLLATOR.compare(ownerName(a.ownerId), ownerName(b.ownerId)) ||
          byVendor(a, b)
        );
      case "status":
        return (
          sign *
            COLLATOR.compare(
              STATUS_LABELS[a.status],
              STATUS_LABELS[b.status],
            ) || byVendor(a, b)
        );
      case "value":
        return sign * (a.annualValueUsd - b.annualValueUsd) || byVendor(a, b);
      case "renews": {
        if (a.renewsOn === b.renewsOn) return byVendor(a, b);
        if (a.renewsOn === null) return 1;
        if (b.renewsOn === null) return -1;
        return sign * (a.renewsOn < b.renewsOn ? -1 : 1);
      }
    }
  };
  return [...records].sort(compare);
}

/** The Sort select's options at 390: every column, both ways. */
export const SORT_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "vendor-asc", label: "Vendor, A to Z" },
  { value: "vendor-desc", label: "Vendor, Z to A" },
  { value: "owner-asc", label: "Owner, A to Z" },
  { value: "owner-desc", label: "Owner, Z to A" },
  { value: "status-asc", label: "Status, A to Z" },
  { value: "status-desc", label: "Status, Z to A" },
  { value: "value-desc", label: "Annual value, highest first" },
  { value: "value-asc", label: "Annual value, lowest first" },
  { value: "renews-asc", label: "Renews, soonest first" },
  { value: "renews-desc", label: "Renews, latest first" },
];

/** "40 records", or "12 of 40 records" while a filter is on. */
export function buildCountWords(
  shown: number,
  total: number,
  filtered: boolean,
): string {
  const noun = total === 1 ? "record" : "records";
  return filtered ? `${shown} of ${total} ${noun}` : `${total} ${noun}`;
}

/** `Vendor contains "Zephyr" and status is Terminated.`; "" with no filter. */
export function buildFilterWords(query: RecordsQuery): string {
  const parts: string[] = [];
  if (query.q !== "") parts.push(`vendor contains "${query.q}"`);
  if (query.status) parts.push(`status is ${STATUS_LABELS[query.status]}`);
  if (query.owner) parts.push(`owner is ${ownerName(query.owner)}`);
  if (parts.length === 0) return "";
  const joined =
    parts.length === 1
      ? parts[0]!
      : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`;
}
