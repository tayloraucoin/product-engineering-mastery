import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../button/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";

type Args = { orientation?: "horizontal" | "vertical" };

const meta = {
  title: "Primitives/Control/Button group",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream: "ui.shadcn.com/r/styles/base-vega/button-group.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ orientation }: Args) => (
    <ButtonGroup orientation={orientation} aria-label="Text alignment">
      <Button variant="outline">Left</Button>
      <Button variant="outline">Centre</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole("group", { name: "Text alignment" });
    await expect(within(group).getAllByRole("button")).toHaveLength(3);
  },
};

export const Vertical: Story = { args: { orientation: "vertical" } };

/** Tab moves through each button in order. */
export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Left" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Centre" })).toHaveFocus();
  },
};

/** A text segment and a separator inside a group. */
export const WithText: Story = {
  render: () => (
    <ButtonGroup aria-label="Pages">
      <ButtonGroupText>Page 2 of 9</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline">Next</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Page 2 of 9")).toBeInTheDocument();
  },
};
