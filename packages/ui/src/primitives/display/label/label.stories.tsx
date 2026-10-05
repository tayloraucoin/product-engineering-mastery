import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Checkbox } from "../../control/checkbox/checkbox";
import { Input } from "../../control/input/input";
import { Label } from "./label";

const meta = {
  title: "Primitives/Display/Label",
  component: Label,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/label.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/** It names the field it is for: the input's accessible name is the label's text. */
export const ForAField: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="story-full-name">Full name</Label>
      <Input id="story-full-name" placeholder="Dana Okafor" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Full name" }),
    ).toBeInTheDocument();
  },
};

/** Beside a checkbox, wrapping it, so the whole line is the target. */
export const WithCheckbox: Story = {
  render: () => (
    <Label>
      <Checkbox />
      Email me a weekly summary
    </Label>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "Email me a weekly summary" }),
    ).toBeInTheDocument();
  },
};
