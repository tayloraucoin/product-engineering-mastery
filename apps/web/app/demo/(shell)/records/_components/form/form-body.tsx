"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info, TriangleAlert, WifiOff } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@pem/ui/alert";
import { Button } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";
import { DatePicker } from "@pem/ui/date-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@pem/ui/field";
import { Input } from "@pem/ui/input";
import { NativeSelect, NativeSelectOption } from "@pem/ui/native-select";
import { Textarea } from "@pem/ui/textarea";

import {
  changedFields,
  dirtyWords,
  FIELD_ORDER,
  formatAnnualValue,
  nextRecordId,
  toRecordInput,
  validateField,
  validateRecordInput,
  type FieldErrors,
  type FieldName,
  type FormValues,
} from "../../_lib/record-input";
import { ConfirmDialog } from "../../../_components/confirm-dialog";
import { useDemoStore } from "../../../../_components/demo-store";
import { STATUS_LABELS } from "../../../../_components/status-badge";
import { OWNERS } from "../../../../_lib/fixtures/index";
import { formatDate } from "../../../../_lib/format";
import { STATUSES, type IsoDate, type RecordId } from "../../../../_lib/record";
import { ErrorSummary } from "./error-summary";
import { FIELD_IDS } from "./field-ids";
import { FormActions } from "./form-actions";
import { useLeaveGuard } from "./use-leave-guard";

const NOTICE_ID = "record-form-notice";

