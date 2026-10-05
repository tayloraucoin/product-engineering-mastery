import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Bubble, BubbleContent, BubbleReactions } from "./bubble";

type Variant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive";
type Args = { variant?: Variant; align?: "start" | "end"; text?: string };

const meta = {
  title: "Primitives/Display/Bubble",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/bubble.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "cva in bubble.variants.ts; the tinted variant on a primary tint in place of relative oklch() colours; dark hovers on muted/50; the focus ring appears at once",
    },
  },
  args: { text: "The proposal is in your inbox; the pricing is on page 3." },
  render: ({ variant, align, text }: Args) => (
    <Bubble variant={variant} align={align}>
      <BubbleContent>{text}</BubbleContent>
    </Bubble>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Muted: Story = { args: { variant: "muted" } };
export const Tinted: Story = { args: { variant: "tinted" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = {
  args: { variant: "destructive", text: "This message could not be sent." },
};

/** Sent by the reader: aligned to the end. */
export const End: Story = { args: { align: "end", variant: "secondary" } };

/** Reactions pinned to the bubble's edge. */
export const WithReactions: Story = {
  render: () => (
    <Bubble variant="secondary">
      <BubbleContent>Shipped the fix this morning.</BubbleContent>
      <BubbleReactions>
        <span aria-label="2 thumbs up">+2</span>
      </BubbleReactions>
    </Bubble>
  ),
};

/** A bubble that acts: rendered as a button, it takes focus and shows the ring. */
export const AsButton: Story = {
  render: () => (
    <Bubble variant="outline">
      <BubbleContent render={<button type="button" />}>
        Retry sending
      </BubbleContent>
    </Bubble>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Retry sending" }),
    ).toHaveFocus();
  },
};
