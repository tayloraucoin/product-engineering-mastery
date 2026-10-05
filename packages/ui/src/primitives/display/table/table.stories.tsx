import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Checkbox } from "../../control/checkbox/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const INVOICES = [
  { id: "INV-1042", client: "Northwind", status: "Paid", amount: "1,250.00" },
  { id: "INV-1043", client: "Contoso", status: "Pending", amount: "640.00" },
  { id: "INV-1044", client: "Fabrikam", status: "Overdue", amount: "2,180.00" },
];

type Args = { selected?: string; footer?: boolean };

const meta = {
  title: "Primitives/Display/Table",
  tags: ["source:shadcn", "verdict:kit", "layer:primitive"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/r/styles/base-vega/table.json, shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted: "as upstream, but for cn",
    },
  },
  render: ({ selected, footer }: Args) => (
    <Table>
      <TableCaption>Invoices issued in September (synthetic).</TableCaption>
      <TableHeader>
        <TableRow>
          {selected !== undefined ? (
            <TableHead className="w-8">
              <span className="sr-only">Select</span>
            </TableHead>
          ) : null}
          <TableHead>Invoice</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.id === selected ? "selected" : undefined}
          >
            {selected !== undefined ? (
              <TableCell>
                <Checkbox
                  aria-label={`Select ${row.id}`}
                  defaultChecked={row.id === selected}
                />
              </TableCell>
            ) : null}
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.client}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell className="text-right tabular-nums">
              {row.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {footer ? (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">4,070.00</TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Numbers right-aligned and tabular, so they compare down the column. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("row")).toHaveLength(4);
    await expect(
      canvas.getByRole("columnheader", { name: "Amount" }),
    ).toBeInTheDocument();
  },
};

export const WithFooter: Story = { args: { footer: true } };

/** One row selected: the checked box is the marker; the fill alone is too faint (C-P07). */
export const SelectedRow: Story = {
  args: { selected: "INV-1043" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("checkbox", { name: "Select INV-1043" }),
    ).toHaveAttribute("aria-checked", "true");
  },
};
