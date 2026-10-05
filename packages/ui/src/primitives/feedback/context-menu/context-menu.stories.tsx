import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

const meta = {
  title: "Primitives/Feedback/Context menu",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/context-menu.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "as upstream, but for cn; shadow-overlay and shadow-modal for submenus",
    },
  },
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Right-click a row
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Open
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The area it belongs to; the menu opens on right-click or the context-menu key. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Right-click a row")).toBeInTheDocument();
  },
};
