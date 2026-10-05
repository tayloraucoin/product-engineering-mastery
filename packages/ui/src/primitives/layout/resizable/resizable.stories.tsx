import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";

const meta = {
  title: "Primitives/Layout/Resizable",
  component: ResizablePanelGroup,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/resizable.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two panes split by a draggable, focusable handle. */
export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-40 w-96 rounded-md border"
    >
      <ResizablePanel defaultSize={40}>
        <div className="p-3 text-sm">Inbox</div>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize the inbox" />
      <ResizablePanel defaultSize={60}>
        <div className="p-3 text-sm">Message</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toBeInTheDocument();
  },
};

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-64 w-72 rounded-md border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="p-3 text-sm">Editor</div>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize the editor" />
      <ResizablePanel defaultSize={50}>
        <div className="p-3 text-sm">Preview</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
