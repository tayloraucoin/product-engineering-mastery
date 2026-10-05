import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Feedback/Dialog",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/dialog.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the width cap's rem on the spacing scale",
    },
  },
  render: (args: Args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        Rename project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>
            The new name shows everywhere the project is linked.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
    );
    await expect(dialog).toHaveAccessibleName("Rename project");
    await expect(dialog).toHaveAccessibleDescription(
      "The new name shows everywhere the project is linked.",
    );
  },
};

/** A press opens it; Escape closes it and returns focus to the trigger. */
export const Toggle: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Rename project" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** The corner close button is named for screen readers. */
export const CloseButton: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole("button", { name: "Close" }),
    ).toBeInTheDocument();
  },
};
