import { DEMO_TODAY } from "./clock.ts";
import { clausesEqual, diffClauses, normalizeClauses } from "./diff.ts";
import { FIXTURE_BODIES, FIXTURE_INDEX } from "./fixtures/index.ts";
import type {
  IsoDate,
  RecordBody,
  RecordId,
  RecordSummary,
  Status,
  Version,
} from "./record.ts";

/** What the form edits. `clauses` are raw lines; the reducer normalizes them. */
export interface RecordInput {
  vendor: string;
  ownerId: string;
  status: Status;
  annualValueUsd: number;
  renewsOn: IsoDate | null;
  endedOn: IsoDate | null;
  clauses: string[];
}

export type DemoEvent =
  | { kind: "saved"; vendor: string; fields: string[]; created: boolean }
  | { kind: "deleted"; vendor: string };

export interface DemoState {
  /** The records index, in display order. */
  records: RecordSummary[];
  bodies: Record<string, RecordBody>;
  lastEvent: DemoEvent | null;
}

export type DemoAction =
  | { type: "create"; id: RecordId; input: RecordInput }
  | { type: "update"; id: RecordId; input: Partial<RecordInput> }
  | { type: "delete"; id: RecordId }
  | { type: "reset" };

const SCALAR_FIELDS = [
  "vendor",
  "ownerId",
  "status",
  "annualValueUsd",
  "renewsOn",
  "endedOn",
] as const;

export function initialDemoState(): DemoState {
  return {
    records: [...FIXTURE_INDEX],
    bodies: { ...FIXTURE_BODIES },
    lastEvent: null,
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "reset":
      return initialDemoState();

    case "delete": {
      const record = state.records.find((r) => r.id === action.id);
      if (!record) return state;
      const bodies = { ...state.bodies };
      delete bodies[action.id];
      return {
        records: state.records.filter((r) => r.id !== action.id),
        bodies,
        lastEvent: { kind: "deleted", vendor: record.vendor },
      };
    }

    case "create": {
      if (state.records.some((r) => r.id === action.id)) return state;
      const { clauses: rawClauses, ...fields } = action.input;
      const clauses = normalizeClauses(rawClauses);
      const versions: Version[] =
        clauses.length > 0
          ? [
              {
                n: 1,
                on: DEMO_TODAY,
                by: "you",
                summary: "First version of the terms",
                clauses,
              },
            ]
          : [];
      const summary: RecordSummary = {
        id: action.id,
        ...fields,
        versionCount: versions.length,
        lastChange: { on: DEMO_TODAY, by: "you" },
      };
      return {
        records: [summary, ...state.records],
        bodies: { ...state.bodies, [action.id]: { id: action.id, versions } },
        lastEvent: {
          kind: "saved",
          vendor: summary.vendor,
          fields: [],
          created: true,
        },
      };
    }

    case "update": {
      const record = state.records.find((r) => r.id === action.id);
      if (!record) return state;
      const body = state.bodies[action.id] ?? { id: action.id, versions: [] };
      const input = action.input;

      const changedFields: string[] = SCALAR_FIELDS.filter(
        (key) => key in input && input[key] !== record[key],
      );
      const next: Record<string, unknown> = { ...record };
      for (const key of changedFields)
        next[key] = input[key as (typeof SCALAR_FIELDS)[number]];

      const current = body.versions[0]?.clauses ?? [];
      const clauses =
        input.clauses === undefined ? current : normalizeClauses(input.clauses);
      const clausesChanged = !clausesEqual(current, clauses);

      let versions = body.versions;
      if (clausesChanged) {
        changedFields.push("clauses");
        const summary =
          current.length === 0
            ? "First version of the terms"
            : diffClauses(current, clauses).summary;
        versions = [
          {
            n: (body.versions[0]?.n ?? 0) + 1,
            on: DEMO_TODAY,
            by: "you",
            summary,
            clauses,
          },
          ...body.versions,
        ];
        next.versionCount = versions.length;
      }

      const event: DemoEvent = {
        kind: "saved",
        vendor: (next.vendor as string) ?? record.vendor,
        fields: changedFields,
        created: false,
      };
      if (changedFields.length === 0) return { ...state, lastEvent: event };

      next.lastChange = { on: DEMO_TODAY, by: "you" };
      return {
        records: state.records.map((r) =>
          r.id === action.id ? (next as unknown as RecordSummary) : r,
        ),
        bodies: { ...state.bodies, [action.id]: { id: action.id, versions } },
        lastEvent: event,
      };
    }
  }
}
