import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { DATA_TABLE_COPY } from "./copy";
import { DataTable, DataTableColumnHeader, type ColumnDef } from "./data-table";

type Invoice = { id: string; customer: string; status: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1042", customer: "Ada Lovelace", status: "Paid", amount: 250 },
  { id: "INV-1043", customer: "Grace Hopper", status: "Pending", amount: 1200 },
  { id: "INV-1044", customer: "Alan Turing", status: "Overdue", amount: 75 },
  {
    id: "INV-1045",
    customer: "Katherine Johnson",
    status: "Paid",
    amount: 480,
  },
  {
    id: "INV-1046",
    customer: "Edsger Dijkstra",
    status: "Pending",
    amount: 310,
  },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice" },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
  },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => money.format(row.original.amount),
  },
];

type Args = {
  data: Invoice[];
  selectable?: boolean;
  pageSize?: number;
};

const meta = {
  title: "Composed/Display/Data table",
  tags: ["source:shadcn", "verdict:kit", "layer:composed"],
  parameters: {
    provenance: {
      upstream:
        "ui.shadcn.com/docs/components/data-table (base), shadcn 4.21.0 (read 2026-10-04)",
      licence: "MIT",
      adapted:
        "the guide's steps made one component on @tanstack/react-table 8.21.3: sorting with aria-sort, one named filter, selection, pages; strings in copy.ts",
    },
  },
  render: ({ data, selectable, pageSize }: Args) => (
    <DataTable
      columns={columns}
      data={data}
      filterColumn="customer"
      filterPlaceholder="Ada, Grace…"
      selectable={selectable}
      getRowLabel={(invoice) => invoice.id}
      pageSize={pageSize}
      className="max-w-2xl"
    />
  ),
  args: { data: invoices },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("row")).toHaveLength(6);
    await expect(canvas.getByText("$1,200.00")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(DATA_TABLE_COPY.noData)).toBeInTheDocument();
    await expect(canvas.queryByRole("searchbox")).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  },
};

/** Typing in the filter narrows the rows. */
export const Filtered: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Filter by customer" }),
      "grace",
    );
    await expect(canvas.getAllByRole("row")).toHaveLength(2);
    await expect(canvas.getByText("Grace Hopper")).toBeInTheDocument();
  },
};

/** A filter that matches nothing says so, and keeps the filter to change. */
export const NoMatch: Story = {
  play: async ({ canvas }) => {
    const filter = canvas.getByRole("searchbox", {
      name: "Filter by customer",
    });
    await userEvent.type(filter, "zzz");
    await expect(
      canvas.getByText(DATA_TABLE_COPY.noResults),
    ).toBeInTheDocument();
    await expect(filter).toBeInTheDocument();
  },
};

/** A header press sorts, and the header says which way. */
export const Sorted: Story = {
  play: async ({ canvas }) => {
    const sort = canvas.getByRole("button", { name: "Sort by Amount" });
    await userEvent.click(sort);
    const header = sort.closest("th");
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    const firstRow = canvas.getAllByRole("row")[1]!;
    await expect(within(firstRow).getByText("$75.00")).toBeInTheDocument();
  },
};

/** Selecting rows counts them and marks each with a checked box. */
export const Selected: Story = {
  args: { selectable: true },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("checkbox", { name: "Select INV-1042" });
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await expect(
      canvas.getByRole("checkbox", { name: "Select INV-1043" }),
    ).not.toBeChecked();
    await expect(
      canvas.getByText("1 of 5 row(s) selected."),
    ).toBeInTheDocument();
  },
};

/** Two rows a page: Next moves on, and Previous comes alive. */
export const Paged: Story = {
  args: { pageSize: 2 },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Previous" }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Next" }));
    await expect(canvas.getByText("Page 2 of 3")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Previous" }),
    ).toBeEnabled();
  },
};
