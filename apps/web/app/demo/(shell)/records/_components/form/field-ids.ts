import type { FieldName } from "../../_lib/record-input";

/** One form per page, so the control ids are fixed; the summary links to them. */
export const FIELD_IDS: Record<FieldName, string> = {
  vendor: "field-vendor",
  ownerId: "field-owner",
  status: "field-status",
  annualValue: "field-annual-value",
  renewsOn: "field-renews-on",
  terms: "field-terms",
};
