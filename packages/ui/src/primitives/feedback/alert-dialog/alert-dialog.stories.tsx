import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

type Args = { defaultOpen?: boolean; size?: "default" | "sm" };

const meta = {
  title: "Primitives/Feedback/Alert dialog",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/alert-dialog.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the width cap's rem on the spacing scale",
    },
  },
  render: ({ size, ...args }: Args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Delete project
      </AlertDialogTrigger>
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            Its 14 pages and their history go with it. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction variant="destructive">
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      "alertdialog",
    );
    await expect(dialog).toHaveAccessibleName("Delete this project?");
  },
};

export const Small: Story = { args: { defaultOpen: true, size: "sm" } };

/** Cancel closes it without acting, and focus returns to the trigger. */
export const Cancel: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("button", { name: "Keep project" }),
    );
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
