import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Feedback/Hover card",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/hover-card.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn; shadow-overlay",
    },
  },
  render: (args: Args) => (
    <HoverCard {...args}>
      <HoverCardTrigger href="#dana">@dana</HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium">Dana Okafor</p>
        <p className="text-sm text-muted-foreground">
          Account manager · joined 2024
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "@dana" }),
    ).toBeInTheDocument();
  },
};

export const Open: Story = { args: { defaultOpen: true } };
