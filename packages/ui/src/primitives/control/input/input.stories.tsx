import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Input } from "./input";

const meta = {
  title: "Primitives/Control/Input",
  component: Input,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/input.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "shadow-resting",
    },
  },
  args: { "aria-label": "Email", placeholder: "you@example.com" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = { args: { defaultValue: "dana@example.com" } };

/** Typing enters text; the value is the field's own. */
export const Typing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });
    await userEvent.type(input, "dana@example.com");
    await expect(input).toHaveValue("dana@example.com");
  },
};

/** Reached from the keyboard, so the focus ring shows. */
export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("textbox")).toHaveFocus();
  },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "dana@" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "dana@example.com" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toBeDisabled();
  },
};

export const File: Story = {
  args: { type: "file", "aria-label": "Attachment", placeholder: undefined },
};
