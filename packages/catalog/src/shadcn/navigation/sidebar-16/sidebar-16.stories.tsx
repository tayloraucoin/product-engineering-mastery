import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Sidebar16 } from "./sidebar-16";

const meta = {
  title: "Catalog/Navigation/Sidebar 16/shadcn",
  component: Sidebar16,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-16.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping",
    },
  },
} satisfies Meta<typeof Sidebar16>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The sidebar renders with its menu. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="sidebar"]'),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]')
        .length,
    ).toBeGreaterThan(0);
  },
};
