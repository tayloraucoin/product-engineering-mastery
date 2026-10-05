import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

type Args = React.ComponentProps<typeof Tabs> & {
  variant?: "default" | "line";
};

const meta = {
  title: "Primitives/Control/Tabs",
  component: Tabs,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/tabs.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "cva in tabs.variants.ts; shadow-raised on the active tab; inactive labels on muted-foreground; spacing steps for the list's padding and the line's offset",
    },
  },
  args: { defaultValue: "overview" },
  render: ({ variant, ...args }: Args) => (
    <Tabs {...args} className="w-80">
      <TabsList variant={variant}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        Three open tasks, one due today.
      </TabsContent>
      <TabsContent value="activity">
        Dana closed two tasks this morning.
      </TabsContent>
      <TabsContent value="billing">Billing is managed by an admin.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The line variant: an underline marks the active tab. */
export const Line: Story = { args: { variant: "line" } as Args };

export const Vertical: Story = { args: { orientation: "vertical" } };

/** Arrow keys move between tabs and show the matching panel. */
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    const activity = canvas.getByRole("tab", { name: "Activity" });
    await expect(activity).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(activity).toHaveAttribute("aria-selected", "true");
  },
};
