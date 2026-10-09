import type { DiffRow } from "../_lib/diff";

/**
 * P-1: one row per whole clause (P-4). A fixed glyph slot keeps the text
 * column aligned. Removed is `del`, added is `ins`, each with a hidden label,
 * so the change reads without the glyph or the colour.
 */
export function Diff({
  rows,
  label,
}: {
  rows: readonly DiffRow[];
  label?: string;
}) {
  return (
    <ul aria-label={label} className="grid gap-1 text-sm">
      {rows.map((row, i) => (
        <li
          key={`${i}-${row.kind}`}
          data-kind={row.kind}
          className={
            row.kind === "added"
              ? "flex items-start gap-2 rounded-sm bg-muted px-2 py-1"
              : "flex items-start gap-2 px-2 py-1"
          }
        >
          <span
            aria-hidden="true"
            className={
              row.kind === "added"
                ? "w-4 shrink-0 text-center font-mono font-semibold"
                : "w-4 shrink-0 text-center font-mono text-muted-foreground"
            }
          >
            {row.kind === "removed" ? "−" : row.kind === "added" ? "+" : ""}
          </span>
          {row.kind === "removed" ? (
            <del className="text-muted-foreground line-through">
              <span className="sr-only">Removed: </span>
              {row.text}
            </del>
          ) : row.kind === "added" ? (
            <ins className="no-underline">
              <span className="sr-only">Added: </span>
              {row.text}
            </ins>
          ) : (
            <span>{row.text}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
