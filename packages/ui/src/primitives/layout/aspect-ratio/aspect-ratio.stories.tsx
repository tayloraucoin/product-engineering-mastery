import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AspectRatio } from "./aspect-ratio";

const meta = {
  title: "Primitives/Layout/Aspect ratio",
  component: AspectRatio,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/aspect-ratio.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div className="w-72">
      <AspectRatio {...args} className="rounded-md bg-muted" />
    </div>
  ),
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Widescreen: Story = {};

export const Square: Story = { args: { ratio: 1 } };
