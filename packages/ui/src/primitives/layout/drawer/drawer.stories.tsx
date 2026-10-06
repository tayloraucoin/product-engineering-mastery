import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

type Args = {
  defaultOpen?: boolean;
  swipeDirection?: "down" | "up" | "left" | "right";
};

const meta = {
  title: "Primitives/Layout/Drawer",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/drawer.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the scrim on bg-background/70; swipe durations on the sheet and instant motion tokens; rem and px lengths on the spacing scale",
    },
  },
  render: (args: Args) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Edit filters
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow the list by status and owner.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Apply</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

/** Open from the bottom edge, as on a phone. */
export const Open: Story = { args: { defaultOpen: true } };

/** From the side, as a wider panel. */
export const FromRight: Story = {
  args: { defaultOpen: true, swipeDirection: "right" },
};

/** A press opens it as a dialog with its title as its name. */
export const Opening: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit filters" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
    );
    await expect(dialog).toHaveAccessibleName("Filters");
  },
};
