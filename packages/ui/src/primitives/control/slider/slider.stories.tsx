import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Slider } from "./slider";

const meta = {
  title: "Primitives/Control/Slider",
  component: Slider,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/slider.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "shadow-raised on the thumb; the thumb on bg-background; getAriaLabel passed to every thumb",
    },
  },
  args: {
    defaultValue: [40],
    getAriaLabel: (() => "Volume") as (index: number) => string,
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The thumb's range input carries the name. Base UI keeps a thumb hidden
 * until it is measured, which jsdom never does, so it is found by its label.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Volume")).toHaveValue("40");
  },
};

/** Two thumbs, each named for its end of the range. */
export const Range: Story = {
  args: {
    defaultValue: [20, 80],
    getAriaLabel: (index: number) =>
      index === 0 ? "Minimum price" : "Maximum price",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Minimum price")).toHaveValue("20");
    await expect(canvas.getByLabelText("Maximum price")).toHaveValue("80");
  },
};

export const Stepped: Story = { args: { defaultValue: [50], step: 10 } };

export const Vertical: Story = {
  args: { orientation: "vertical" },
  decorators: [
    (Story) => (
      <div className="h-40">
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = { args: { disabled: true } };

/**
 * The focused thumb shows its outline. Arrow keys move it in the browser;
 * jsdom rejects the KeyboardEvent Base UI builds for that, so this story
 * stops at focus.
 */
export const Focus: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("Volume");
    input.focus();
    await expect(input).toHaveFocus();
  },
};
