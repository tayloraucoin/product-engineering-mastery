import type {
  IsoDate,
  Owner,
  RecordBody,
  RecordId,
  RecordSummary,
  Status,
  Version,
} from "../record.ts";
import { deepFreeze } from "./freeze.ts";

/** Ids of the records the surfaces and the capture harness name. */
export const HALVORSEN_ID: RecordId = "rec_4a1d";
export const GREYFOLD_ID: RecordId = "rec_7be3";
export const KESTREL_ID: RecordId = "rec_2c90";
export const PELLOW_ID: RecordId = "rec_d815";

export const OWNERS: readonly Owner[] = deepFreeze([
  { id: "own_ana", name: "Ana Okafor" },
  { id: "own_tomas", name: "Tomas Reyes" },
  { id: "own_priya", name: "Priya Nair" },
  { id: "own_lena", name: "Lena Brandt" },
]);

const ANA = "Ana Okafor";
const TOMAS = "Tomas Reyes";

const HALVORSEN_CLAUSES = {
  scope: "Services are limited to the two depots named in Schedule A.",
  pay30: "Payment is due within 30 days of invoice.",
  pay45: "Payment is due within 45 days of invoice.",
  notice30: "Either party may end the agreement with 30 days written notice.",
  notice60: "Either party may end the agreement with 60 days written notice.",
  cap: "Liability is capped at the annual value of the agreement.",
  fuel: "A fuel surcharge applies when diesel exceeds the index price in Schedule B.",
};

const HALVORSEN_VERSIONS: Version[] = [
  {
    n: 4,
    on: "2026-10-05",
    by: ANA,
    summary: "Payment to 45 days, notice to 60 days, fuel surcharge added",
    clauses: [
      HALVORSEN_CLAUSES.scope,
      HALVORSEN_CLAUSES.pay45,
      HALVORSEN_CLAUSES.notice60,
      HALVORSEN_CLAUSES.cap,
      HALVORSEN_CLAUSES.fuel,
    ],
  },
  {
    n: 3,
    on: "2026-08-12",
    by: TOMAS,
    summary: "Liability cap set to annual value",
    clauses: [
      HALVORSEN_CLAUSES.scope,
      HALVORSEN_CLAUSES.pay30,
      HALVORSEN_CLAUSES.notice30,
      HALVORSEN_CLAUSES.cap,
    ],
  },
  {
    n: 2,
    on: "2026-02-03",
    by: TOMAS,
    summary: "Services limited to the two depots",
    clauses: [
      HALVORSEN_CLAUSES.scope,
      HALVORSEN_CLAUSES.pay30,
      HALVORSEN_CLAUSES.notice30,
    ],
  },
  {
    n: 1,
    on: "2025-03-14",
    by: ANA,
    summary: "First version of the terms",
    clauses: [HALVORSEN_CLAUSES.pay30, HALVORSEN_CLAUSES.notice30],
  },
];

const CLAUSE_POOL = [
  "The vendor delivers the services described in the order form.",
  "Invoices are paid within 30 days of receipt.",
  "Either party may end the agreement with 30 days written notice.",
  "Confidential information stays confidential for three years after the end.",
  "Prices are fixed for the first twelve months.",
  "The vendor keeps the services available at least 99.5 percent of each month.",
  "Disputes go to the named contacts first, then to mediation.",
];

interface Row {
  vendor: string;
  owner: string;
  status: Status;
  value: number;
  renewsOn: IsoDate | null;
  endedOn?: IsoDate;
  versions: number;
  id?: RecordId;
  lastChange?: { on: IsoDate; by: string };
}

