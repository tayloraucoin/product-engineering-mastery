import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Primitives/Layout/Card",
  component: Card,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/card.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header, body and footer; one primary action (C-R03). */
export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Northwind renewal</CardTitle>
        <CardDescription>Due 14 October · 12 seats</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        The client asked for the annual price in writing.
      </CardContent>
      <CardFooter>
        <Button>Send the quote</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Northwind renewal")).toBeInTheDocument();
  },
};

/** A secondary action in the header's corner. */
export const WithAction: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Open tasks</CardTitle>
        <CardDescription>Three due this week</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm">
        Review the September invoices.
      </CardContent>
    </Card>
  ),
};
