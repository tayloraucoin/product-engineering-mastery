import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";

const meta = {
  title: "Primitives/Display/Avatar",
  component: Avatar,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/avatar.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No image: the initials stand in. */
export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>DO</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("DO")).toBeInTheDocument();
  },
};

/** An image (the brand mark the workshop serves); the initials show until it loads. */
export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/brand/mark.svg" alt="Dana Okafor" />
      <AvatarFallback>DO</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  ...Fallback,
  args: { size: "sm" },
  play: undefined,
};

export const Large: Story = {
  ...Fallback,
  args: { size: "lg" },
  play: undefined,
};

/** A status dot on the avatar's edge. */
export const WithBadge: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>DO</AvatarFallback>
      <AvatarBadge>
        <span className="sr-only">Online</span>
      </AvatarBadge>
    </Avatar>
  ),
};

/** Overlapping avatars, then a count of the rest. */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {["DO", "MR", "JS"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+4</AvatarGroupCount>
    </AvatarGroup>
  ),
};
