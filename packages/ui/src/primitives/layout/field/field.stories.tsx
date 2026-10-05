import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Checkbox } from "../../control/checkbox/checkbox";
import { Input } from "../../control/input/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../control/radio-group/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "./field";

type Args = {
  orientation?: "vertical" | "horizontal" | "responsive";
  invalid?: boolean;
  disabled?: boolean;
};

const meta = {
  title: "Primitives/Layout/Field",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/field.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ orientation, invalid, disabled }: Args) => (
    <Field
      orientation={orientation}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className="max-w-sm"
    >
      <FieldLabel htmlFor="field-email">Work email</FieldLabel>
      <Input
        id="field-email"
        type="email"
        defaultValue={invalid ? "ada@" : undefined}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        aria-describedby="field-email-help"
      />
      {invalid ? (
        <FieldError id="field-email-help">
          Enter the whole address, like ada@example.com.
        </FieldError>
      ) : (
        <FieldDescription id="field-email-help">
          We send receipts here.
        </FieldDescription>
      )}
    </Field>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Work email" });
    await expect(input).toHaveAccessibleDescription("We send receipts here.");
  },
};

export const Horizontal: Story = { args: { orientation: "horizontal" } };

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Work email" });
    await expect(input).toBeInvalid();
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter the whole address",
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Work email" }),
    ).toBeDisabled();
  },
};

/** A fieldset groups related choices under one legend. */
export const Set: Story = {
  render: () => (
    <FieldSet className="max-w-sm">
      <FieldLegend>Notify me about</FieldLegend>
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox id="field-mentions" defaultChecked />
          <FieldLabel htmlFor="field-mentions">Mentions</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="field-replies" />
          <FieldLabel htmlFor="field-replies">
            Replies to my comments
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Notify me about" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("checkbox", { name: "Mentions" }),
    ).toBeChecked();
  },
};

/**
 * Choice cards: the checked card is outlined in primary on the muted fill,
 * and its radio is the marker; its description stays on an audited pair.
 */
export const ChoiceCardChecked: Story = {
  render: () => (
    <RadioGroup defaultValue="pro" aria-label="Plan" className="max-w-sm">
      {[
        {
          value: "starter",
          title: "Starter",
          note: "One project, community help",
        },
        { value: "pro", title: "Pro", note: "Unlimited projects, email help" },
      ].map((plan) => (
        <FieldLabel key={plan.value} htmlFor={`plan-${plan.value}`}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>{plan.title}</FieldTitle>
              <FieldDescription>{plan.note}</FieldDescription>
            </FieldContent>
            <RadioGroupItem value={plan.value} id={`plan-${plan.value}`} />
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: /Pro/ })).toBeChecked();
    await expect(
      canvas.getByRole("radio", { name: /Starter/ }),
    ).not.toBeChecked();
  },
};
