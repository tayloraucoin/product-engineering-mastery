"use client";

import Link from "next/link";

import { DirectionFrame } from "../_shared/frame";
import { facts } from "../_shared/words";
import { STATUS_LABELS, StatusBadge } from "../../../_components/status-badge";
import { STATUSES } from "../../../_lib/record";
import { recordHref } from "../../../(shell)/records/_components/table/cells";

export function GroupedDirection() {
  return (
    <DirectionFrame direction="grouped">
      {(rows) => (
        <div className="flex flex-col gap-8">
          {STATUSES.map((status) => {
            const group = rows.filter((r) => r.status === status);
            if (group.length === 0) return null;
            return (
              <section key={status} aria-labelledby={`group-${status}`}>
                <h2
                  id={`group-${status}`}
                  className="flex items-center gap-2 pb-2 text-sm font-semibold"
                >
                  {STATUS_LABELS[status]}
                  <span className="font-normal text-muted-foreground">
                    {group.length}
                  </span>
                </h2>
                <ul className="border-t">
                  {group.map((record) => {
                    const f = facts(record);
                    return (
                      <li key={record.id} className="border-b">
                        <Link
                          href={recordHref(record)}
                          className="flex flex-col gap-1 py-3 hover:bg-hover md:flex-row md:items-center md:gap-6"
                        >
                          <span className="flex-1 font-medium">
                            {record.vendor}
                          </span>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {f.owner} · {f.value} · {f.renews}
                          </span>
                          <StatusBadge status={record.status} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </DirectionFrame>
  );
}
