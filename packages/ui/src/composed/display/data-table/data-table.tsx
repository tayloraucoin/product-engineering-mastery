"use client";

/**
 * shadcn's data table recipe (ui.shadcn.com/docs/components/data-table, read
 * 2026-10-04) made one component on @tanstack/react-table v8: sorting by
 * header, one text filter, row selection and pages, over the kit's Table.
 */
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button/button";
import { Checkbox } from "../../../primitives/control/checkbox/checkbox";
import { Input } from "../../../primitives/control/input/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../primitives/display/table/table";
import { DATA_TABLE_COPY } from "./copy";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** The column the text filter searches, by id or accessor key. */
  filterColumn?: string;
  /** The filter's visible prompt; its accessible name comes from copy. */
  filterPlaceholder?: string;
  /** Rows per page. */
  pageSize?: number;
  /** A leading checkbox column, with a count of the selection. */
  selectable?: boolean;
  className?: string;
};

/** A header that sorts its column, and says which way it is sorted. */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) {
  if (!column.getCanSort()) return <span>{title}</span>;
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2.5"
      aria-label={DATA_TABLE_COPY.sortBy(title)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <Icon aria-hidden="true" data-icon="inline-end" />
    </Button>
  );
}

function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label={DATA_TABLE_COPY.selectAll}
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={DATA_TABLE_COPY.selectRow}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  };
}

function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
  pageSize = 10,
  selectable = false,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const allColumns = React.useMemo(
    () =>
      selectable
        ? [selectColumn<TData>(), ...(columns as ColumnDef<TData>[])]
        : (columns as ColumnDef<TData>[]),
    [columns, selectable],
  );

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize } },
    state: { sorting, columnFilters, rowSelection },
  });

  const filter = filterColumn ? table.getColumn(filterColumn) : undefined;
  const filterName =
    typeof filter?.columnDef.header === "string"
      ? filter.columnDef.header
      : filterColumn;
  const pages = Math.max(table.getPageCount(), 1);

  return (
    <div
      data-slot="data-table"
      className={cn("flex flex-col gap-4", className)}
    >
      {filter ? (
        <Input
          type="search"
          aria-label={DATA_TABLE_COPY.filterLabel(filterName ?? "")}
          placeholder={filterPlaceholder}
          value={(filter.getFilterValue() as string) ?? ""}
          onChange={(event) => filter.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      ) : null}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {DATA_TABLE_COPY.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          {selectable
            ? DATA_TABLE_COPY.selected(
                table.getFilteredSelectedRowModel().rows.length,
                table.getFilteredRowModel().rows.length,
              )
            : DATA_TABLE_COPY.page(
                table.getState().pagination.pageIndex + 1,
                pages,
              )}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {DATA_TABLE_COPY.previous}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {DATA_TABLE_COPY.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

export {
  DataTable,
  DataTableColumnHeader,
  type ColumnDef,
  type DataTableProps,
};
