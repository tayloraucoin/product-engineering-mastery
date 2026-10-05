import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Avatar, AvatarFallback } from "../avatar/avatar";
import { Bubble, BubbleContent } from "../bubble/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "./message";

const meta = {
  title: "Primitives/Display/Message",
  component: Message,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/message.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Someone else's message: avatar, name and time, the bubble, then its status. */
export const Incoming: Story = {
  render: () => (
    <Message className="w-96">
      <MessageAvatar>
        <Avatar size="sm">
          <AvatarFallback>DO</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>Dana Okafor · 9:41</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>Can we move the review to Thursday?</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Can we move the review to Thursday?"),
    ).toBeInTheDocument();
  },
};

/** The reader's own message, aligned to the end, with its delivery status. */
export const Outgoing: Story = {
  render: () => (
    <Message align="end" className="w-96">
      <MessageContent>
        <Bubble>
          <BubbleContent>
            Thursday works. I will send a new invite.
          </BubbleContent>
        </Bubble>
        <MessageFooter>Read 9:43</MessageFooter>
      </MessageContent>
    </Message>
  ),
};

/** A short exchange. */
export const Conversation: Story = {
  render: () => (
    <MessageGroup className="w-96">
      <Message>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>Is the September invoice paid?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble>
            <BubbleContent>Yes, on the 28th.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};