// Synthetic vendors, in no particular order. `versions: 0` means no terms yet.
const ROWS: Row[] = [
  { vendor: "Halvorsen Freight", owner: "own_ana", status: "active", value: 48000, renewsOn: "2027-03-14", versions: 4, id: HALVORSEN_ID, lastChange: { on: "2026-10-05", by: ANA } },
  { vendor: "Greyfold Security", owner: "own_tomas", status: "active", value: 31500, renewsOn: "2027-01-20", versions: 2, id: GREYFOLD_ID },
  { vendor: "Kestrel Cloud Hosting", owner: "own_priya", status: "active", value: 126000, renewsOn: "2027-05-01", versions: 3, id: KESTREL_ID },
  { vendor: "Pellow Cleaning", owner: "own_lena", status: "expiring", value: 14400, renewsOn: "2026-11-02", versions: 2, id: PELLOW_ID },
  { vendor: "Ardent Payroll Services", owner: "own_ana", status: "active", value: 62000, renewsOn: "2027-02-10", versions: 3 },
  { vendor: "Bluewater Catering", owner: "own_lena", status: "expiring", value: 9800, renewsOn: "2026-10-30", versions: 1 },
  { vendor: "Caldera Print Works", owner: "own_tomas", status: "active", value: 7200, renewsOn: "2027-04-18", versions: 2 },
  { vendor: "Dunmore Legal Research", owner: "own_priya", status: "active", value: 54000, renewsOn: "2027-06-30", versions: 3 },
  { vendor: "Eastgate Courier", owner: "own_ana", status: "terminated", value: 11000, renewsOn: null, endedOn: "2026-06-30", versions: 2 },
  { vendor: "Fenwick Office Supplies", owner: "own_lena", status: "active", value: 18600, renewsOn: "2027-01-05", versions: 1 },
  { vendor: "Garnet Analytics", owner: "own_priya", status: "active", value: 87000, renewsOn: "2027-08-12", versions: 3 },
  { vendor: "Harbour Insurance Brokers", owner: "own_tomas", status: "expiring", value: 42000, renewsOn: "2026-11-15", versions: 2 },
  { vendor: "Ironbark Facilities", owner: "own_lena", status: "active", value: 73500, renewsOn: "2027-03-01", versions: 3 },
  { vendor: "Juniper Translation", owner: "own_ana", status: "draft", value: 6000, renewsOn: null, versions: 0 },
  { vendor: "Kiln Street Design", owner: "own_priya", status: "active", value: 24000, renewsOn: "2027-02-28", versions: 2 },
  { vendor: "Larkspur Training", owner: "own_tomas", status: "terminated", value: 8500, renewsOn: null, endedOn: "2026-03-31", versions: 1 },
  { vendor: "Marlow Fleet Leasing", owner: "own_ana", status: "active", value: 96000, renewsOn: "2027-09-01", versions: 3 },
  { vendor: "Northfield Recycling", owner: "own_lena", status: "active", value: 12900, renewsOn: "2027-01-31", versions: 1 },
  { vendor: "Orchard Telecom", owner: "own_priya", status: "expiring", value: 33000, renewsOn: "2026-12-01", versions: 2 },
  { vendor: "Pinecrest Staffing", owner: "own_tomas", status: "active", value: 101000, renewsOn: "2027-07-15", versions: 3 },
  { vendor: "Quarry Lane Storage", owner: "own_ana", status: "draft", value: 15000, renewsOn: null, versions: 1 },
  { vendor: "Redwater Pest Control", owner: "own_lena", status: "active", value: 3600, renewsOn: "2027-04-02", versions: 1 },
  { vendor: "Sable Audit Partners", owner: "own_priya", status: "active", value: 58000, renewsOn: "2027-05-20", versions: 2 },
  { vendor: "Tidewater Software", owner: "own_tomas", status: "active", value: 142000, renewsOn: "2027-10-01", versions: 3 },
  { vendor: "Umber Landscaping", owner: "own_lena", status: "terminated", value: 5400, renewsOn: null, endedOn: "2026-09-15", versions: 2 },
  { vendor: "Vantage Coffee Roasters", owner: "own_ana", status: "active", value: 4800, renewsOn: "2027-02-14", versions: 1 },
  { vendor: "Willowbrook Medical", owner: "own_priya", status: "active", value: 67000, renewsOn: "2027-06-10", versions: 3 },
  { vendor: "Xenon Lighting", owner: "own_tomas", status: "expiring", value: 21000, renewsOn: "2026-10-28", versions: 2 },
  { vendor: "Yarrow Bookkeeping", owner: "own_lena", status: "active", value: 16800, renewsOn: "2027-03-22", versions: 2 },
  { vendor: "Zephyr Air Filtration", owner: "own_ana", status: "active", value: 27500, renewsOn: "2027-05-05", versions: 1 },
  { vendor: "Alderley Web Studio", owner: "own_priya", status: "draft", value: 19000, renewsOn: null, versions: 0 },
  { vendor: "Brackenridge Security Patrol", owner: "own_tomas", status: "active", value: 39000, renewsOn: "2027-01-12", versions: 2 },
  { vendor: "Cobalt Data Backup", owner: "own_priya", status: "active", value: 45500, renewsOn: "2027-08-30", versions: 3 },
  { vendor: "Delmar Uniforms", owner: "own_lena", status: "terminated", value: 9100, renewsOn: null, endedOn: "2026-01-31", versions: 1 },
  { vendor: "Elmstead Event Rentals", owner: "own_ana", status: "expiring", value: 13200, renewsOn: "2026-11-20", versions: 1 },
  { vendor: "Foxglove Legal Printing", owner: "own_tomas", status: "active", value: 8800, renewsOn: "2027-04-25", versions: 1 },
  { vendor: "Glenrock Elevators", owner: "own_lena", status: "active", value: 35500, renewsOn: "2027-07-01", versions: 2 },
  { vendor: "Heron Marketing", owner: "own_priya", status: "active", value: 52500, renewsOn: "2027-09-15", versions: 2 },
  { vendor: "Inkwell Records Storage", owner: "own_ana", status: "active", value: 10200, renewsOn: "2027-02-03", versions: 1 },
  { vendor: "Jasper Water Services", owner: "own_tomas", status: "active", value: 22800, renewsOn: "2027-06-01", versions: 2 },
];

