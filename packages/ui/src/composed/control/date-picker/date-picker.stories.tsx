import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { DATE_PICKER_COPY } from "./copy";
import { DatePicker } from "./date-picker";

const meta = {
  title: "Composed/Control/Date picker",
  component: DatePicker,
  tags: ["source:shadcn", "verdict:kit", "layer:composed"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/docs/components/date-picker (base), shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the recipe made one component: controlled or not, strings in copy.ts, the popover closes on a choice",
    },
  },
  args: { "aria-label": "Start date" },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Start date" }),
    ).toHaveTextContent(DATE_PICKER_COPY.placeholder);
  },
};

export const Chosen: Story = {
  args: { defaultValue: new Date(2026, 9, 14) },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Start date" }),
    ).toHaveTextContent("October 14th, 2026");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Start date" }),
    ).toBeDisabled();
  },
};

/** Opening the calendar and choosing a day fills the trigger and closes it. */
export const Choose: Story = {
  args: { defaultValue: new Date(2026, 9, 1) },
  play: async ({ canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Start date" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await body.findByRole("button", { name: /October 20th, 2026/ }),
    );
    await waitFor(() =>
      expect(trigger).toHaveTextContent("October 20th, 2026"),
    );
    await waitFor(() =>
      expect(body.queryByRole("grid")).not.toBeInTheDocument(),
    );
  },
};
