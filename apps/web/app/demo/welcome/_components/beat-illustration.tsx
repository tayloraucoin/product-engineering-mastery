import { Button } from "@pem/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pem/ui/empty";
import { Skeleton } from "@pem/ui/skeleton";

import type { BeatSlot } from "../_lib/beats";
import { Diff } from "../../_components/diff";
import { StatusBadge } from "../../_components/status-badge";
import { diffClauses } from "../../_lib/diff";
import {
  FIXTURE_BODIES,
  FIXTURE_INDEX,
  HALVORSEN_ID,
  KESTREL_ID,
  PELLOW_ID,
} from "../../_lib/fixtures";
import { formatUsd } from "../../_lib/format";

/** Beat 1's job: "shows what one record holds". Fixture rows, so the words match the table. */
const ROW_IDS = [HALVORSEN_ID, PELLOW_ID, KESTREL_ID];

function RowsPanel() {
  const rows = ROW_IDS.map((id) =>
    FIXTURE_INDEX.find((record) => record.id === id)!,
  );
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 rounded-lg border px-6 py-4 text-sm">
      {rows.map((row) => (
        <div
          key={row.id}
          className="col-span-3 grid grid-cols-subgrid items-center border-b py-2 last:border-b-0"
        >
          <span className="font-medium">{row.vendor}</span>
          <span className="justify-self-end">
            <StatusBadge status={row.status} />
          </span>
          <span className="text-right tabular-nums">
            {formatUsd(row.annualValueUsd)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Beat 2's job: "shows what compare marks". Halvorsen 4 against 3, the payment clause only. */
function DiffPanel() {
  const [v4, v3] = FIXTURE_BODIES[HALVORSEN_ID]!.versions;
  const rows = diffClauses(v3!.clauses, v4!.clauses).rows.filter((row) =>
    row.text.startsWith("Payment"),
  );
  return (
    <div className="flex flex-col gap-2 rounded-lg border px-6 py-4">
      <p className="text-sm text-muted-foreground">
        Halvorsen Freight, version 4 compared with version 3
      </p>
      <Diff rows={rows} />
    </div>
  );
}

/** Beat 3's job: "shows that delete asks first". The kit tint, never the live solid (D-DEMO-11). */
function DialogPanel() {
  return (
    <div className="mx-auto flex w-full max-w-(--container-xs) flex-col gap-4 rounded-xl border bg-background p-5 shadow-raised">
      <p className="text-base font-medium">Delete Halvorsen Freight?</p>
      <div className="flex flex-row-reverse justify-start gap-2">
        <Button variant="destructive" size="sm">
          Delete record
        </Button>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <Empty className="p-8">
      <EmptyHeader className="gap-1">
        <EmptyTitle className="text-sm font-medium">No records yet</EmptyTitle>
        <EmptyDescription>
          Your first record will be listed here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** Loading copies beat 1's panel at every width: the rows, invisible, under the skeleton. */
function SkeletonPanel() {
  return (
    <Skeleton className="animate-none rounded-lg">
      <div className="invisible">
        <RowsPanel />
      </div>
    </Skeleton>
  );
}

const PANELS: Record<BeatSlot, () => React.JSX.Element> = {
  rows: RowsPanel,
  diff: DiffPanel,
  dialog: DialogPanel,
  empty: EmptyPanel,
  skeleton: SkeletonPanel,
};

/** The illustration slot: hidden from assistive tech and inert, so nothing in it takes focus. */
export function BeatIllustration({ slot }: { slot: BeatSlot }) {
  const Panel = PANELS[slot];
  return (
    <div aria-hidden="true" inert data-slot="onboarding-illustration">
      <Panel />
    </div>
  );
}
