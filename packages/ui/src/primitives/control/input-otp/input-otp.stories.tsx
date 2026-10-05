import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

/** The story's own controls: the one-time-code input's props, with the slots drawn by the story. */
type Args = {
  maxLength: number;
  "aria-label": string;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
};

const meta = {
  title: "Primitives/Control/Input otp",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/input-otp.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "shadow-resting; a stray style placeholder and an inert caret duration removed",
    },
  },
  args: { maxLength: 6, "aria-label": "One-time code" },
  render: ({ invalid, ...args }: Args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        {[0, 1, 2].map((index) => (
          <InputOTPSlot key={index} index={index} aria-invalid={invalid} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {[3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} aria-invalid={invalid} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

/** Typing fills the slots in order. */
export const Typing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "One-time code" });
    await userEvent.type(input, "482193");
    await expect(input).toHaveValue("482193");
  },
};

export const Filled: Story = { args: { defaultValue: "482193" } };

export const Invalid: Story = {
  args: { defaultValue: "4821", invalid: true } as Args,
};

export const Disabled: Story = { args: { disabled: true } };
