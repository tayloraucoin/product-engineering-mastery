import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { Sidebar11 } from "./sidebar-11";

const meta = {
  title: "Catalog/Navigation/Sidebar 11/shadcn",
  component: Sidebar11,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-11.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping; file leaves sit in list items; the folder chevron turns on Base UI's data-open",
    },
  },
} satisfies Meta<typeof Sidebar11>;

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
