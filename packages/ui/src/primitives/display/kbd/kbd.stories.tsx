import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Kbd, KbdGroup } from "./kbd";

const meta = {
  title: "Primitives/Display/Kbd",
  component: Kbd,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/kbd.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  args: { children: "Esc" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Key: Story = {};

/** A chord: each key its own cap, grouped. */
export const Shortcut: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>Ctrl</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

/** In running text, as a hint. */
export const InText: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Press <Kbd>/</Kbd> to search.
    </p>
  ),
};
