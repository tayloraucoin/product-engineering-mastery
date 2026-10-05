import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Switch } from "./switch";

const meta = {
  title: "Primitives/Control/Switch",
  component: Switch,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/switch.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "shadow-resting; its px track sizes on the spacing scale",
    },
  },
  args: { "aria-label": "Email notifications" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Small: Story = { args: { size: "sm", defaultChecked: true } };

/** A press turns it on, and the state is announced. */
export const Toggle: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("switch");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  },
};

export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("switch")).toHaveFocus();
  },
};

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
};
