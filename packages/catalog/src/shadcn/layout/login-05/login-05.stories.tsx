import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Login05 } from "./login-05";

const meta = {
  title: "Catalog/Layout/Login 05/shadcn",
  component: Login05,
  tags: ["source:shadcn", "verdict:shelf", "layer:block"],
  parameters: {
    layout: "fullscreen",
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/login-05.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "kit imports through @pem/ui subpaths; icons resolved to lucide; house tokens by the copy-in mapping",
    },
  },
} satisfies Meta<typeof Login05>;

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
