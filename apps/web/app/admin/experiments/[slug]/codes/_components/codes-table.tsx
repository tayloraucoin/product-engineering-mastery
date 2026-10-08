"use client";

/**
 * The Access codes tab (access-codes.md): "Make a code", the codes with what
 * each one's reviewers typed, and a row menu to replace or revoke. The
 * server actions decide; this leaf asks, shows the answer once, and moves on.
 *
 * A made or replaced code is held in `shown` only, and dropped on Done or
 * Escape before the page refreshes from the list, which never holds one.
 * A `?state=` fixture never reaches an action: its dialogs answer locally.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { EllipsisIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@pem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pem/ui/dropdown-menu";
import { Skeleton } from "@pem/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pem/ui/table";
import { createToastManager, Toaster } from "@pem/ui/toast";

import type { CodeActionResult } from "../../../../../../lib/sandbox/admin-codes";
import {
  CODES_WORDS,
  FIXTURE_CODE,
  rowMenuLabel,
  type CodeRowView,
  type CodesView,
} from "../../../../../../lib/sandbox/admin-codes-view";
import { EMAILS_USED_WORDS } from "../../../../../../lib/sandbox/emails-used";
import { SANDBOX_TIME_ZONE } from "../../../../../../lib/sandbox/time";
import { makeCode, replaceCode, revokeCode } from "../actions";
import {
  CodeDialog,
  RevokeCodeDialog,
  type CodeRequest,
  type ShownCode,
} from "./code-dialogs";

const W = CODES_WORDS;
const CLOSED_REASON_ID = "codes-closed-reason";

/** This tab's toasts: one manager, handed to its Toaster. */
const toasts = createToastManager();

const WHEN = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SANDBOX_TIME_ZONE,
});

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** False while the browser says it is offline; true on the server. */
function useOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

export function CodesTable({ view }: { view: CodesView }) {
  return (
    <Toaster toastManager={toasts}>
      <CodesBody view={view} />
    </Toaster>
  );
}

