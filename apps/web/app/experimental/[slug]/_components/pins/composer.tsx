"use client";

/**
 * The composer (pins.md, Composer; D-LAB-11): "On: …", the optional type
 * with nothing pre-selected, "Your comment" with its hint and, from 1,800
 * characters, a counter that turns to error past 2,000 and disables Save.
 * Ctrl or Cmd+Enter saves. Rendered inside the draft pin's popover, for a
 * new pin and for an edit alike.
 */
import { useId } from "react";

import { Button } from "@pem/ui/button";
import { Field, FieldDescription, FieldLabel } from "@pem/ui/field";
import { Textarea } from "@pem/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@pem/ui/toggle-group";

import {
  COMMENT_BODY_MAX,
  COMMENT_COUNTER_FROM,
  placeOf,
  PIN_WORDS as W,
} from "../../../../../lib/sandbox/client/pins-view";
import {
  PIN_KINDS,
  type PinKind,
} from "../../../../../lib/sandbox/client/queue";
import type { Draft } from "./pins-provider";

export function Composer({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Draft;
  onChange(change: Partial<Pick<Draft, "pinKind" | "body">>): void;
  onSave(): void;
  onCancel(): void;
}) {
  const id = useId();
  const ids = {
    body: `${id}-body`,
    hint: `${id}-hint`,
    counter: `${id}-counter`,
  };
  const length = draft.body.length;
  const tooLong = length > COMMENT_BODY_MAX;
  const showCounter = length >= COMMENT_COUNTER_FROM;
  const empty = draft.body.trim() === "";

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <p className="font-medium">{W.on(placeOf(draft.anchor))}</p>
      <ToggleGroup
        aria-label={W.typeGroup}
        variant="outline"
        spacing={1}
        value={draft.pinKind ? [draft.pinKind] : []}
        onValueChange={(value: string[]) =>
          onChange({ pinKind: (value[0] as PinKind | undefined) ?? null })
        }
        className="grid w-full grid-cols-2"
        disabled={draft.saving}
      >
        {PIN_KINDS.map((kind) => (
          <ToggleGroupItem
            key={kind}
            value={kind}
            className="h-11 aria-pressed:bg-selected aria-pressed:font-semibold aria-pressed:text-selected-foreground"
          >
            {W.kinds[kind]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Field data-invalid={tooLong ? true : undefined}>
        <FieldLabel htmlFor={ids.body}>{W.bodyLabel}</FieldLabel>
        <Textarea
          id={ids.body}
          value={draft.body}
          disabled={draft.saving}
          aria-invalid={tooLong || undefined}
          aria-describedby={
            showCounter ? `${ids.hint} ${ids.counter}` : ids.hint
          }
          onChange={(event) => onChange({ body: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              onSave();
            }
          }}
          className="max-h-60 min-h-24"
        />
        <FieldDescription id={ids.hint}>{W.bodyHint}</FieldDescription>
        {showCounter ? (
          <FieldDescription
            id={ids.counter}
            className={
              tooLong ? "text-destructive tabular-nums" : "tabular-nums"
            }
          >
            {W.counter(length)}
          </FieldDescription>
        ) : null}
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          className="h-11 px-4"
          disabled={draft.saving || empty || tooLong}
        >
          {draft.saving ? W.saving : W.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4"
          disabled={draft.saving}
          onClick={onCancel}
        >
          {W.cancel}
        </Button>
      </div>
    </form>
  );
}
