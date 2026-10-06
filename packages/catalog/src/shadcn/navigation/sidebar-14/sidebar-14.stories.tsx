import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { Sidebar14 } from "./sidebar-14";

const meta = {
  title: "Catalog/Navigation/Sidebar 14/shadcn",
  component: Sidebar14,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-14.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping",
    },
  },
} satisfies Meta<typeof Sidebar14>;

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
