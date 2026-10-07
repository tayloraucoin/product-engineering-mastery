"use client";

/**
 * One question as a fieldset with a visible legend and a radio group
 * (review.md Access): each option a labelled radio, its error tied to the
 * group. Base UI's radio is a span, so each is named from its label, which
 * otherwise reaches only its hidden input. `apart` options sit below the
 * rest, set apart, in the same group ("Can't judge yet").
 */
import type { ReactNode } from "react";

import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@pem/ui/field";
import { RadioGroup, RadioGroupItem } from "@pem/ui/radio-group";

export type Choice = { id: string; label: string };

export function ChoiceGroup({
  id,
  legend,
  legendHidden = false,
  options,
  apart = [],
  value,
  onChange,
  error,
  disabled = false,
  inline = false,
  children,
}: {
  /** The field's id: the summary links to it, the server names it. */
  id: string;
  legend: string;
  /** The legend is read, not shown, where a visible line already says it. */
  legendHidden?: boolean;
  options: readonly Choice[];
  apart?: readonly Choice[];
  value: string | null;
  onChange(value: string): void;
  error?: string | null;
  disabled?: boolean;
  /** Options side by side where there is room (the triage). */
  inline?: boolean;
  /** Shown between the legend and the options (the goals). */
  children?: ReactNode;
}) {
  const legendId = `${id}-legend`;
  const errorId = `${id}-error`;
  const item = (choice: Choice) => {
    const itemId = `${id}-${choice.id}`;
    return (
      <Field key={choice.id} orientation="horizontal" className="w-fit">
        <RadioGroupItem
          id={itemId}
          value={choice.id}
          aria-labelledby={`${itemId}-label`}
          aria-invalid={error ? true : undefined}
        />
        <FieldLabel
          id={`${itemId}-label`}
          htmlFor={itemId}
          className="font-normal"
        >
          {choice.label}
        </FieldLabel>
      </Field>
    );
  };
  return (
    <FieldSet id={id} data-invalid={error ? true : undefined} tabIndex={-1}>
      <FieldLegend
        id={legendId}
        className={legendHidden ? "sr-only" : undefined}
      >
        {legend}
      </FieldLegend>
      {children}
      <RadioGroup
        aria-labelledby={legendId}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onValueChange={(next: unknown) => {
          if (typeof next === "string") onChange(next);
        }}
        disabled={disabled}
        className={
          inline ? "flex flex-col gap-3 sm:flex-row sm:gap-6" : undefined
        }
      >
        {options.map(item)}
        {apart.length ? (
          <div className="mt-2 flex flex-col gap-3">{apart.map(item)}</div>
        ) : null}
      </RadioGroup>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </FieldSet>
  );
}
