import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];
const VEG = [
  { value: "carrot", label: "Carrot" },
  { value: "leek", label: "Leek" },
];

type Args = React.ComponentProps<typeof Select> & {
  size?: "sm" | "default";
  invalid?: boolean;
};

const meta = {
  title: "Primitives/Control/Select",
  component: Select,
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/select.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "shadow-resting on the trigger, shadow-overlay on the list; its open and close on the fast motion token",
    },
  },
  args: { items: [...FRUIT, ...VEG] },
  render: ({ size, invalid, ...args }: Args) => (
    <Select {...args}>
      <SelectTrigger
        aria-label="Produce"
        aria-invalid={invalid}
        size={size}
        className="w-48"
      >
        <SelectValue placeholder="Choose produce" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruit</SelectLabel>
          {FRUIT.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          {VEG.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen: the placeholder, in muted text. */
export const Placeholder: Story = {};

export const Chosen: Story = { args: { defaultValue: "banana" } };

/** A press opens the list; choosing closes it and shows the choice. */
export const Choose: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("combobox", { name: "Produce" }));
    const list = await within(canvasElement.ownerDocument.body).findByRole(
      "listbox",
    );
    await userEvent.click(within(list).getByRole("option", { name: "Leek" }));
    await expect(canvas.getByRole("combobox")).toHaveTextContent("Leek");
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole("listbox"),
      ).toBeNull(),
    );
  },
};

export const Small: Story = { args: { size: "sm" } as Args };

export const Invalid: Story = { args: { invalid: true } as Args };

export const Disabled: Story = { args: { disabled: true } };

/** Reached from the keyboard, so the trigger's focus ring shows. */
export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("combobox", { name: "Produce" }),
    ).toHaveFocus();
  },
};

/** Open, at rest: the list with its groups, labels and separator. */
export const Open: Story = {
  args: { defaultOpen: true, defaultValue: "apple" },
};

/** The keyboard path: Enter opens, Escape closes and returns focus to the trigger. */
export const Keyboard: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.tab();
    const trigger = canvas.getByRole("combobox", { name: "Produce" });
    await userEvent.keyboard("{Enter}");
    await within(canvasElement.ownerDocument.body).findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole("listbox"),
      ).toBeNull(),
    );
  },
};
