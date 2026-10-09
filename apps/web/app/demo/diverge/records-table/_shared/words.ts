import type { RecordSummary } from "../../../_lib/record";
import {
  formatValue,
  renewsWords,
} from "../../../(shell)/records/_components/table/cells";
import { ownerName } from "../../../(shell)/records/_lib/query";

/** The words every direction uses for a record's facts, so none invents its own. */
export function facts(record: RecordSummary) {
  return {
    owner: ownerName(record.ownerId),
    value: `${formatValue(record.annualValueUsd)} USD`,
    renews: renewsWords(record),
  };
}
