import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Sidebar13 } from "./sidebar-13";

const meta = {
  title: "Catalog/Navigation/Sidebar 13/shadcn",
  component: Sidebar13,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/sidebar-13.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping",
    },
  },
} satisfies Meta<typeof Sidebar13>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The settings dialog opens with its own sidebar; Escape closes it. */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole("button", { name: "Open Dialog" }),
    ).toBeInTheDocument();
  },
};
