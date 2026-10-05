import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

type Args = { defaultOpen?: boolean; side?: "top" | "right" | "bottom" | "left" };

const meta = {
  title: "Primitives/Layout/Sheet",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream: "ui.shadcn.com/r/styles/base-vega/sheet.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the 2.5rem slide on translate-10; ease on the in-out motion token; no slide under reduced motion",
    },
  },
  render: ({ side, ...args }: Args) => (
    <Sheet {...args}>
      <SheetTrigger render={<Button variant="outline" />}>Filters</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list to what you need today.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose render={<Button />}>Show 32 results</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Right: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await expect(dialog).toHaveAccessibleName("Filters");
    await expect(dialog).toHaveAttribute("data-side", "right");
  },
};

export const Left: Story = { args: { defaultOpen: true, side: "left" } };

export const Top: Story = { args: { defaultOpen: true, side: "top" } };

export const Bottom: Story = { args: { defaultOpen: true, side: "bottom" } };

/** Escape closes it and returns focus to the trigger. */
export const Toggle: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Filters" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
