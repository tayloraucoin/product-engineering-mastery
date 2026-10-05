import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "../../control/button/button";
import { Spinner } from "./spinner";

const meta = {
  title: "Primitives/Feedback/Spinner",
  component: Spinner,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/spinner.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inline only (A-18): a status announced as "Loading". */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("status", { name: "Loading" }),
    ).toBeInTheDocument();
  },
};

/** Inside the button whose action is running: hidden, so the button keeps its own name. */
export const InButton: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Saving" })).toBeDisabled();
  },
  render: () => (
    <Button disabled>
      <Spinner data-icon="inline-start" aria-hidden="true" />
      Saving
    </Button>
  ),
};
