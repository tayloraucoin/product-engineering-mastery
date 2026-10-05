import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ScrollArea, ScrollBar } from "./scroll-area";

const TAGS = Array.from({ length: 30 }, (_, i) => `v1.${30 - i}.0`);

const meta = {
  title: "Primitives/Layout/Scroll area",
  component: ScrollArea,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/scroll-area.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fixed-height list that scrolls on its own. */
export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-48 w-48 rounded-md border">
      <ul className="p-3 text-sm">
        {TAGS.map((tag) => (
          <li key={tag} className="py-1">
            {tag}
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("v1.30.0")).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-72 rounded-md border whitespace-nowrap">
      <div className="flex gap-3 p-3 text-sm">
        {TAGS.map((tag) => (
          <span key={tag} className="rounded-md bg-muted px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
