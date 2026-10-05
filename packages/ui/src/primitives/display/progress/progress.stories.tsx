import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Progress, ProgressLabel, ProgressValue } from "./progress";

const meta = {
  title: "Primitives/Display/Progress",
  component: Progress,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/progress.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the track on bg-input, so the bar's full length is visible (WCAG 1.4.11)",
    },
  },
  args: { value: 40 },
  render: (args) => (
    <Progress {...args} className="w-72">
      <ProgressLabel>Uploading records</ProgressLabel>
      <ProgressValue className="ml-auto" />
    </Progress>
  ),
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A known-length task, part way: the bar and the value agree. */
export const Partway: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  },
};

export const Complete: Story = { args: { value: 100 } };

/** No value yet: indeterminate, so no number is claimed (A-20). */
export const Indeterminate: Story = { args: { value: null } };
