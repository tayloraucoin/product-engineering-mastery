import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Plus } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";

const meta = {
  title: "Primitives/Control/Button",
  component: Button,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  args: { children: "Save changes", onClick: fn() },
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/button.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "cva in button.variants.ts; cn from the package; shadow-control; colour transitions on the motion tokens; the house radius for xs and sm",
    },
  },
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

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

/** Destructive is a tinted label, not a filled red block (CS-11 roles). */
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete record" },
};

export const Link: Story = { args: { variant: "link", children: "View all" } };

export const ExtraSmall: Story = { args: { size: "xs" } };

export const Small: Story = { args: { size: "sm" } };

export const Large: Story = { args: { size: "lg" } };

/** An icon before the label, marked so the padding tightens on that side. */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus data-icon="inline-start" aria-hidden />
        Add member
      </>
    ),
  },
};

/** An icon after the label. */
export const WithTrailingIcon: Story = {
  args: {
    variant: "outline",
    children: (
      <>
        Continue
        <ArrowRight data-icon="inline-end" aria-hidden />
      </>
    ),
  },
};

/** Icon only: the accessible name comes from aria-label. */
export const Icon: Story = {
  args: {
    size: "icon",
    variant: "outline",
    "aria-label": "Add member",
    children: <Plus aria-hidden />,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Add member" }),
    ).toBeInTheDocument();
  },
};

export const IconSmall: Story = {
  args: { ...Icon.args, size: "icon-sm" },
};

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

/** A field-level error: the ring and border turn destructive. */
export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
