import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const ITEMS = [
  {
    value: "billing",
    question: "When am I billed?",
    body: "On the first of each month, for the seats in use.",
  },
  {
    value: "seats",
    question: "Can I change seats mid-month?",
    body: "Yes; the change is prorated on the next invoice.",
  },
  {
    value: "export",
    question: "How do I export my data?",
    body: "From Settings, as CSV or JSON.",
  },
];

type Args = { defaultValue?: string[]; multiple?: boolean };

const meta = {
  title: "Primitives/Layout/Accordion",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/accordion.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "no height animation (C-P11); the trigger transitions colour and ring only",
    },
  },
  render: (args: Args) => (
    <Accordion {...args} className="w-96">
      {ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const OneOpen: Story = { args: { defaultValue: ["billing"] } };

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ["billing", "seats"] },
};

/** A press opens a section; the trigger says so. */
export const Open: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Can I change seats mid-month?",
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

/** Reached from the keyboard, so the focus ring shows. */
export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "When am I billed?" }),
    ).toHaveFocus();
  },
};
