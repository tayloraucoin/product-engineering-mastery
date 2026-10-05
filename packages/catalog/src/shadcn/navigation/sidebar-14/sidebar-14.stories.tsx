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

/** The sidebar renders expanded, and the trigger collapses it. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const sidebar = () =>
      canvasElement.querySelector<HTMLElement>(
        '[data-slot="sidebar"][data-state]',
      )!;
    await expect(sidebar()).toHaveAttribute("data-state", "expanded");
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Toggle Sidebar" })[0]!,
    );
    await waitFor(() =>
      expect(sidebar()).toHaveAttribute("data-state", "collapsed"),
    );
  },
};
