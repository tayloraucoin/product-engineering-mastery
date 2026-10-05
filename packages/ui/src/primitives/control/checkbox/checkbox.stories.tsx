import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Checkbox } from "./checkbox";

const meta = {
  title: "Primitives/Control/Checkbox",
  component: Checkbox,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/checkbox.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "shadow-resting; the house small radius for the box",
    },
  },
  args: { "aria-label": "Email me a weekly summary" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

/** A press checks it, and the state is announced. */
export const Toggle: Story = {
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox");
    await userEvent.click(box);
    await expect(box).toHaveAttribute("aria-checked", "true");
  },
};

export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("checkbox")).toHaveFocus();
  },
};

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};
