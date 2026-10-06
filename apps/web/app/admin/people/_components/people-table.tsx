"use client";

/**
 * People's table (people.md): a filter, the people with a role select each,
 * and a confirmation that names the consequence before any change. The
 * server action decides; this leaf only asks, shows the answer and moves on.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import type { AppRole } from "@pem/db/rls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pem/ui/alert-dialog";
import { Button } from "@pem/ui/button";
import { Input } from "@pem/ui/input";
import { Label } from "@pem/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pem/ui/select";
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

import {
  filterPeople,
  matchAnnouncement,
  PEOPLE_PAGE_SIZE,
  PEOPLE_ROLES,
  PEOPLE_WORDS,
  roleChangeConfirmation,
  roleSelectLabel,
  type PeopleView,
  type PersonRow,
} from "../../../../lib/sandbox/people";
import { SANDBOX_TIME_ZONE } from "../../../../lib/sandbox/time";
import { changeRole } from "../actions";

const W = PEOPLE_WORDS;
const ROLE_ITEMS = PEOPLE_ROLES.map((value) => ({
  value,
  label: W.roles[value],
}));
const FILTER_ID = "people-filter";

/** This page's toasts: one manager, handed to its Toaster. */
const toasts = createToastManager();

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: SANDBOX_TIME_ZONE,
});
const formatDate = (iso: string | null) =>
  iso ? DATE.format(new Date(iso)) : W.missing;

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

type Pending = { row: PersonRow; to: AppRole };

export function PeopleTable({ view }: { view: PeopleView }) {
  return (
    <Toaster toastManager={toasts}>
      <PeopleBody view={view} />
    </Toaster>
  );
}

function PeopleBody({ view }: { view: PeopleView }) {
  const router = useRouter();
  const online = useOnline();
  const offline = view.offline || !online;
  const [query, setQuery] = useState(view.query);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [isChanging, startChange] = useTransition();
  const triggers = useRef(new Map<string, HTMLButtonElement | null>());
  // One ref callback per row, kept across renders: a new one each render
  // makes Base UI's merged ref update its store on every commit, in a loop.
  const triggerRefs = useRef(
    new Map<string, (el: HTMLButtonElement | null) => void>(),
  );
  const triggerRef = (id: string) => {
    let ref = triggerRefs.current.get(id);
    if (!ref) {
      ref = (el) => {
        triggers.current.set(id, el);
      };
      triggerRefs.current.set(id, ref);
    }
    return ref;
  };
  const returnTo = useRef<HTMLElement | null>(null);

  // `people-change-error` opens with the failed-change toast, once. A child's
  // effect runs before the Toaster's own, so the add waits a tick.
  const shownFailure = useRef(false);
  useEffect(() => {
    if (!view.changeFailed || shownFailure.current) return;
    const timer = setTimeout(() => {
      shownFailure.current = true;
      toasts.add({ type: "error", title: W.changeFailed, timeout: 0 });
    }, 0);
    return () => clearTimeout(timer);
  }, [view.changeFailed]);

  const rows = useMemo(
    () => filterPeople(view.rows ?? [], query),
    [view.rows, query],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PEOPLE_PAGE_SIZE));
  const shown = rows.slice(
    page * PEOPLE_PAGE_SIZE,
    (page + 1) * PEOPLE_PAGE_SIZE,
  );

  if (view.loading) return <PeopleSkeleton />;
  if (view.error || !view.rows)
    return <p className="text-muted-foreground">{W.error}</p>;

  const onlyYou = view.rows.length <= 1;

  function confirm() {
    if (!pending) return;
    const { row, to } = pending;
    const form = new FormData();
    form.set("userId", row.id);
    form.set("role", to);
    startChange(async () => {
      const result = await changeRole(null, form);
      setPending(null);
      if (result.outcome === "changed") {
        toasts.add({ type: "success", title: result.message });
        if (result.self && result.role !== "admin")
          router.push("/admin/experiments");
        else router.refresh();
        return;
      }
      toasts.add({
        type: "error",
        title:
          result.outcome === "last-admin" ? result.message : W.changeFailed,
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {offline ? <p role="status">{W.offline}</p> : null}
      {onlyYou ? <p className="text-muted-foreground">{W.empty}</p> : null}
      {onlyYou ? null : (
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor={FILTER_ID}>{W.filterLabel}</Label>
          <Input
            id={FILTER_ID}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {query.trim() ? matchAnnouncement(rows.length) : ""}
      </p>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{W.filterEmpty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableCaption className="sr-only">{W.caption}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{W.columns.email}</TableHead>
                <TableHead>{W.columns.role}</TableHead>
                <TableHead className="text-right">
                  {W.columns.signedUp}
                </TableHead>
                <TableHead className="text-right">
                  {W.columns.lastSignIn}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((row) => {
                const reasonId = `people-reason-${row.id}`;
                const value =
                  pending?.row.id === row.id ? pending.to : row.role;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.email}
                      {row.isYou ? (
                        <span className="text-muted-foreground"> {W.you}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Select
                          items={ROLE_ITEMS}
                          value={value}
                          disabled={offline || row.locked || isChanging}
                          onValueChange={(to) => {
                            if (!to || to === row.role) return;
                            returnTo.current =
                              triggers.current.get(row.id) ?? null;
                            setPending({ row, to: to as AppRole });
                          }}
                        >
                          <SelectTrigger
                            ref={triggerRef(row.id)}
                            size="sm"
                            className="w-36"
                            aria-label={roleSelectLabel(row.email)}
                            aria-describedby={row.locked ? reasonId : undefined}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_ITEMS.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.locked ? (
                          <p
                            id={reasonId}
                            className="max-w-xs text-sm text-muted-foreground"
                          >
                            {W.lastAdmin}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDate(row.signedUp)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDate(row.lastSignIn)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {pages > 1 ? (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
      <RoleChangeDialog
        pending={pending}
        busy={isChanging}
        returnTo={returnTo}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </div>
  );
}

function RoleChangeDialog({
  pending,
  busy,
  returnTo,
  onCancel,
  onConfirm,
}: {
  pending: Pending | null;
  busy: boolean;
  returnTo: React.RefObject<HTMLElement | null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const words = pending
    ? roleChangeConfirmation(
        pending.row.email,
        pending.row.role,
        pending.to,
        pending.row.isYou,
      )
    : null;
  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <AlertDialogContent finalFocus={returnTo}>
        <AlertDialogHeader>
          <AlertDialogTitle>{words?.action}</AlertDialogTitle>
          <AlertDialogDescription>{words?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{W.cancel}</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={onConfirm}>
            {words?.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function PeopleSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="animate-none h-9 w-full max-w-sm" />
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-6">
            <Skeleton className="animate-none h-4 flex-1" />
            <Skeleton className="animate-none h-8 w-36" />
            <Skeleton className="animate-none h-4 w-24" />
            <Skeleton className="animate-none h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
