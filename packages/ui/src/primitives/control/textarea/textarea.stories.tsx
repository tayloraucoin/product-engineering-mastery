import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Textarea } from "./textarea";

const meta = {
  title: "Primitives/Control/Textarea",
  component: Textarea,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/textarea.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "shadow-resting",
    },
  },
  args: { "aria-label": "Notes", placeholder: "Add a note for the team" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** It grows with its content (field-sizing). */
export const Filled: Story = {
  args: {
    defaultValue:
      "Call back on Thursday about the renewal.\nThey asked for the annual price in writing.",
  },
};

export const Typing: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole("textbox", { name: "Notes" });
    await userEvent.type(box, "Follow up next week");
    await expect(box).toHaveValue("Follow up next week");
  },
};

export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("textbox")).toHaveFocus();
  },
};

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked by an admin" },
};
