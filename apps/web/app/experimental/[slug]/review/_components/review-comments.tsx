"use client";

/**
 * "Your comments" (review.md): each pin played back with its number, design
 * (several designs only), place and type, its text editable in place (it
 * edits the pin itself), Delete, and a three-way triage; then "Which
 * matters most?" among the Must and Should ones, hidden when exactly one is
 * so marked. Until goal fit is answered on a first send, no comment text is
 * in the page.
 */
import { useState } from "react";
import Link from "next/link";

import { Button } from "@pem/ui/button";
import { Field, FieldError, FieldLabel } from "@pem/ui/field";
import { Textarea } from "@pem/ui/textarea";

import type { DesignOption } from "../../../../../lib/sandbox/client/experiment-view";
import {
  COMMENT_BODY_MAX,
  PIN_WORDS,
  type Pin,
} from "../../../../../lib/sandbox/client/pins-view";
import {
  TRIAGE_OPTIONS,
  REVIEW_CORE as W,
  type TriageId,
} from "../../../../../lib/sandbox/client/review-core";
import {
  GAP_IDS,
  mattersMostView,
  type ReviewForm,
} from "../../../../../lib/sandbox/client/review-form";
import {
  commentPlayback,
  editedPin,
  type CommentPlayback,
} from "../../../../../lib/sandbox/client/review-view";
import { ChoiceGroup } from "./choice-group";

export function ReviewComments({
  comments,
  designs,
  form,
  open,
  errors,
  backHref,
  disabled,
  onTriage,
  onMattersMost,
  onEdit,
  onDelete,
}: {
  comments: readonly Pin[];
  designs: readonly DesignOption[];
  form: ReviewForm;
  /** Goal fit is answered, or this is edit mode. */
  open: boolean;
  /** Field errors by gap id, once a send has been refused. */
  errors: Readonly<Record<string, string>>;
  backHref: string;
  /** Closed or sending: nothing changes. */
  disabled: boolean;
  onTriage(id: string, choice: TriageId): void;
  onMattersMost(id: string): void;
  onEdit(pin: Pin, body: string): void;
  onDelete(pin: Pin): void;
}) {
  if (comments.length === 0)
    return (
      <p>
        {W.comments.none}{" "}
        <Link href={backHref} className="underline underline-offset-4">
          {W.back}
        </Link>
      </p>
    );
  if (!open)
    return <p className="text-muted-foreground">{W.comments.locked}</p>;

  const rows = commentPlayback(comments, designs);
  const most = mattersMostView(form, comments);
  return (
    <div className="flex flex-col gap-8">
      <p>{W.comments.lead}</p>
      <ol className="flex flex-col gap-8">
        {rows.map((row) => (
          <CommentRow
            key={row.id}
            row={row}
            pin={comments.find((p) => p.id === row.id)!}
            choice={form.triage[row.id] ?? null}
            error={errors[GAP_IDS.triage(row.id)] ?? null}
            disabled={disabled}
            onTriage={onTriage}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ol>
      {most.shown ? (
        <ChoiceGroup
          id={GAP_IDS.mattersMost}
          legend={W.comments.mattersMost}
          options={most.choices.map((c) => {
            const pin = comments.find((p) => p.id === c.id)!;
            return {
              id: c.id,
              label: `Comment ${c.number}: ${excerpt(pin.body)}`,
            };
          })}
          value={most.value}
          onChange={onMattersMost}
          error={errors[GAP_IDS.mattersMost] ?? null}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}

/** The first words of a comment, to tell the choices apart. */
function excerpt(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 60 ? `${flat.slice(0, 59)}…` : flat;
}

function CommentRow({
  row,
  pin,
  choice,
  error,
  disabled,
  onTriage,
  onEdit,
  onDelete,
}: {
  row: CommentPlayback;
  pin: Pin;
  choice: TriageId | null;
  error: string | null;
  disabled: boolean;
  onTriage(id: string, choice: TriageId): void;
  onEdit(pin: Pin, body: string): void;
  onDelete(pin: Pin): void;
}) {
  const [body, setBody] = useState(pin.body);
  const [lastSaved, setLastSaved] = useState(pin.body);
  if (pin.body !== lastSaved) {
    // The pin changed elsewhere (a send settled, another tab): show it.
    setLastSaved(pin.body);
    setBody(pin.body);
  }
  const textId = `comment-${pin.id}-text`;
  const tooLong = body.length > COMMENT_BODY_MAX;

  return (
    <li className="flex flex-col gap-4">
      <Field data-invalid={tooLong ? true : undefined}>
        <FieldLabel htmlFor={textId}>{row.meta}</FieldLabel>
        <Textarea
          id={textId}
          value={body}
          disabled={disabled}
          aria-invalid={tooLong ? true : undefined}
          onChange={(event) => setBody(event.target.value)}
          onBlur={() => {
            // An empty or too-long text is never saved: the pin keeps its own.
            if (editedPin(pin, body)) onEdit(pin, body);
            else if (!body.trim()) setBody(pin.body);
          }}
        />
        {tooLong ? (
          <FieldError>{PIN_WORDS.counter(body.length)}</FieldError>
        ) : null}
      </Field>
      <ChoiceGroup
        id={GAP_IDS.triage(pin.id)}
        legend={row.triageGroup}
        legendHidden
        options={TRIAGE_OPTIONS}
        value={choice}
        onChange={(next) => onTriage(pin.id, next as TriageId)}
        error={error}
        disabled={disabled}
        inline
      />
      <div>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={disabled}
          onClick={() => onDelete(pin)}
          aria-label={`${W.comments.delete} comment ${pin.number}`}
        >
          {W.comments.delete}
        </Button>
      </div>
    </li>
  );
}
