import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Covered } from "./covered";

const meta = {
  title: "Composed/Control/Covered",
  component: Covered,
} satisfies Meta<typeof Covered>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
