import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Sidebar15 } from "./sidebar-15";

const meta = {
  title: "Catalog/Navigation/Sidebar 15/shadcn",
  component: Sidebar15,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-15.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping; collapsible items render as the list item; the date picker's cell size on the spacing scale and a fixed month; calendar toggles carry aria-pressed on an audited border; buttons and emoji as sidebar-10",
    },
  },
} satisfies Meta<typeof Sidebar15>;

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

/** A section toggles on a press, and says which way it went. */
export const SectionToggle: Story = {
  play: async ({ canvasElement }) => {
    const toggle = [
      ...canvasElement.querySelectorAll<HTMLElement>("[aria-expanded]"),
    ].find(
      (el) =>
        !el.hasAttribute("aria-haspopup") &&
        !el.closest('[data-slot="sidebar-rail"]'),
    )!;
    const was = toggle.getAttribute("aria-expanded");
    await userEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute(
        "aria-expanded",
        was === "true" ? "false" : "true",
      ),
    );
  },
};

/** The sidebar's calendar selects a day on a press. */
export const PickDay: Story = {
  play: async ({ canvas }) => {
    const day = canvas.getByRole("button", { name: /October 20th, 2026/ });
    await userEvent.click(day);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: /October 20th, 2026.*selected/ }),
      ).toBeInTheDocument(),
    );
  },
};
