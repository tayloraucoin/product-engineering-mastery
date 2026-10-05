import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { RadioGroup, RadioGroupItem } from "./radio-group";

const OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "never", label: "Never" },
];

const meta = {
  title: "Primitives/Control/Radio group",
  component: RadioGroup,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/radio-group.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  args: { "aria-label": "Summary email", defaultValue: "daily" },
  render: (args) => (
    <RadioGroup {...args}>
      {OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm">
          <RadioGroupItem value={option.value} />
          {option.label}
        </label>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoneChosen: Story = { args: { defaultValue: undefined } };

/** Choosing another option moves the selection; only one is checked. */
export const Choose: Story = {
  play: async ({ canvas }) => {
    const weekly = canvas.getByRole("radio", { name: "Weekly" });
    await userEvent.click(weekly);
    await expect(weekly).toHaveAttribute("aria-checked", "true");
    await expect(canvas.getByRole("radio", { name: "Daily" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  },
};

export const Disabled: Story = { args: { disabled: true } };