const ID_FOR_ROW = (i: number): RecordId =>
  `rec_${(0x2a00 + i * 0x137).toString(16).padStart(4, "0")}`;

const OWNER_NAME = new Map(OWNERS.map((o) => [o.id, o.name]));
const VERSION_DATES: IsoDate[] = ["2025-04-02", "2025-11-18", "2026-05-27"];

function generatedVersions(row: Row, index: number): Version[] {
  const versions: Version[] = [];
  const by = OWNER_NAME.get(row.owner)!;
  for (let n = 1; n <= row.versions; n++) {
    const size = 2 + n; // each version adds one clause
    const clauses = Array.from(
      { length: size },
      (_, k) => CLAUSE_POOL[(index + k) % CLAUSE_POOL.length]!,
    );
    versions.push({
      n,
      on: VERSION_DATES[n - 1]!,
      by,
      summary: n === 1 ? "First version of the terms" : "One clause added",
      clauses,
    });
  }
  return versions.reverse();
}

function build() {
  const index: RecordSummary[] = [];
  const bodies: Record<string, RecordBody> = {};
  ROWS.forEach((row, i) => {
    const id = row.id ?? ID_FOR_ROW(i);
    const versions =
      row.id === HALVORSEN_ID
        ? HALVORSEN_VERSIONS
        : generatedVersions(row, i);
    const newest = versions[0];
    index.push({
      id,
      vendor: row.vendor,
      ownerId: row.owner,
      status: row.status,
      annualValueUsd: row.value,
      renewsOn: row.renewsOn,
      endedOn: row.endedOn ?? null,
      versionCount: versions.length,
      lastChange: row.lastChange ??
        (newest
          ? { on: newest.on, by: newest.by }
          : { on: "2026-09-20", by: OWNER_NAME.get(row.owner)! }),
    });
    bodies[id] = { id, versions };
  });
  return { index, bodies };
}

const built = build();

/** The records index, 40 synthetic records, deep-frozen. */
export const FIXTURE_INDEX: readonly RecordSummary[] = deepFreeze(built.index);

/** The bodies, kept apart from the index (D-DEMO-20), keyed by record id. */
export const FIXTURE_BODIES: Readonly<Record<string, RecordBody>> = deepFreeze(
  built.bodies,
);
