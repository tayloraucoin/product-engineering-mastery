import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Feedback/Tooltip",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/tooltip.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: (args: Args) => (
    <TooltipProvider>
      <Tooltip {...args}>
        <TooltipTrigger
          render={<Button variant="outline" size="icon" aria-label="Archive" />}
        >
          A
        </TooltipTrigger>
        <TooltipContent>Archive (E)</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** Focus from the keyboard shows it, as hover does. */
export const OnFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(
      await within(canvasElement.ownerDocument.body).findByText("Archive (E)"),
    ).toBeInTheDocument();
  },
};
