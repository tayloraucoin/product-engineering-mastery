import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "Primitives/Display/Skeleton",
  component: Skeleton,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/skeleton.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the pulse stops under reduced motion",
    },
  },
  args: { className: "h-4 w-48" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line of text, waiting. */
export const Line: Story = {};

/** The shape of the final layout (A-18: a skeleton, not a spinner, for a page). */
export const Row: Story = {
  render: () => (
    <div
      className="flex items-center gap-3"
      role="status"
      aria-busy="true"
      aria-label="Loading records"
    >
      <Skeleton className="size-10 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  ),
};
