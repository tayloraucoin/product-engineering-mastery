import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BadgeCheck } from "lucide-react";
import { expect, userEvent } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  title: "Primitives/Display/Badge",
  component: Badge,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/badge.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "cva in badge.variants.ts; ring-3; the focus ring appears at once",
    },
  },
  args: { children: "Active" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Draft" },
};

/** Destructive is a tinted label; the audit holds it on its tint. */
export const Destructive: Story = {
  args: { variant: "destructive", children: "Overdue" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Archived" },
};

export const Ghost: Story = { args: { variant: "ghost", children: "Beta" } };

export const WithIcon: Story = {
  args: {
    variant: "secondary",
    children: (
      <>
        <BadgeCheck data-icon="inline-start" aria-hidden />
        Verified
      </>
    ),
  },
};

/** Rendered as a link: it takes focus, and the ring shows. */
export const AsLink: Story = {
  args: {
    variant: "link",
    render: <a href="#records" />,
    children: "12 records",
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("link", { name: "12 records" }),
    ).toHaveFocus();
  },
};
