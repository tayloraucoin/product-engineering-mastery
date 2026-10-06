import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Misnamed } from "./misnamed";

const meta = {
  title: "Misnamed",
  component: Misnamed,
} satisfies Meta<typeof Misnamed>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
