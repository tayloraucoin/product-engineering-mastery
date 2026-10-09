import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@pem/ui/item";

import { formatDate } from "../../../../_lib/format";
import type { Version } from "../../../../_lib/record";

/** Every version, newest first (D-DEMO-19): one line from `md` up, two below. */
export function HistoryList({ versions }: { versions: readonly Version[] }) {
  return (
    <section aria-labelledby="history-heading" className="flex flex-col gap-3">
      <h2 id="history-heading" className="text-base font-semibold">
        History
      </h2>
      {versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No versions yet. The first save of terms creates version 1.
        </p>
      ) : (
        <ItemGroup>
          {versions.map((v) => (
            <Item
              key={v.n}
              size="sm"
              className="flex-col items-start gap-1 border-b rounded-none px-0 md:flex-row md:items-center md:gap-4"
            >
              <ItemTitle className="md:w-24">Version {v.n}</ItemTitle>
              <ItemContent>
                <ItemDescription>{v.summary}</ItemDescription>
              </ItemContent>
              <p className="text-sm text-muted-foreground md:ml-auto">
                {formatDate(v.on)}, {v.by}
              </p>
            </Item>
          ))}
        </ItemGroup>
      )}
    </section>
  );
}
