import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./combobox";

const timezones = [
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
];

type Args = { disabled?: boolean; defaultValue?: string };

const meta = {
  title: "Primitives/Control/Combobox",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/combobox.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "Base UI imported by its combobox subpath, not the barrel",
    },
  },
  render: ({ disabled, defaultValue }: Args) => (
    <Combobox items={timezones} defaultValue={defaultValue}>
      <ComboboxInput
        aria-label="Time zone"
        placeholder="Search time zones"
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No time zone matches.</ComboboxEmpty>
        <ComboboxList>
          {(zone: string) => (
            <ComboboxItem key={zone} value={zone}>
              {zone}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("combobox", { name: "Time zone" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const WithValue: Story = {
  args: { defaultValue: "Asia/Tokyo" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("combobox", { name: "Time zone" }),
    ).toHaveValue("Asia/Tokyo");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("combobox", { name: "Time zone" }),
    ).toBeDisabled();
  },
};

/** Typing filters the list to what matches. */
export const Filter: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(
      canvas.getByRole("combobox", { name: "Time zone" }),
      "europe",
    );
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getAllByRole("option")).toHaveLength(2));
  },
};

/** Nothing matches: the empty message shows. */
export const NoMatch: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(
      canvas.getByRole("combobox", { name: "Time zone" }),
      "mars",
    );
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByText("No time zone matches."),
    ).toBeInTheDocument();
  },
};
