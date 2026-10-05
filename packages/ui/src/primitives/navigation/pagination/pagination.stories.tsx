import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

type Args = { current: number };

const meta = {
  title: "Primitives/Navigation/Pagination",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/pagination.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ current }: Args) => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#previous" />
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`#page-${page}`} isActive={page === current}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { current: 2 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("navigation", { name: /pagination/i }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "1" })).not.toHaveAttribute(
      "aria-current",
    );
  },
};

export const FirstPage: Story = { args: { current: 1 } };

/** Tab reaches previous, each page, then next. */
export const Focus: Story = {
  args: { current: 2 },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole("link", { name: /previous page/i }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "1" })).toHaveFocus();
  },
};
