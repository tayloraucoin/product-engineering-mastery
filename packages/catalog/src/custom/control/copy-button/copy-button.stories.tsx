import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { COPY_BUTTON_COPY } from "./copy";
import { CopyButton } from "./copy-button";

/** Puts a clipboard on `navigator` that resolves or rejects, and takes it away after. */
function withClipboard(works: boolean) {
  return () => {
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          works ? Promise.resolve() : Promise.reject(new Error("denied")),
      },
    });
    return () => {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    };
  };
}

const meta = {
  title: "Catalog/Control/Copy button/Custom",
  component: CopyButton,
  tags: ["source:custom", "verdict:unruled", "layer:composed"],
  args: { text: "synthetic-invite-code-4821" },
  parameters: {
    provenance: {
      upstream:
        "taylor-aucoin@7f8a4a1 app/admin/_components/copy-button.tsx (2026-09-25)",
      licence: "house",
      adapted:
        "onto @pem/ui Button (outline) and house tokens; words in copy.ts; a failedMessage prop",
    },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a press: the button, and an empty live region beside it. */
export const Idle: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
  },
};

/** After a press that reached the clipboard: the region says so. */
export const Copied: Story = {
  beforeEach: withClipboard(true),
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: COPY_BUTTON_COPY.label }),
    );
    await expect(
      await canvas.findByText(COPY_BUTTON_COPY.copied),
    ).toBeInTheDocument();
  },
};

/** After a press the browser refused: the region says what to do instead. */
export const Failed: Story = {
  beforeEach: withClipboard(false),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(
      await canvas.findByText(COPY_BUTTON_COPY.failed),
    ).toBeInTheDocument();
  },
};

/** A caller's own words, and an accessible name that says what is copied. */
export const CustomMessage: Story = {
  args: {
    label: "Copy invite",
    accessibleLabel: "Copy the invite code",
    copiedMessage: "Invite code copied; two fields were left blank",
  },
  beforeEach: withClipboard(true),
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Copy the invite code" }),
    );
    await expect(
      await canvas.findByText(/two fields were left blank/),
    ).toBeInTheDocument();
  },
};