function toDate(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

function toIso(date: Date): IsoDate {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** Where a designed state starts: `invalid` and `dirty` carry the canvas's edits. */
function seedValues(
  state: string | null,
  mode: "new" | "edit",
  initial: FormValues,
): FormValues {
  if (state === "invalid" && mode === "edit")
    return { ...initial, vendor: "", annualValue: "-1,200" };
  if (state === "dirty") return { ...initial, annualValue: "52,000" };
  return initial;
}

export interface FormBodyProps {
  mode: "new" | "edit";
  recordId: RecordId | null;
  /** Where the form started; dirtiness is measured against it. */
  initial: FormValues;
  state: string | null;
  termsHelper: string;
  /** Where Cancel goes: the detail on edit, the records on new. */
  backHref: string;
  titleId: string;
}

export function FormBody({
  mode,
  recordId,
  initial,
  state,
  termsHelper,
  backHref,
  titleId,
}: FormBodyProps) {
  const router = useRouter();
  const { state: store, dispatch } = useDemoStore();

  const [values, setValues] = useState(() => seedValues(state, mode, initial));
  const [errors, setErrors] = useState<FieldErrors>(() =>
    state === "invalid"
      ? validateRecordInput(seedValues(state, mode, initial))
      : {},
  );
  const [erred, setErred] = useState<FieldName[]>(() =>
    FIELD_ORDER.filter((f) => errors[f]),
  );
  const [submitted, setSubmitted] = useState(state === "invalid");
  const [focusTick, setFocusTick] = useState(0);
  const [pending, setPending] = useState(state === "submitting");
  const pendingRef = useRef(state === "submitting");
  const [saveFailed, setSaveFailed] = useState(state === "error");
  const [partial, setPartial] = useState(state === "partial");
  const offline = state === "offline";
  const [leaveTo, setLeaveTo] = useState<string | null>(
    state === "dirty" ? backHref : null,
  );
  const [leaving, setLeaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const changed = changedFields(initial, values);
  const dirty = changed.length > 0;
  const held = pending || partial || offline;
  const failing = FIELD_ORDER.filter((f) => errors[f]);

  useEffect(() => {
    if (focusTick > 0) summaryRef.current?.focus();
  }, [focusTick]);

  function requestLeave(href: string) {
    if (dirty) setLeaveTo(href);
    else router.push(href);
  }

  useLeaveGuard(dirty && !pending && !leaving, setLeaveTo);

  function update<K extends FieldName>(field: K, value: FormValues[K]) {
    if (pendingRef.current) return;
    const next = { ...values, [field]: value };
    setValues(next);
    // Live only once the field has erred (submit first).
    if (erred.includes(field))
      setErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current || partial || offline) return;
    const found = validateRecordInput(values);
    const bad = FIELD_ORDER.filter((f) => found[f]);
    if (bad.length > 0) {
      setErrors(found);
      setErred((prev) => [...new Set([...prev, ...bad])]);
      setSubmitted(true);
      setFocusTick((n) => n + 1);
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setSaveFailed(false);
    // Writes resolve on the next tick, so the pending UI renders.
    setTimeout(() => {
      const input = toRecordInput(values);
      let id: RecordId;
      if (mode === "new" || !recordId) {
        id = nextRecordId(store.records);
        dispatch({ type: "create", id, input: { ...input, endedOn: null } });
      } else {
        id = recordId;
        // `empty` shows a blank Terms over real ones; leaving it blank keeps them.
        const { clauses, ...rest } = input;
        dispatch({
          type: "update",
          id,
          input: state === "empty" && clauses.length === 0 ? rest : input,
        });
      }
      router.push(`/demo/records/${id}?state=saved`);
    }, 0);
  }

  function describe(field: FieldName, ...extra: (string | undefined)[]) {
    const ids = [
      errors[field] ? `${FIELD_IDS[field]}-error` : undefined,
      ...extra,
    ];
    const joined = ids.filter(Boolean).join(" ");
    return joined || undefined;
  }

  function fieldError(field: FieldName) {
    const error = errors[field];
    return error ? (
      // The summary is the one alert; a field's error is read through aria-describedby.
      <FieldError id={`${FIELD_IDS[field]}-error`} role={undefined}>
        {error}
      </FieldError>
    ) : null;
  }

  const inputDim = pending ? "opacity-50" : undefined;

  return (
    <>
      <form
        noValidate
        onSubmit={onSubmit}
        aria-labelledby={titleId}
        aria-busy={pending || undefined}
        className="mt-8 flex flex-col gap-8"
      >
        {partial ? (
          <Alert id={NOTICE_ID}>
            <Info aria-hidden="true" />
            <AlertTitle>Owner and Status did not load</AlertTitle>
            <AlertDescription>
              Save is held until they load, so nothing is overwritten.
            </AlertDescription>
            <AlertAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPartial(false)}
              >
                Retry
              </Button>
            </AlertAction>
          </Alert>
        ) : null}
        {offline ? (
          <Alert id={NOTICE_ID}>
            <WifiOff aria-hidden="true" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Your changes stay on this page until you leave or reload. Save is
              off until you reconnect.
            </AlertDescription>
          </Alert>
        ) : null}
        {submitted && failing.length > 0 ? (
          <ErrorSummary ref={summaryRef} fields={failing} />
        ) : null}

        <Field>
          <FieldLabel htmlFor={FIELD_IDS.vendor} className={inputDim}>
            Vendor name
          </FieldLabel>
          <Input
            id={FIELD_IDS.vendor}
            value={values.vendor}
            placeholder="The vendor's trading name"
            readOnly={pending}
            aria-invalid={errors.vendor ? true : undefined}
            aria-describedby={describe("vendor")}
            onChange={(e) => update("vendor", e.target.value)}
            className={inputDim}
          />
          {fieldError("vendor")}
        </Field>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-4">
          <Field data-disabled={partial || undefined}>
            <FieldLabel htmlFor={FIELD_IDS.ownerId} className={inputDim}>
              Owner
            </FieldLabel>
            <NativeSelect
              id={FIELD_IDS.ownerId}
              value={partial ? "" : values.ownerId}
              disabled={partial}
              aria-invalid={errors.ownerId ? true : undefined}
              aria-describedby={partial ? NOTICE_ID : describe("ownerId")}
              onChange={(e) => update("ownerId", e.target.value)}
              className={cn(
                "w-full",
                (partial || values.ownerId === "") &&
                  "[&_select]:text-muted-foreground",
                partial && "[&_select]:italic",
                inputDim,
              )}
            >
              {partial ? (
                <NativeSelectOption value="">Not loaded</NativeSelectOption>
              ) : (
                <>
                  <NativeSelectOption value="" disabled>
                    Choose an owner
                  </NativeSelectOption>
                  {OWNERS.map((owner) => (
                    <NativeSelectOption key={owner.id} value={owner.id}>
                      {owner.name}
                    </NativeSelectOption>
                  ))}
                </>
              )}
            </NativeSelect>
            {fieldError("ownerId")}
          </Field>
          <Field data-disabled={partial || undefined}>
            <FieldLabel htmlFor={FIELD_IDS.status} className={inputDim}>
              Status
            </FieldLabel>
            <NativeSelect
              id={FIELD_IDS.status}
              value={partial ? "" : values.status}
              disabled={partial}
              aria-describedby={partial ? NOTICE_ID : undefined}
              onChange={(e) =>
                update("status", e.target.value as FormValues["status"])
              }
              className={cn(
                "w-full",
                partial && "[&_select]:text-muted-foreground [&_select]:italic",
                inputDim,
              )}
            >
              {partial ? (
                <NativeSelectOption value="">Not loaded</NativeSelectOption>
              ) : (
                STATUSES.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </NativeSelectOption>
                ))
              )}
            </NativeSelect>
          </Field>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-x-4">
          <Field>
            <FieldLabel htmlFor={FIELD_IDS.annualValue} className={inputDim}>
              Annual value (USD)
            </FieldLabel>
            <Input
              id={FIELD_IDS.annualValue}
              inputMode="numeric"
              autoComplete="off"
              value={values.annualValue}
              readOnly={pending}
              aria-invalid={errors.annualValue ? true : undefined}
              aria-describedby={describe("annualValue")}
              onChange={(e) => update("annualValue", e.target.value)}
              onBlur={(e) =>
                update("annualValue", formatAnnualValue(e.target.value))
              }
              className={cn("text-right tabular-nums", inputDim)}
            />
            {fieldError("annualValue")}
          </Field>
          <Field>
            <FieldLabel
              id={`${FIELD_IDS.renewsOn}-label`}
              htmlFor={FIELD_IDS.renewsOn}
              className={inputDim}
            >
              Renewal date
            </FieldLabel>
            <DatePicker
              id={FIELD_IDS.renewsOn}
              aria-labelledby={`${FIELD_IDS.renewsOn}-label`}
              aria-describedby={`${FIELD_IDS.renewsOn}-help`}
              value={values.renewsOn ? toDate(values.renewsOn) : undefined}
              onValueChange={(day) =>
                update("renewsOn", day ? toIso(day) : null)
              }
              formatValue={(day) => formatDate(toIso(day))}
              disabled={pending}
              className={cn(
                "w-full flex-row-reverse justify-between data-[empty=true]:text-muted-foreground",
                pending && "disabled:opacity-50",
              )}
            />
            <FieldDescription
              id={`${FIELD_IDS.renewsOn}-help`}
              className={inputDim}
            >
              Optional.
            </FieldDescription>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor={FIELD_IDS.terms} className={inputDim}>
            Terms
          </FieldLabel>
          <Textarea
            id={FIELD_IDS.terms}
            value={values.terms}
            placeholder="Type or paste the clauses, one per line"
            readOnly={pending}
            aria-describedby={`${FIELD_IDS.terms}-help`}
            onChange={(e) => update("terms", e.target.value)}
            className={cn("min-h-40", inputDim)}
          />
          <FieldDescription id={`${FIELD_IDS.terms}-help`} className={inputDim}>
            {termsHelper}
          </FieldDescription>
        </Field>

        {saveFailed ? (
          <Alert variant="destructive">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>Save did not finish</AlertTitle>
            <AlertDescription>
              Your changes are still here. Retry the save, or cancel to leave
              them.
            </AlertDescription>
          </Alert>
        ) : null}

        <FormActions
          saveLabel={saveFailed ? "Retry save" : "Save"}
          pending={pending}
          held={held}
          describedBy={partial || offline ? NOTICE_ID : undefined}
          cancelDisabled={pending}
          onCancel={() => requestLeave(backHref)}
        />
      </form>

      <ConfirmDialog
        open={leaveTo !== null}
        title="Leave without saving?"
        body={dirtyWords(changed.length > 0 ? changed : ["annualValue"])}
        confirmLabel="Discard change"
        pendingLabel="Discard change"
        cancelLabel="Keep editing"
        onCancel={() => setLeaveTo(null)}
        onConfirm={() => {
          const to = leaveTo ?? backHref;
          setLeaving(true);
          setLeaveTo(null);
          router.push(to);
        }}
      />
    </>
  );
}
