import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "./message-scroller";

type Args = { count: number };

const lines = [
  "Can you move Thursday's review to Friday?",
  "Done. Friday at 10:00, same room.",
  "Thanks. Can you add Ada to the invite?",
  "Added. She has accepted.",
  "Great, and the agenda?",
  "Attached to the invite as a doc.",
];

const meta = {
  title: "Primitives/Layout/Message scroller",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/message-scroller.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "contain-intrinsic-size on the spacing scale",
    },
  },
  render: ({ count }: Args) => (
    <div className="flex h-64 max-w-sm flex-col rounded-lg border">
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport aria-label="Conversation">
            <MessageScrollerContent className="p-4">
              {lines.slice(0, count).map((line, index) => (
                <MessageScrollerItem
                  key={line}
                  messageId={String(index)}
                  scrollAnchor={index % 2 === 0}
                >
                  <p className="text-sm">{line}</p>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Short: Story = {
  args: { count: 2 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Done. Friday at 10:00, same room."),
    ).toBeInTheDocument();
  },
};

export const Long: Story = {
  args: { count: 6 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Attached to the invite as a doc."),
    ).toBeInTheDocument();
  },
};
