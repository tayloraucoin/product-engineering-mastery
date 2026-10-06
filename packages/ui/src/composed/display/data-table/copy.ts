/** The data table's strings. */
export const DATA_TABLE_COPY = {
  noResults: "No rows match the filter.",
  noData: "Nothing here yet.",
  previous: "Previous",
  next: "Next",
  filterLabel: (column: string) => `Filter by ${column}`,
  selected: (count: number, total: number) =>
    `${count} of ${total} row(s) selected.`,
  page: (page: number, pages: number) => `Page ${page} of ${pages}`,
  sortBy: (column: string) => `Sort by ${column}`,
  selectAll: "Select all rows on this page",
  selectRow: (name: string) => `Select ${name}`,
  rowFallback: (index: number) => `row ${index}`,
} as const;
