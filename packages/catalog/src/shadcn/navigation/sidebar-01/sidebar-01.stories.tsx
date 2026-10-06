import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Sidebar01 } from "./sidebar-01";

const meta = {
  title: "Catalog/Navigation/Sidebar 01/shadcn",
  component: Sidebar01,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-01.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping; the version switcher is a radio group (upstream's Radix onSelect never fired)",
    },
  },
} satisfies Meta<typeof Sidebar01>;

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

/** Choosing a version checks it and shows it on the trigger. */
export const PickVersion: Story = {
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: /Documentation/ });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("menuitemradio", { name: "v1.1.0-alpha" }),
    );
    await waitFor(() => expect(trigger).toHaveTextContent("v1.1.0-alpha"));
  },
};
