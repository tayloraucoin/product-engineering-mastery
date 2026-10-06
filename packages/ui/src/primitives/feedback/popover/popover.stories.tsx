import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Feedback/Popover",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/popover.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn; shadow-overlay",
    },
  },
  render: (args: Args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>
        Share
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share this view</PopoverTitle>
          <PopoverDescription>
            Anyone with the link can see these filters.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** A press opens it; Escape closes it and returns focus to the trigger. */
export const Toggle: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Share" });
    await userEvent.click(trigger);
    await expect(
      await within(canvasElement.ownerDocument.body).findByText(
        "Share this view",
      ),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
