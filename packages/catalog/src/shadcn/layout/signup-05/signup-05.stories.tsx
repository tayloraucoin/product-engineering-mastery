import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Signup05 } from "./signup-05";

const meta = {
  title: "Catalog/Layout/Signup 05/shadcn",
  component: Signup05,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/signup-05.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping; the Apple, Google and Meta marks are their owners' trademarks, outside the MIT licence",
    },
  },
} satisfies Meta<typeof Signup05>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The form's fields are named by their labels, and typing fills them. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const email = canvas.getByLabelText(/^email$/i);
    await expect(email).toBeRequired();
    await userEvent.type(email, "ada@example.com");
    await expect(email).toHaveValue("ada@example.com");
    await expect(
      canvas.queryByLabelText(/^password$/i),
    ).not.toBeInTheDocument();
  },
};

/** Tab reaches the email field before the submit button. */
export const Focus: Story = {
  play: async ({ canvas }) => {
    const email = canvas.getByLabelText(/^email$/i);
    email.focus();
    await expect(email).toHaveFocus();
    await userEvent.tab();
    await expect(email).not.toHaveFocus();
  },
};
