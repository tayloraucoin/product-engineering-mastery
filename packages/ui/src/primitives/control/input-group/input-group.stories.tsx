import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

type Args = { invalid?: boolean; disabled?: boolean };

const meta = {
  title: "Primitives/Control/Input group",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream: "ui.shadcn.com/r/styles/base-vega/input-group.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the radius-5px corners on rounded-xs; kbd nudges on -m*-0.5",
    },
  },
  render: ({ invalid, disabled }: Args) => (
    <InputGroup className="max-w-sm" data-disabled={disabled || undefined}>
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search orders" placeholder="Order number or email" aria-invalid={invalid || undefined} disabled={disabled} />
      <InputGroupAddon align="inline-end">
        <InputGroupText>12 found</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Search orders" });
    await userEvent.type(input, "A-1042");
    await expect(input).toHaveValue("A-1042");
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Search orders" })).toBeInvalid();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Search orders" })).toBeDisabled();
  },
};

/** A button inside the group, reached after the field by Tab. */
export const WithButton: Story = {
  render: () => (
    <InputGroup className="max-w-sm">
      <InputGroupInput aria-label="Invite by email" placeholder="ada@example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="secondary">Invite</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Invite by email" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Invite" })).toHaveFocus();
  },
};

/** A textarea with a footer addon. */
export const Textarea: Story = {
  render: () => (
    <InputGroup className="max-w-sm">
      <InputGroupTextarea aria-label="Reply" placeholder="Write a reply" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Markdown supported</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Reply" })).toBeInTheDocument();
  },
};
