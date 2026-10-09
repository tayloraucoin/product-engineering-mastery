/**
 * The record form's rules and built words (record-form.md). Pure, so the
 * words are tested without a browser; the form holds raw text and converts
 * only at save.
 */
import { normalizeClauses } from "../../../_lib/diff.ts";
import type {
  IsoDate,
  RecordBody,
  RecordId,
  RecordSummary,
  Status,
} from "../../../_lib/record.ts";
import type { RecordInput } from "../../../_lib/store.ts";

/** What the person edits, as typed. */
export interface FormValues {
  vendor: string;
  ownerId: string;
  status: Status;
  /** Raw text: "48,000", "-1,200", "". */
  annualValue: string;
  renewsOn: IsoDate | null;
  /** One clause per line. */
  terms: string;
}

export type FieldName = keyof FormValues;
export type FieldErrors = Partial<Record<FieldName, string>>;

/** Form order: the summary and the dirty dialog name fields in it. */
export const FIELD_ORDER: readonly FieldName[] = [
  "vendor",
  "ownerId",
  "status",
  "annualValue",
  "renewsOn",
  "terms",
];

/** The name a sentence uses ("Vendor name and Annual value."). */
export const FIELD_NAMES: Record<FieldName, string> = {
  vendor: "Vendor name",
  ownerId: "Owner",
  status: "Status",
  annualValue: "Annual value",
  renewsOn: "Renewal date",
  terms: "Terms",
};

export const ERROR_WORDS = {
  vendor: "Enter the vendor's name.",
  ownerId: "Choose an owner.",
  annualValue: "Enter a value of 0 or more.",
} as const;

export const NEW_VALUES: FormValues = {
  vendor: "",
  ownerId: "",
  status: "draft",
  annualValue: "",
  renewsOn: null,
  terms: "",
};

const GROUPED = new Intl.NumberFormat("en-US", { useGrouping: true });

/** A whole number of 0 or more, grouping commas allowed; otherwise null. */
export function parseAnnualValue(text: string): number | null {
  const bare = text.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(bare)) return null;
  const value = Number(bare);
  return Number.isSafeInteger(value) ? value : null;
}

/** "48000" reads back as "48,000"; text that does not parse stays as typed. */
export function formatAnnualValue(text: string): string {
  const value = parseAnnualValue(text);
  return value === null ? text : GROUPED.format(value);
}

export function validateField(
  field: FieldName,
  values: FormValues,
): string | undefined {
  switch (field) {
    case "vendor":
      return values.vendor.trim() === "" ? ERROR_WORDS.vendor : undefined;
    case "ownerId":
      return values.ownerId === "" ? ERROR_WORDS.ownerId : undefined;
    case "annualValue":
      return parseAnnualValue(values.annualValue) === null
        ? ERROR_WORDS.annualValue
        : undefined;
    default:
      return undefined;
  }
}

export function validateRecordInput(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of FIELD_ORDER) {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  }
  return errors;
}

/** "Owner", "Vendor name and Annual value", "Vendor name, Owner and Annual value". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** The separator after the i-th of n names in a sentence: ", ", " and " or ".". */
export function separatorAfter(i: number, n: number): string {
  if (i === n - 1) return ".";
  return i === n - 2 ? " and " : ", ";
}

/** The error summary's title and the named fields, in form order. */
export function summaryWords(fields: readonly FieldName[]): {
  title: string;
  names: string;
} {
  const n = fields.length;
  return {
    title: `${n} ${n === 1 ? "field needs" : "fields need"} a change before saving`,
    names: `${joinNames(fields.map((f) => FIELD_NAMES[f]))}.`,
  };
}

/** The dirty dialog's body for the changed fields. */
export function dirtyWords(fields: readonly FieldName[]): string {
  if (fields.length === 1)
    return `You changed ${FIELD_NAMES[fields[0]!]}. Leaving discards that change.`;
  return `You changed ${fields.length} fields. Leaving discards those changes.`;
}

function termsLines(terms: string): string[] {
  return normalizeClauses(terms.split("\n"));
}

/** The fields that differ from where the form started, in form order. */
export function changedFields(
  initial: FormValues,
  current: FormValues,
): FieldName[] {
  return FIELD_ORDER.filter((field) => {
    switch (field) {
      case "vendor":
        return initial.vendor.trim() !== current.vendor.trim();
      case "annualValue":
        return (
          initial.annualValue.replace(/[,\s]/g, "") !==
          current.annualValue.replace(/[,\s]/g, "")
        );
      case "terms":
        return (
          termsLines(initial.terms).join("\n") !==
          termsLines(current.terms).join("\n")
        );
      default:
        return initial[field] !== current[field];
    }
  });
}

/** An existing record as the form shows it: the newest version's clauses as lines. */
export function valuesFromRecord(
  summary: RecordSummary,
  body: RecordBody | undefined,
): FormValues {
  return {
    vendor: summary.vendor,
    ownerId: summary.ownerId,
    status: summary.status,
    annualValue: GROUPED.format(summary.annualValueUsd),
    renewsOn: summary.renewsOn,
    terms: (body?.versions[0]?.clauses ?? []).join("\n"),
  };
}

/** Valid values as the store's input. Terms are trimmed lines, empty lines dropped. */
export function toRecordInput(
  values: FormValues,
): Omit<RecordInput, "endedOn"> {
  return {
    vendor: values.vendor.trim(),
    ownerId: values.ownerId,
    status: values.status,
    annualValueUsd: parseAnnualValue(values.annualValue) ?? 0,
    renewsOn: values.renewsOn,
    clauses: termsLines(values.terms),
  };
}

/** The first free id from a fixed start, so a new record's id never depends on chance. */
export function nextRecordId(records: readonly RecordSummary[]): RecordId {
  const taken = new Set<string>(records.map((r) => r.id));
  for (let n = 0xa000; n <= 0xffff; n++) {
    const id = `rec_${n.toString(16)}` as RecordId;
    if (!taken.has(id)) return id;
  }
  throw new Error("No record id left");
}
