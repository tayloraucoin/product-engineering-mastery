import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import { Toaster, createToastManager } from "./toast";

type Args = {
  type?: "success" | "info" | "warning" | "error" | "loading";
  title: string;
  description?: string;
  action?: string;
};

const meta = {
  title: "Primitives/Feedback/Toast",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream: "ui.shadcn.com/r/styles/base-vega/toast.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "stack gap and peek on the spacing scale; the transition on the sheet and fast motion tokens, opacity only under reduced motion",
    },
  },
  render: ({ type, title, description, action }: Args) => {
    const manager = createToastManager();
    return (
      <Toaster toastManager={manager}>
        <Button
          variant="outline"
          onClick={() =>
            manager.add({
              type,
              title,
              description,
              timeout: 0,
              actionProps: action ? { children: action } : undefined,
            })
          }
        >
          Show toast
        </Button>
      </Toaster>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

const show = async (canvasElement: HTMLElement, canvas: ReturnType<typeof within>, title: string) => {
  await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
  return within(canvasElement.ownerDocument.body).findByText(title);
};

export const Default: Story = {
  args: { title: "Draft saved", description: "Saved to your drafts at 14:02." },
  play: async ({ canvas, canvasElement }) => {
    await expect(await show(canvasElement, canvas, "Draft saved")).toBeInTheDocument();
  },
};

export const Success: Story = {
  args: { type: "success", title: "Invoice sent", description: "Ada will get it at ada@example.com." },
  play: async ({ canvas, canvasElement }) => {
    await expect(await show(canvasElement, canvas, "Invoice sent")).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { type: "error", title: "Couldn't send the invoice", description: "The connection dropped. Nothing was sent.", action: "Try again" },
  play: async ({ canvas, canvasElement }) => {
    await show(canvasElement, canvas, "Couldn't send the invoice");
    await expect(within(canvasElement.ownerDocument.body).getByRole("button", { name: "Try again" })).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { type: "loading", title: "Exporting 1,204 rows" },
  play: async ({ canvas, canvasElement }) => {
    await expect(await show(canvasElement, canvas, "Exporting 1,204 rows")).toBeInTheDocument();
  },
};

/**
 * The close button dismisses the toast. Base UI hides it from the reading
 * cursor (the toast is announced, and Escape dismisses it), so it is found by
 * its slot.
 */
export const Dismiss: Story = {
  args: { title: "Draft saved" },
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await show(canvasElement, canvas, "Draft saved");
    const close = canvasElement.ownerDocument.querySelector<HTMLButtonElement>('[data-slot="toast-close"]');
    await expect(close).toHaveAttribute("aria-label", "Close toast");
    await userEvent.click(close!);
    await waitFor(() => expect(body.queryByText("Draft saved")).not.toBeInTheDocument());
  },
};
