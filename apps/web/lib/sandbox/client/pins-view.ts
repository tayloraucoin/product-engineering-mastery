/**
 * The pins' words, names, drawing rules and `?state=` fixtures (pins.md),
 * pure and client-safe: no @pem/db, next/headers or env.ts, so the layer
 * imports it and `node --test` runs it.
 */

import type { Anchor } from "./anchor.ts";
import type { BarData, SaveStatus } from "./experiment-view.ts";
import type { PinKind, QueueEntry } from "./queue.ts";

export const COMMENT_BODY_MAX = 2000;
/** The counter shows from here (pins.md, Composer). */
export const COMMENT_COUNTER_FROM = 1800;

const count = new Intl.NumberFormat("en-GB");

/** pins.md's Words, verbatim; the few it lacks are marked. */
export const PIN_WORDS = {
  region: "Your comments on this design",
  regionStop: (name: string) => `Comment on: ${name}`,
  on: (place: string) => `On: ${place}`,
  // [ASSUMPTION] the type group's name; the Words give the labels only.
  typeGroup: "Type",
  kinds: {
    problem: "Problem",
    question: "Question",
    suggestion: "Suggestion",
    keep: "Keep this",
  } satisfies Record<PinKind, string>,
  bodyLabel: "Your comment",
  bodyHint: "Say what's wrong or what works here.",
  counter: (length: number) =>
    `${count.format(length)} of ${count.format(COMMENT_BODY_MAX)} characters`,
  save: "Save comment",
  saving: "Saving",
  cancel: "Cancel",
  edit: "Edit",
  delete: "Delete",
  undo: "Undo",
  discarded: "Comment discarded.",
  deleted: (n: number) => `Comment ${n} deleted.`,
  // [ASSUMPTION] contract Gotchas: copy pins.md lacks, for assay to check.
  notDeleted: (n: number) => `Comment ${n} wasn't deleted. Try again.`,
  keptToast: "Saved in this browser only. It will send when it can.",
  modeOn:
    "Comment mode on. Choose any part of the page, or press Escape to stop.",
  modeOff: "Comment mode off.",
  saved: (n: number) => `Comment ${n} saved.`,
  keptOffline: (n: number) =>
    `Comment ${n} kept in this browser; it will send when you're back online.`,
  keptError: (n: number) =>
    `Comment ${n} kept in this browser; it will send when it can.`,
  sent: (n: number) => `${n} ${n === 1 ? "comment" : "comments"} sent.`,
  closedReason: "This review has closed, so comments can't be changed.",
  revokedReason: "This page can't save comments any more.",
  notFound: "Not found on the page; the design may have changed since",
  notSent: "not sent",
} as const;

/** A pin as the page holds it: the record, and whether the server has it. */
export type Pin = QueueEntry & {
  sync: "sent" | "sending" | "unsent";
  /** The server's save time, once it has one. */
  createdAt?: string;
};

export function placeOf(anchor: Anchor): string {
  return anchor.place ?? "this part of the page";
}

/** "Comment 3, Problem, on Pricing table", plus ", not sent" when it applies. */
export function pinName(
  pin: Pick<Pin, "number" | "kind" | "anchor" | "sync">,
): string {
  const parts = [`Comment ${pin.number}`];
  if (pin.kind) parts.push(PIN_WORDS.kinds[pin.kind]);
  parts.push(`on ${placeOf(pin.anchor)}`);
  if (pin.sync !== "sent") parts.push(PIN_WORDS.notSent);
  return parts.join(", ");
}

