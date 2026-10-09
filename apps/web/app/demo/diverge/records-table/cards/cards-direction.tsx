"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@pem/ui/card";

import { DirectionFrame } from "../_shared/frame";
import { facts } from "../_shared/words";
import { StatusBadge } from "../../../_components/status-badge";
import { recordHref } from "../../../(shell)/records/_components/table/cells";

export function CardsDirection() {
  return (
    <DirectionFrame direction="cards">
      {(rows) => (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((record) => {
            const f = facts(record);
            return (
              <li key={record.id}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      <Link href={recordHref(record)} className="underline">
                        {record.vendor}
                      </Link>
                    </CardTitle>
                    <StatusBadge status={record.status} />
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground tabular-nums">
                    <span>{f.owner}</span>
                    <span>{f.value}</span>
                    <span>{f.renews}</span>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </DirectionFrame>
  );
}
