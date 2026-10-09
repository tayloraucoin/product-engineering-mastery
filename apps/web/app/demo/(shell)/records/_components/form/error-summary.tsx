"use client";

import { Fragment, type Ref } from "react";
import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@pem/ui/alert";

import {
  FIELD_NAMES,
  separatorAfter,
  summaryWords,
  type FieldName,
} from "../../_lib/record-input";
import { FIELD_IDS } from "./field-ids";

/**
 * The failed submit's summary (`role="alert"`, focusable). Each named field
 * is a link that moves focus to its control.
 */
export function ErrorSummary({
  fields,
  ref,
}: {
  fields: readonly FieldName[];
  ref: Ref<HTMLDivElement>;
}) {
  const { title } = summaryWords(fields);
  return (
    <Alert
      ref={ref}
      variant="destructive"
      tabIndex={-1}
      className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {fields.map((field, i) => (
          <Fragment key={field}>
            <a
              href={`#${FIELD_IDS[field]}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(FIELD_IDS[field])?.focus();
              }}
            >
              {FIELD_NAMES[field]}
            </a>
            {separatorAfter(i, fields.length)}
          </Fragment>
        ))}{" "}
        Nothing you entered is lost.
      </AlertDescription>
    </Alert>
  );
}