/** "5 Oct, 14:32" in the reader's locale and zone. */
export function pinTime(iso: string, locale?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day}, ${time}`;
}

/** The next pin's number: one past the highest held, loaded or queued. */
export function nextPinNumber(pins: readonly { number: number }[]): number {
  return pins.reduce((max, pin) => Math.max(max, pin.number), 0) + 1;
}

/**
 * The page's pins after a load: the server's rows, each overridden by a
 * queued entry with its id (the newer, unsent text), plus queued pins the
 * server has not seen. In number order.
 */
export function mergeLoaded(
  server: readonly (QueueEntry & { createdAt?: string })[],
  queued: readonly QueueEntry[],
): Pin[] {
  const byId = new Map<string, Pin>();
  for (const row of server) byId.set(row.id, { ...row, sync: "sent" });
  for (const entry of queued)
    byId.set(entry.id, {
      ...entry,
      createdAt: byId.get(entry.id)?.createdAt,
      sync: "unsent",
    });
  return [...byId.values()].sort((a, b) => a.number - b.number);
}

/** Drawn on this design or not: pins on other designs are hidden but counted (D-LAB-13). */
export function pinsOnDesign<T extends { design: string }>(
  pins: readonly T[],
  design: string,
): T[] {
  return pins.filter((pin) => pin.design === design);
}

/** Why Edit, Delete and Retry are disabled, or null when they are not. */
export function heldReason(held: "closed" | "revoked" | null): string | null {
  return held === "closed"
    ? PIN_WORDS.closedReason
    : held === "revoked"
      ? PIN_WORDS.revokedReason
      : null;
}

/** What the bar shows for the pins: the count across designs and the save status. */
export function pinsBar(state: {
  pins: readonly Pin[];
  load: "loading" | "ok" | "error";
  held: "closed" | "revoked" | null;
  online: boolean;
  saved: boolean;
}): BarData {
  const status: SaveStatus = state.held
    ? { kind: state.held }
    : !state.online
      ? { kind: "offline" }
      : state.load === "error"
        ? { kind: "error" }
        : state.pins.some((p) => p.sync === "unsent")
          ? {
              kind: "partial",
              unsent: state.pins.filter((p) => p.sync === "unsent").length,
            }
          : state.saved
            ? { kind: "saved" }
            : { kind: "none" };
  return {
    commentCount: state.load === "ok" ? state.pins.length : null,
    status,
  };
}

/** pins.md's States, each reachable by `?state=` for the team only, on synthetic pins. */
export const PINS_STATE_KEYS = [
  "pins-empty",
  "comment-mode",
  "composing",
  "pins-loading",
  "pins-error",
  "pins-partial",
  "pins-offline",
  "pins-success",
  "too-long",
] as const;

export type PinsStateKey = (typeof PINS_STATE_KEYS)[number];

export function isPinsStateKey(value: unknown): value is PinsStateKey {
  return (PINS_STATE_KEYS as readonly unknown[]).includes(value);
}

/** One fixture: the pins, the mode, the composer, whether online, and the toast. */
export type PinsFixture = {
  pins: Pin[];
  mode: "off" | "on" | "composing";
  /** The composer's draft when composing. */
  draft: {
    anchor: Anchor;
    body: string;
    kind: PinKind | null;
    saving: boolean;
  } | null;
  online: boolean;
  saved: boolean;
  toast: "kept" | null;
  /** A pin whose popover opens on arrival, or null. */
  openPin: string | null;
};

const fixtureTime = "2026-10-05T13:32:00.000Z";

function fixturePin(
  number: number,
  design: string,
  marked: string,
  place: string,
  kind: PinKind | null,
  body: string,
  sync: Pin["sync"] = "sent",
  at: { x: number; y: number } = { x: 0.8, y: 0.3 },
): Pin {
  return {
    id: `00000000-0000-4000-8000-00000000000${number}`,
    number,
    design,
    kind,
    body,
    anchor: { marked, ...at, place },
    viewportW: 1440,
    viewportH: 900,
    clientCreatedAt: fixtureTime,
    createdAt: fixtureTime,
    sync,
  };
}

/** Synthetic pins on the demo's two designs: three on Circle, one on Square. */
function basePins(): Pin[] {
  return [
    fixturePin(
      1,
      "circle",
      "plans",
      "Plans",
      "problem",
      "I can't tell which plan includes review.",
      "sent",
      { x: 0.85, y: 0.15 },
    ),
    fixturePin(
      2,
      "circle",
      "compare",
      "Comparison table",
      "question",
      "Does Team include the audit log?",
      "sent",
      { x: 0.9, y: 0.4 },
    ),
    fixturePin(
      3,
      "square",
      "compare",
      "Comparison table",
      "suggestion",
      "Put the annual price first.",
    ),
    fixturePin(
      4,
      "circle",
      "faq",
      "Questions",
      "keep",
      "The refund answer is clear.",
      "sent",
      { x: 0.7, y: 0.2 },
    ),
  ];
}

const LONG_BODY =
  "The plan names say who each plan is for, but the prices sit two screens below them. "
    .repeat(26)
    .slice(0, 2140);

/**
 * LAB-11's closed and revoked keys, with pins on the page and comment 1's
 * popover open, so Edit and Delete are seen disabled with their reason (C9).
 */
export function heldPinsFixture(): PinsFixture {
  return {
    pins: basePins(),
    mode: "off",
    draft: null,
    online: true,
    saved: false,
    toast: null,
    openPin: basePins()[0]!.id,
  };
}

export function pinsFixture(key: PinsStateKey): PinsFixture {
  const base: PinsFixture = {
    pins: basePins(),
    mode: "off",
    draft: null,
    online: true,
    saved: false,
    toast: null,
    openPin: null,
  };
  const draft = (body: string, saving = false) => ({
    anchor: {
      marked: "intro",
      x: 0.6,
      y: 0.5,
      place: "Introduction",
    } as Anchor,
    body,
    // The loading key shows a chosen type, so its pressed state is seen.
    kind: saving ? ("problem" as const) : null,
    saving,
  });
  const withSync = (sync: Record<number, Pin["sync"]>) =>
    basePins().map((p) =>
      sync[p.number] ? { ...p, sync: sync[p.number]! } : p,
    );
  switch (key) {
    case "pins-empty":
      return { ...base, pins: [] };
    case "comment-mode":
      return { ...base, mode: "on" };
    case "composing":
      return { ...base, mode: "composing", draft: draft("") };
    case "pins-loading":
      return {
        ...base,
        mode: "composing",
        draft: draft("The first line says who it's for. Good.", true),
      };
    case "pins-error":
      return { ...base, pins: withSync({ 4: "unsent" }), toast: "kept" };
    case "pins-partial":
      return { ...base, pins: withSync({ 2: "unsent", 4: "unsent" }) };
    case "pins-offline":
      return {
        ...base,
        pins: withSync({ 4: "unsent" }),
        online: false,
        toast: "kept",
      };
    case "pins-success":
      return { ...base, saved: true };
    case "too-long":
      return { ...base, mode: "composing", draft: draft(LONG_BODY) };
  }
}
