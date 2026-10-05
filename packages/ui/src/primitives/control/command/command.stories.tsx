import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarIcon, SettingsIcon, UserIcon } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../button/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const Items = () => (
  <CommandList>
    <CommandEmpty>No command matches.</CommandEmpty>
    <CommandGroup heading="Go to">
      <CommandItem>
        <CalendarIcon aria-hidden="true" />
        <span>Calendar</span>
      </CommandItem>
      <CommandItem>
        <UserIcon aria-hidden="true" />
        <span>Profile</span>
        <CommandShortcut>⌘P</CommandShortcut>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem disabled>
        <SettingsIcon aria-hidden="true" />
        <span>Billing</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
);

const meta = {
  title: "Primitives/Control/Command",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/command.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "as upstream, but for cn; icons resolved from the registry's placeholders to lucide",
    },
  },
  render: () => (
    <Command className="max-w-sm rounded-lg border" label="Commands">
      <CommandInput placeholder="Type a command or search" />
      <Items />
    </Command>
  ),
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("option")).toHaveLength(3);
    await expect(
      canvas.getByRole("option", { name: "Billing" }),
    ).toHaveAttribute("aria-disabled", "true");
  },
};

/** Typing filters the commands. */
export const Filter: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("combobox"), "prof");
    await waitFor(() => expect(canvas.getAllByRole("option")).toHaveLength(1));
    await expect(
      canvas.getByRole("option", { name: /Profile/ }),
    ).toBeInTheDocument();
  },
};

/**
 * Nothing matches: the empty message shows. cmdk keeps its listbox, now with no
 * options, beside the message, so axe's required-children rule is off for this
 * one state (recorded in CAT-11's as-built).
 */
export const NoMatch: Story = {
  parameters: {
    a11y: {
      config: { rules: [{ id: "aria-required-children", enabled: false }] },
    },
  },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole("combobox"), "zzz");
    await expect(
      await canvas.findByText("No command matches."),
    ).toBeInTheDocument();
  },
};

/** The palette in a dialog, opened from a button and named by its title. */
export const InDialog: Story = {
  render: () => <DialogDemo />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open commands" }),
    );
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog")).toHaveAccessibleName(
      "Command Palette",
    );
    await expect(
      body.getByRole("option", { name: "Calendar" }),
    ).toBeInTheDocument();
  },
};

function DialogDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open commands
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command label="Commands">
          <CommandInput placeholder="Type a command or search" />
          <Items />
        </Command>
      </CommandDialog>
    </>
  );
}
