import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleCheck } from "lucide-react";
import { expect, userEvent } from "storybook/test";

import { Marker, MarkerContent, MarkerIcon } from "./marker";

type Args = {
  variant?: "default" | "separator" | "border";
  text?: string;
  icon?: boolean;
};

const meta = {
  title: "Primitives/Display/Marker",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/marker.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "cva in marker.variants.ts",
    },
  },
  args: { text: "Dana joined the conversation", icon: true },
  render: ({ variant, text, icon }: Args) => (
    <Marker variant={variant} className="w-80">
      {icon ? (
        <MarkerIcon>
          <CircleCheck />
        </MarkerIcon>
      ) : null}
      <MarkerContent>{text}</MarkerContent>
    </Marker>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An event in a timeline or thread, with its icon. */
export const Default: Story = {};

/** A day break between messages. */
export const Separator: Story = {
  args: { variant: "separator", text: "Today", icon: false },
};

export const Border: Story = { args: { variant: "border" } };

/** Content with a link: it takes focus, and the ring shows. */
export const WithLink: Story = {
  render: () => (
    <Marker className="w-80">
      <MarkerContent>
        Dana shared <a href="#invoice">the September invoice</a>
      </MarkerContent>
    </Marker>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("link", { name: "the September invoice" }),
    ).toHaveFocus();
  },
};
