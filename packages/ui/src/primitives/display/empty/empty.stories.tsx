import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Inbox } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../control/button/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

type Args = { icon?: boolean; action?: boolean };

const meta = {
  title: "Primitives/Display/Empty",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/empty.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "cva in empty.variants.ts",
    },
  },
  render: ({ icon, action }: Args) => (
    <Empty>
      <EmptyHeader>
        {icon ? (
          <EmptyMedia variant="icon">
            <Inbox aria-hidden />
          </EmptyMedia>
        ) : null}
        <EmptyTitle>No invoices yet</EmptyTitle>
        <EmptyDescription>
          Invoices you issue appear here, newest first.
        </EmptyDescription>
      </EmptyHeader>
      {action ? (
        <EmptyContent>
          <Button>Create an invoice</Button>
        </EmptyContent>
      ) : null}
    </Empty>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = { args: { icon: true } };

/** The one next step, as the only action (J-36). */
export const WithAction: Story = {
  args: { icon: true, action: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Create an invoice" }),
    ).toBeInTheDocument();
  },
};
