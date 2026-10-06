import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Layout/Collapsible",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/collapsible.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: (args: Args) => (
    <Collapsible {...args} className="w-72">
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Show filters
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 text-sm">
        Status, owner and due date.
      </CollapsibleContent>
    </Collapsible>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** A press reveals the panel, and the trigger says it is expanded. */
export const Toggle: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Show filters" });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("Status, owner and due date.")).toBeVisible();
  },
};
