import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

type Args = {
  multiple?: boolean;
  variant?: "default" | "outline";
  disabled?: boolean;
  defaultValue?: string[];
};

const meta = {
  title: "Primitives/Control/Toggle group",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/toggle-group.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: (args: Args) => (
    <ToggleGroup aria-label="Text style" {...args}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        I
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        U
      </ToggleGroupItem>
    </ToggleGroup>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Pressed: Story = {
  args: { defaultValue: ["bold"] },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      canvas.getByRole("button", { name: "Italic" }),
    ).toHaveAttribute("aria-pressed", "false");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Bold" })).toBeDisabled();
  },
};

/** One choice at a time: pressing another releases the first. */
export const Single: Story = {
  play: async ({ canvas }) => {
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(italic);
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(bold).toHaveAttribute("aria-pressed", "false");
  },
};

/** With multiple, each stays pressed on its own. */
export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvas }) => {
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
  },
};
