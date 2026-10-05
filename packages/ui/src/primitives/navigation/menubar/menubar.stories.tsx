import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "./menubar";

const meta = {
  title: "Primitives/Navigation/Menubar",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/menubar.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New page <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Duplicate</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Export as PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem defaultChecked>Show ruler</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show grid</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("menubar")).toBeInTheDocument();
    await expect(canvas.getAllByRole("menuitem")).toHaveLength(2);
  },
};

/** A press opens a menu; Escape closes it. */
export const Open: Story = {
  play: async ({ canvas, canvasElement }) => {
    const file = canvas.getByRole("menuitem", { name: "File" });
    await userEvent.click(file);
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole("menuitem", { name: /New page/ }),
    ).toBeInTheDocument();
    await expect(
      body.getByRole("menuitem", { name: "Export as PDF" }),
    ).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        body.queryByRole("menuitem", { name: /New page/ }),
      ).not.toBeInTheDocument(),
    );
  },
};

/** A checkbox item reports its state. */
export const Checkbox: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("menuitem", { name: "View" }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByRole("menuitemcheckbox", { name: "Show ruler" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      body.getByRole("menuitemcheckbox", { name: "Show grid" }),
    ).toHaveAttribute("aria-checked", "false");
  },
};
