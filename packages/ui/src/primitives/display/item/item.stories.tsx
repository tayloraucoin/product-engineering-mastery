import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Button } from "../../control/button/button";
import { FileTextIcon } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

type Args = { variant?: "default" | "outline" | "muted"; size?: "default" | "sm" | "xs" };

const meta = {
  title: "Primitives/Display/Item",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream: "ui.shadcn.com/r/styles/base-vega/item.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: (args: Args) => (
    <Item {...args} className="max-w-md">
      <ItemMedia variant="icon">
        <FileTextIcon aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Q3 board report</ItemTitle>
        <ItemDescription>Edited by Ada Lovelace, 2 hours ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="sm">Open</Button>
      </ItemActions>
    </Item>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Q3 board report")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Open" })).toBeInTheDocument();
  },
};

export const Outline: Story = { args: { variant: "outline" } };

export const Muted: Story = { args: { variant: "muted" } };

export const Small: Story = { args: { size: "sm" } };

/** An item rendered as a link takes focus as one target. */
export const Link: Story = {
  render: () => (
    <Item variant="outline" className="max-w-md" render={<a href="#report" />}>
      <ItemContent>
        <ItemTitle>Q3 board report</ItemTitle>
        <ItemDescription>Opens the report</ItemDescription>
      </ItemContent>
    </Item>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: /Q3 board report/ })).toHaveFocus();
  },
};

/** A list of items with separators. */
export const Group: Story = {
  render: () => (
    <ItemGroup className="max-w-md">
      <Item role="listitem">
        <ItemContent>
          <ItemTitle>Q3 board report</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item role="listitem">
        <ItemContent>
          <ItemTitle>Hiring plan</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list")).toBeInTheDocument();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
