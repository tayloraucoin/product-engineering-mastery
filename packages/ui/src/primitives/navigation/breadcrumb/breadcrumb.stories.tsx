import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

type Args = { collapsed?: boolean };

const meta = {
  title: "Primitives/Navigation/Breadcrumb",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/breadcrumb.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ collapsed }: Args) => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {collapsed ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="#clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>Northwind</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The trail, with the current page marked as such. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("navigation")).toBeInTheDocument();
    await expect(canvas.getByText("Northwind")).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};

/** A long trail, its middle collapsed. */
export const Collapsed: Story = { args: { collapsed: true } };
