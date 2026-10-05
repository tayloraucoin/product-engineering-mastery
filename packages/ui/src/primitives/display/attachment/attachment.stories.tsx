import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileTextIcon, XIcon } from "lucide-react";
import { expect, userEvent } from "storybook/test";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "./attachment";

type Args = {
  state?: "idle" | "uploading" | "processing" | "error" | "done";
  description?: string;
};

const meta = {
  title: "Primitives/Display/Attachment",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/attachment.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "the error description at full destructive, not 80%",
    },
  },
  render: ({ state, description }: Args) => (
    <Attachment state={state} className="w-full max-w-sm">
      <AttachmentMedia>
        <FileTextIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>q3-board-report.pdf</AttachmentTitle>
        <AttachmentDescription>{description}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove q3-board-report.pdf">
          <XIcon aria-hidden="true" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Done: Story = {
  args: { state: "done", description: "PDF · 2.4 MB" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("q3-board-report.pdf")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Remove q3-board-report.pdf" }),
    ).toBeInTheDocument();
  },
};

export const Uploading: Story = {
  args: { state: "uploading", description: "Uploading, 40%" },
};

export const Error: Story = {
  args: {
    state: "error",
    description: "Upload failed. The file is over 25 MB.",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Upload failed/)).toBeInTheDocument();
  },
};

/** The remove action takes focus. */
export const Focus: Story = {
  args: { state: "done", description: "PDF · 2.4 MB" },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "Remove q3-board-report.pdf" }),
    ).toHaveFocus();
  },
};

/** A scrolling row of attachments. */
export const Group: Story = {
  render: () => (
    <AttachmentGroup className="max-w-md">
      {["brief.pdf", "budget.xlsx", "photos.zip"].map((file) => (
        <Attachment key={file}>
          <AttachmentMedia>
            <FileTextIcon aria-hidden="true" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file}</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("budget.xlsx")).toBeInTheDocument();
  },
};
