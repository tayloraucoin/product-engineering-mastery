"use client";

import type { RefObject } from "react";
import { Search } from "lucide-react";

import { Input } from "@pem/ui/input";
import { NativeSelect, NativeSelectOption } from "@pem/ui/native-select";
import { Skeleton } from "@pem/ui/skeleton";

import {
  serializeSort,
  SORT_OPTIONS,
  STATUS_LABELS,
  type RecordsSort,
} from "../../_lib/query";
import { OWNERS } from "../../../../_lib/fixtures";
import { STATUSES, type Status } from "../../../../_lib/record";

export interface ToolbarProps {
  /** The search box's text; it may run ahead of the URL while typing. */
  draft: string;
  status: Status | null;
  owner: string | null;
  sort: RecordsSort;
  /** "40 records", or null while loading. */
  countWords: string | null;
  disabled?: boolean;
  searchRef?: RefObject<HTMLInputElement | null>;
  onSearch: (q: string) => void;
  onStatus: (status: Status | null) => void;
  onOwner: (owner: string | null) => void;
  onSort: (value: string) => void;
}

/**
 * 1440: search, status, owner, then the count right-aligned on one row.
 * 390: search full width, the selects 50/50, then the count and Sort.
 */
export function RecordsToolbar({
  draft,
  status,
  owner,
  sort,
  countWords,
  disabled = false,
  searchRef,
  onSearch,
  onStatus,
  onOwner,
  onSort,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
      <div className="relative w-full md:w-70">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={searchRef}
          type="search"
          aria-label="Filter by vendor"
          placeholder="Filter by vendor"
          value={draft}
          disabled={disabled}
          onChange={(event) => onSearch(event.target.value)}
          className="pl-8"
        />
      </div>
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
        <NativeSelect
          aria-label="Status"
          value={status ?? ""}
          disabled={disabled}
          onChange={(event) =>
            onStatus((event.target.value || null) as Status | null)
          }
          className="w-full md:w-37"
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          {STATUSES.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {STATUS_LABELS[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Owner"
          value={owner ?? ""}
          disabled={disabled}
          onChange={(event) => onOwner(event.target.value || null)}
          className="w-full md:w-37"
        >
          <NativeSelectOption value="">All owners</NativeSelectOption>
          {OWNERS.map(({ id, name }) => (
            <NativeSelectOption key={id} value={id}>
              {name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex w-full items-center justify-between gap-3 pt-1 md:ml-auto md:w-auto md:pt-0">
        <div
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
          data-testid="records-count"
        >
          {countWords ?? (
            <Skeleton className="h-3 w-18 animate-none rounded-full" />
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
          Sort
          <NativeSelect
            size="sm"
            value={serializeSort(sort)}
            disabled={disabled}
            onChange={(event) => onSort(event.target.value)}
            className="text-foreground"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      </div>
    </div>
  );
}
