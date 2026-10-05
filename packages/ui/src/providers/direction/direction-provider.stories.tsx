import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../primitives/control/tabs/tabs";
import { DirectionProvider } from "./direction-provider";

const meta = {
  title: "Providers/Direction",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/direction.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "re-exported as is",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Right to left: Base UI's parts read their arrow keys in this direction. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <DirectionProvider direction="rtl">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">الحساب</TabsTrigger>
            <TabsTrigger value="b">الفواتير</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("tab")).toHaveLength(2);
  },
};
