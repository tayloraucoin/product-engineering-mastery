import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Sidebar09 } from "./sidebar-09";

const meta = {
  title: "Catalog/Navigation/Sidebar 09/shadcn",
  component: Sidebar09,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-09.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping; the 350px and 260px widths on the spacing scale; the mail search has a label",
    },
  },
} satisfies Meta<typeof Sidebar09>;

export default meta;
type Story = StoryObj<typeof meta>;

const sidebar = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-slot="sidebar"][data-state]')!;

/** The sidebar renders expanded with its menu. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(sidebar(canvasElement)).toHaveAttribute(
      "data-state",
      "expanded",
    );
    await expect(
      canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]')
        .length,
    ).toBeGreaterThan(0);
  },
};

/** The trigger collapses it. */
export const Collapsed: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Toggle Sidebar" })[0]!,
    );
    await waitFor(() =>
      expect(sidebar(canvasElement)).toHaveAttribute("data-state", "collapsed"),
    );
  },
};

/** Its first menu opens on a press, with items to choose. */
export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[aria-haspopup="menu"]',
    )!;
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole("menu");
    await expect(
      menu.querySelectorAll('[role^="menuitem"]').length,
    ).toBeGreaterThan(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
