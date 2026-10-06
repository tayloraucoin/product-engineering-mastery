import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type Args = { defaultOpen?: boolean };

const meta = {
  title: "Primitives/Feedback/Dropdown menu",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/dropdown-menu.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "min-w-24 for the list's px minimum; shadow-overlay and shadow-modal for submenus",
    },
  },
  render: (args: Args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Invoice INV-1043</DropdownMenuLabel>
          <DropdownMenuItem>
            Duplicate
            <DropdownMenuShortcut>D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem defaultChecked>
            Show paid
          </DropdownMenuCheckboxItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Drafts</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

/** The keyboard path: Enter opens, arrows move, Escape closes and returns focus. */
export const Keyboard: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Actions" });
    await userEvent.keyboard("{Enter}");
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      "menu",
    );
    await expect(
      within(menu).getByRole("menuitem", { name: /Duplicate/ }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
