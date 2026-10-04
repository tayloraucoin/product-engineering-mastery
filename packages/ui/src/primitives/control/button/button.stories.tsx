import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";

const meta = {
  title: "Primitives/Control/Button",
  component: Button,
  tags: ["source:custom", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "this repo, scaffold 288fe5d (2026-10-01); CAT-4 replaces it with shadcn's Vega button",
      licence: "house",
      adapted: "cva in button.variants.ts (STK-22)",
    },
  },
  args: { children: "Save changes", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Outline: Story = { args: { variant: "outline" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

export const Hover: Story = { parameters: { pseudo: { hover: true } } };

export const OutlineHover: Story = {
  args: { variant: "outline" },
  parameters: { pseudo: { hover: true } },
};

/** Hover is a ghost button's only visible affordance. */
export const GhostHover: Story = {
  args: { variant: "ghost" },
  parameters: { pseudo: { hover: true } },
};

/** Reached from the keyboard, so the focus ring shows. */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button")).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
