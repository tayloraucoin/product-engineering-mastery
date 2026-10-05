import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "./native-select";

const meta = {
  title: "Primitives/Control/Native select",
  component: NativeSelect,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/native-select.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "shadow-resting; options on the popover roles rather than the system Canvas colours",
    },
  },
  args: { "aria-label": "Time zone", defaultValue: "europe-london" },
  render: (args) => (
    <NativeSelect {...args}>
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="europe-london">London</NativeSelectOption>
        <NativeSelectOption value="europe-paris">Paris</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Americas">
        <NativeSelectOption value="america-new-york">
          New York
        </NativeSelectOption>
        <NativeSelectOption value="america-chicago">Chicago</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The browser's own picker: choosing sets the value. */
export const Choose: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Time zone" });
    await userEvent.selectOptions(select, "america-chicago");
    await expect(select).toHaveValue("america-chicago");
  },
};

export const Small: Story = { args: { size: "sm" } };

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = { args: { disabled: true } };
