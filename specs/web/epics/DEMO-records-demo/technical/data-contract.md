---
epic: DEMO
status: draft
---

# DEMO — data contract and the URL

> Detail for D-DEMO-27 to 29 (`../technical.md`). Mason, 2026-10-08.

## Shapes (`app/demo/_lib/record.ts`)

```ts
type RecordId = `rec_${string}`; // rec_ plus 4 lowercase hex; stable in fixtures
type IsoDate = string; // "2026-11-02"; never a Date in state
type Status = "active" | "expiring" | "draft" | "terminated";
interface Owner {
  id: string;
  name: string;
} // fixed list, Ana Okafor and Tomas Reyes among them

interface RecordSummary {
  // the records index (D-DEMO-20): names a record before its body
  id: RecordId;
  vendor: string;
  ownerId: string;
  status: Status;
  annualValueUsd: number; // whole, >= 0
  renewsOn: IsoDate | null;
  endedOn: IsoDate | null; // endedOn only when terminated
  versionCount: number; // drives "all 4 versions" / "its only version"
  lastChange: { on: IsoDate; by: string | "you" };
}
interface Version {
  n: number;
  on: IsoDate;
  by: string;
  summary: string;
  clauses: string[];
}
interface RecordBody {
  id: RecordId;
  versions: Version[];
} // newest first; [] = no terms yet

interface DemoPrefs {
  v: 1;
  onboarded: boolean;
  compactRows: boolean;
  defaultSort: "vendor-asc" | "renews-asc" | "value-desc";
}
```

- **Fixtures** (`_lib/fixtures/`) hold 40 records, deep-frozen. Halvorsen Freight has the four versions and the words in `record-detail.md`. Greyfold Security is the bare `deleted` key's record. Halvorsen, Kestrel Cloud Hosting and Pellow Cleaning are the `partial` "Not loaded" rows. All of it is synthetic and in-register. The ids for these named records are exported constants, so tests and the harness never guess them.
- **Terms in the form:** one clause per line, saved as trimmed lines with empty lines dropped. Saving with changed clauses appends version `n + 1`; its summary is built from the diff. Unchanged clauses make no new version (the `saved` toast).
- **Clock:** `DEMO_TODAY = "2026-10-08"` in `clock.ts`. Every relative word ("3 days ago", "Just now", "soonest") is computed from it, so captures never drift and server and client agree.
- **Format** (`format.ts`) uses explicit locales. Money is `en-US` grouping plus " USD" ("52,000 USD"). Dates are `en-GB` `d MMM yyyy` ("5 Oct 2026"), formatted in UTC.

## Where state lives

| State                             | Lives in                                                                                                                                                                                                                                                              | Survives                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Records and bodies                | The reducer in `_lib/store.ts`, held by `_components/demo-store.tsx` (`useReducer`) in `app/demo/layout.tsx`. Actions are `create`, `update`, `delete` and `reset`. `lastEvent` is `saved` or `deleted` with the vendor and changed fields, or null                   | Client navigation inside `/demo`. A reload or leaving `/demo` resets it (D-DEMO-7) |
| Prefs                             | Cookie `pem_demo_prefs`: URL-encoded JSON `DemoPrefs`, `Path=/demo`, `SameSite=Lax`, a one-year `Max-Age`, written by the client. `prefs.ts` parses it tolerantly, so anything invalid reads as the defaults (`onboarded: false`, `compactRows: false`, `vendor-asc`) | Reloads. Reset demo data leaves it alone                                           |
| Theme                             | Kit `next-themes`. The shell toggle and the settings toggle-group read one `useTheme`                                                                                                                                                                                 | Reloads, on the device                                                             |
| Filters, sort, view, dialog, beat | The URL                                                                                                                                                                                                                                                               | Reloads, and links                                                                 |

Reads are synchronous and real mode has no artificial latency, so `loading` exists only as a key. Writes resolve on the next tick; the pending UI renders while they resolve. A double press is ignored by `aria-disabled` plus an in-flight guard. Real offline detection is out: `offline` is a key only.

## The URL

- **`?state=`**: `apps/web/lib/demo/states.ts` exports `DEMO_SURFACES`. Each entry has the surface id, its route pattern, a sample path for the harness (the Halvorsen id for detail, edit and delete) and its keys. The five universal keys appear only where the surface's States table has them (delete-dialog has no `empty` or `loading`). `readDemoState(raw, surface)` returns the key or null; a repeated or unknown key is null and the page renders real data. Each surface ticket registers its own keys, and the foundation ticket ships the registry with the universal keys only.
- **A forced key** sets the first render only. The next action runs for real and replaces the URL without `state` (for example `error` then Retry delete actually deletes, C-DEMO-delete-dialog-6). `saved` and `deleted` show the store's `lastEvent` when there is one. Otherwise they show the fixture's event: Halvorsen's value becomes 52,000 USD, or Greyfold Security is deleted.
- **`?dialog=delete`** on detail moves the `state` key to the dialog (`deleting`, `error`, `partial`, `offline`). Detail behind it renders populated, except `partial`, which also renders detail `partial` (D-DEMO-18). Opening the dialog pushes a history entry; closing it replaces.
- **Settings `?state=reset`** opens the reset confirm.
- **Not states:**
  - `?view=compare` is real UI; `?state=diff` renders the same view.
  - The table takes `?q=` (case-insensitive substring of vendor), `?status=<Status>`, `?owner=<ownerId>` and `?sort=<vendor|owner|status|value|renews>-<asc|desc>`. These are parsed in `records/_lib/query.ts`; an invalid value reads as absent, and an absent sort reads the prefs default.
  - Filters, sort, view and onboarding beats change with `router.replace`.
- **Server pages** read `searchParams`, resolve the key and the params, and pass them as props to the client views. A state needs no client effect to appear, so the first paint is the capture.
- **Unknown id:** detail and edit render the `not-found` state in the shell with a 200 status. Ids made in the session exist only in the client store, so the server cannot know them.
