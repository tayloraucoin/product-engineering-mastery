import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { DateRange } from "react-day-picker";
import { expect, userEvent, waitFor } from "storybook/test";

import { Calendar } from "./calendar";

type Args = {
  mode?: "single" | "range";
  disabledWeekends?: boolean;
  captionLayout?: "label" | "dropdown";
};

const month = new Date(2026, 9, 1);

function RangeCalendar() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 12),
    to: new Date(2026, 9, 16),
  });
  return (
    <Calendar
      mode="range"
      defaultMonth={month}
      selected={range}
      onSelect={setRange}
      className="rounded-lg border"
    />
  );
}

const meta = {
  title: "Primitives/Control/Calendar",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/calendar.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the caption's 0.8rem on text-xs; the day's secondary line at full strength, not 70% opacity",
    },
  },
  render: ({ mode = "single", disabledWeekends, captionLayout }: Args) =>
    mode === "range" ? (
      <RangeCalendar />
    ) : (
      <Calendar
        mode="single"
        defaultMonth={month}
        captionLayout={captionLayout}
        disabled={disabledWeekends ? { dayOfWeek: [0, 6] } : undefined}
        className="rounded-lg border"
      />
    ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("grid")).toHaveAccessibleName(/October 2026/);
  },
};

/** Pressing a day selects it. */
export const Select: Story = {
  play: async ({ canvas }) => {
    const day = canvas.getByRole("button", { name: /October 14th, 2026/ });
    await userEvent.click(day);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: /October 14th, 2026.*selected/ }),
      ).toBeInTheDocument(),
    );
  },
};

export const Range: Story = {
  args: { mode: "range" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /October 12th, 2026.*selected/ }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /October 16th, 2026.*selected/ }),
    ).toBeInTheDocument();
  },
};

export const DisabledDays: Story = {
  args: { disabledWeekends: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /Saturday, October 10th, 2026/ }),
    ).toBeDisabled();
  },
};

/** The next-month button moves the grid on. */
export const NextMonth: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next month/i }));
    await waitFor(() =>
      expect(canvas.getByRole("grid")).toHaveAccessibleName(/November 2026/),
    );
  },
};

export const Dropdowns: Story = { args: { captionLayout: "dropdown" } };
