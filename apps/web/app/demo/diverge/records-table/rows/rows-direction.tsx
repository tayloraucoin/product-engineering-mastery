"use client";

import Link from "next/link";

import { DirectionFrame } from "../_shared/frame";
import { facts } from "../_shared/words";
import { StatusBadge } from "../../../_components/status-badge";
import { recordHref } from "../../../(shell)/records/_components/table/cells";

export function RowsDirection() {
  return (
    <DirectionFrame direction="rows">
      {(rows) => (
        <ul className="border-t">
          {rows.map((record) => {
            const f = facts(record);
            return (
              <li key={record.id} className="border-b">
                <Link
                  href={recordHref(record)}
                  className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 hover:bg-hover md:flex-nowrap"
                >
                  <span className="min-w-0 flex-1 font-medium">
                    {record.vendor}
                  </span>
                  <StatusBadge status={record.status} />
                  <span className="w-full text-sm text-muted-foreground tabular-nums md:w-auto">
                    {f.owner} · {f.value} · {f.renews}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DirectionFrame>
  );
}