function CodesBody({ view }: { view: CodesView }) {
  const router = useRouter();
  const online = useOnline();
  const offline = view.offline || !online;
  const fixture = view.fixture;
  const [request, setRequest] = useState<CodeRequest | null>(
    fixture?.makeError ? { kind: "make" } : null,
  );
  const [revoking, setRevoking] = useState<CodeRowView | null>(null);
  const [shown, setShown] = useState<ShownCode | null>(
    fixture?.shownOnce ?? null,
  );
  const makeButton = useRef<HTMLButtonElement>(null);
  const menuTriggers = useRef(new Map<string, HTMLButtonElement | null>());
  // One ref callback per row, kept across renders (see people-table.tsx).
  const menuRefs = useRef(
    new Map<string, (el: HTMLButtonElement | null) => void>(),
  );
  const menuRef = (id: string) => {
    let ref = menuRefs.current.get(id);
    if (!ref) {
      ref = (el) => {
        menuTriggers.current.set(id, el);
      };
      menuRefs.current.set(id, ref);
    }
    return ref;
  };
  const returnTo = useRef<HTMLElement | null>(null);
  const pendingOpen = useRef<(() => void) | null>(null);
  useEffect(() => {
    returnTo.current = makeButton.current;
  }, []);

  // A fixture answers locally with the made-up code; nothing reaches a real code.
  const fixtureMade = (): CodeActionResult => ({
    outcome: "made",
    code: FIXTURE_CODE,
    link: fixture?.link ?? "",
  });
  const runMake = (form: FormData) =>
    fixture
      ? Promise.resolve(
          fixture.makeError
            ? ({ outcome: "failed", message: W.makeFailed } as const)
            : fixtureMade(),
        )
      : makeCode(view.slug, null, form);
  const runReplace = (form: FormData) =>
    fixture
      ? Promise.resolve(fixtureMade())
      : replaceCode(view.slug, null, form);
  const runRevoke = (form: FormData) =>
    fixture
      ? Promise.resolve({ outcome: "revoked" } as const)
      : revokeCode(view.slug, null, form);

  if (view.loading) return <CodesSkeleton />;
  if (view.error || !view.rows)
    return <p className="text-muted-foreground">{W.error}</p>;

  const rows = view.rows;
  const changesOff = offline;
  const makeOff = changesOff || view.closed;

  function openFrom(trigger: HTMLElement | null) {
    returnTo.current = trigger ?? makeButton.current;
  }

  /**
   * A row menu's choice opens its dialog only after the menu has closed and
   * given focus back to its trigger. Opened sooner, that focus return lands
   * inside the open dialog's life and a keyboard choice dismisses it.
   */
  function afterMenu(row: CodeRowView, open: () => void) {
    openFrom(menuTriggers.current.get(row.reviewerId) ?? null);
    pendingOpen.current = open;
  }
  function openAfterMenu() {
    const open = pendingOpen.current;
    pendingOpen.current = null;
    if (open) setTimeout(open, 0);
  }

  function showOnce(next: ShownCode) {
    setRequest(null);
    setShown(next);
  }

  /** Done or Escape: the code leaves the page, then the list is read again. */
  function done() {
    setShown(null);
    setRequest(null);
    if (!fixture) router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="sr-only">{W.heading}</h2>
      {offline ? <p role="status">{W.offline}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          ref={makeButton}
          disabled={makeOff}
          aria-describedby={view.closed ? CLOSED_REASON_ID : undefined}
          onClick={() => {
            openFrom(makeButton.current);
            setRequest({ kind: "make" });
          }}
        >
          {W.make}
        </Button>
        {view.closed ? (
          <p id={CLOSED_REASON_ID} className="text-sm text-muted-foreground">
            {W.closed}
          </p>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{W.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableCaption className="sr-only">{W.caption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{W.columns.label}</TableHead>
                {view.collaborate ? (
                  <TableHead>{W.columns.displayName}</TableHead>
                ) : null}
                <TableHead>{W.columns.emailsUsed}</TableHead>
                <TableHead className="text-right">
                  {W.columns.lastUsed}
                </TableHead>
                <TableHead>{W.columns.status}</TableHead>
                <TableHead>
                  <span className="sr-only">{W.columns.actions}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.reviewerId}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {view.collaborate ? (
                    <TableCell>{row.displayName ?? W.missing}</TableCell>
                  ) : null}
                  <TableCell>
                    <EmailsUsed row={row} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.emailsUsed === null
                      ? W.missing
                      : row.lastUsedAt
                        ? WHEN.format(new Date(row.lastUsedAt))
                        : W.notYet}
                  </TableCell>
                  <TableCell
                    className={row.revoked ? "text-muted-foreground" : ""}
                  >
                    {row.revoked ? W.revoked : W.live}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      onOpenChangeComplete={(open) => {
                        if (!open) openAfterMenu();
                      }}
                    >
                      <DropdownMenuTrigger
                        ref={menuRef(row.reviewerId)}
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={rowMenuLabel(row.label)}
                          />
                        }
                      >
                        <EllipsisIcon aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={makeOff}
                          onClick={() =>
                            afterMenu(row, () =>
                              setRequest({ kind: "replace", row }),
                            )
                          }
                        >
                          <span className="flex flex-col">
                            {W.replace}
                            {view.closed ? (
                              <span className="text-muted-foreground">
                                {W.closed}
                              </span>
                            ) : null}
                          </span>
                        </DropdownMenuItem>
                        {row.revoked ? null : (
                          <DropdownMenuItem
                            disabled={changesOff}
                            onClick={() =>
                              afterMenu(row, () => setRevoking(row))
                            }
                          >
                            {W.revoke}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <CodeDialog
        request={request}
        shown={shown}
        collaborate={view.collaborate}
        initialFailure={fixture?.makeError ?? false}
        initiallyCopied={fixture?.copied ?? false}
        returnTo={returnTo}
        onCancel={() => setRequest(null)}
        onShown={showOnce}
        onReplaceFailed={(message) => {
          setRequest(null);
          toasts.add({ type: "error", title: message });
        }}
        onDone={done}
        runMake={runMake}
        runReplace={runReplace}
      />
      <RevokeCodeDialog
        row={revoking}
        returnTo={returnTo}
        onClose={() => setRevoking(null)}
        onDone={(result) => {
          setRevoking(null);
          if (result.outcome === "revoked") {
            toasts.add({ type: "success", title: W.codeRevoked });
            if (!fixture) router.refresh();
          } else toasts.add({ type: "error", title: W.revokeFailed });
        }}
        run={runRevoke}
      />
    </div>
  );
}

function EmailsUsed({ row }: { row: CodeRowView }) {
  if (row.emailsUsed === null) return <>{W.missing}</>;
  if (row.emailsUsed.length === 0)
    return <span className="text-muted-foreground">{W.noEmails}</span>;
  const flags = row.flags;
  return (
    <div className="flex flex-col gap-1">
      <ul className="flex flex-col">
        {row.emailsUsed.map((email) => (
          <li key={email} className="break-all">
            {email}
          </li>
        ))}
      </ul>
      {flags?.several ? (
        <Flag>{EMAILS_USED_WORDS.several(row.emailsUsed.length)}</Flag>
      ) : null}
      {flags?.differsFromLabel ? (
        <Flag>{EMAILS_USED_WORDS.differsFromLabel}</Flag>
      ) : null}
    </div>
  );
}

function Flag({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium">
      <TriangleAlertIcon aria-hidden="true" className="size-4" />
      {children}
    </p>
  );
}

export function CodesSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="animate-none h-9 w-32" />
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-6">
            <Skeleton className="animate-none h-4 flex-1" />
            <Skeleton className="animate-none h-4 flex-1" />
            <Skeleton className="animate-none h-4 w-28" />
            <Skeleton className="animate-none h-4 w-14" />
            <Skeleton className="animate-none h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
