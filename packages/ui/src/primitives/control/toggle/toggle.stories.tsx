import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bold, Italic } from "lucide-react";
import { expect, userEvent } from "storybook/test";

import { Toggle } from "./toggle";

const meta = {
  title: "Primitives/Control/Toggle",
  component: Toggle,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/toggle.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "cva in toggle.variants.ts; shadow-resting; ring-3",
    },
  },
  args: { "aria-label": "Bold", children: <Bold aria-hidden /> },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const Pressed: Story = { args: { defaultPressed: true } };

/** A press turns it on, and aria-pressed says so. */
export const Press: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole("button", { name: "Bold" });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

export const Outline: Story = { args: { variant: "outline" } };

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

/** Icon and text: the visible word names it. */
export const WithText: Story = {
  args: {
    "aria-label": undefined,
    children: (
      <>
        <Italic data-icon="inline-start" aria-hidden />
        Italic
      </>
    ),
  },
};

export const Disabled: Story = { args: { disabled: true } };
