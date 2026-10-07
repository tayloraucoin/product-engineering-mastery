"use client";

/**
 * The pins' state and wiring (pins.md, S17, D-LAB-12, D-LAB-13). One
 * provider per experiment page: it loads the reviewer's own pins after mount
 * (`exp-loading`), merges the browser's queue over them, resends the queue
 * on load, on reconnect and on Retry, and runs comment mode on the shown
 * design's root. The bar's slots and the pins layer read it.
 *
 * - The browser mints each pin's id and queues it before sending
 *   (lib/sandbox/client/queue.ts); closed or revoked holds the queue
 *   untouched for LAB-21.
 * - Comment mode swallows the design's own clicks and Enter or Space in the
 *   capture phase, on the design's root only, never the bar. Marked regions
 *   become named Tab stops while it is on, and are put back after.
 * - The team previews (`source.kind === "preview"`): pins come from a
 *   `?state=` fixture, stay in memory and are never sent. Team notes are
 *   LAB-14's.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createToastManager } from "@pem/ui/toast";

import {
  buildAnchor,
  keyboardPoint,
  pinOffset,
  REGION_ATTRIBUTE,
  REGION_NAME_ATTRIBUTE,
  type Anchor,
} from "../../../../../lib/sandbox/client/anchor";
import {
  commentModeStep,
  type CommentMode,
  type CommentModeEvent,
} from "../../../../../lib/sandbox/client/comment-mode";
import type { BarData } from "../../../../../lib/sandbox/client/experiment-view";
import {
  mergeLoaded,
  nextPinNumber,
  pinsBar,
  pinsOnDesign,
  PIN_WORDS as W,
  type Pin,
  type PinsFixture,
} from "../../../../../lib/sandbox/client/pins-view";
import { placeName } from "../../../../../lib/sandbox/client/place-name";
import {
  createPinSender,
  createQueueStore,
  queueKey,
  type PinKind,
  type PinSender,
  type QueueEntry,
  type QueueStore,
  type SendOutcome,
} from "../../../../../lib/sandbox/client/queue";
import { deleteComment, listMyComments, saveComment } from "../../actions";
import { PinsToaster } from "./pins-toaster";

export type PinsSource =
  | { kind: "reviewer"; reviewerId: string }
  /** The team: a `?state=` fixture's pins, or LAB-11's bar fixture, never sent. */
  | { kind: "preview"; fixture: PinsFixture | null; bar: BarData | null };

/** The composer's work: a new pin, or an edit of one. */
export type Draft = {
  kind: "new" | "edit";
  id: string;
  number: number;
  design: string;
  anchor: Anchor;
  pinKind: PinKind | null;
  body: string;
  saving: boolean;
  /** Focus goes back here when the composer closes with no pin to return to. */
  returnTo: HTMLElement | null;
};

type Held = "closed" | "revoked" | null;

type PinsContextValue = {
  bar: BarData;
  /** The viewer's pins per design, for the switch announcement; null until loaded. */
  counts: Readonly<Record<string, number>> | null;
  held: Held;
  mode: CommentMode;
  shown: string;
  /** The shown design's pins, each with its place on the page, or null when not found. */
  drawn: { pin: Pin; at: { left: number; top: number } | null }[];
  draft: Draft | null;
  draftAt: { left: number; top: number } | null;
  openPin: string | null;
  toggleMode(): void;
  retry(): void;
  setRoot(element: HTMLElement | null): void;
  setOpenPin(id: string | null): void;
  updateDraft(change: Partial<Pick<Draft, "pinKind" | "body">>): void;
  saveDraft(): void;
  /** The composer was dismissed: Escape, Cancel, or a press outside it. */
  dismissDraft(how: "escape" | "cancel" | "outside"): void;
  startEdit(pin: Pin): void;
  deletePin(pin: Pin): void;
  registerPin(id: string, element: HTMLButtonElement | null): void;
  announcement: string;
  regionRef: React.RefObject<HTMLDivElement | null>;
};

const PinsContext = createContext<PinsContextValue | null>(null);

export function usePins(): PinsContextValue {
  const value = useContext(PinsContext);
  if (!value) throw new Error("usePins needs a PinsProvider.");
  return value;
}

/** The controls a design already has: each is a Tab stop in comment mode. */
const CONTROLS =
  "a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex='-1'])";

function localStorageOrNull(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function entryOf(pin: Pin): QueueEntry {
  return {
    id: pin.id,
    number: pin.number,
    design: pin.design,
    kind: pin.kind,
    body: pin.body,
    anchor: pin.anchor,
    viewportW: pin.viewportW,
    viewportH: pin.viewportH,
    clientCreatedAt: pin.clientCreatedAt,
  };
}

function draftFromFixture(
  fixture: PinsFixture | null,
  design: string,
): Draft | null {
  if (!fixture?.draft) return null;
  return {
    kind: "new",
    id: "00000000-0000-4000-8000-000000000009",
    number: nextPinNumber(fixture.pins),
    design,
    anchor: fixture.draft.anchor,
    pinKind: fixture.draft.kind,
    body: fixture.draft.body,
    saving: fixture.draft.saving,
    returnTo: null,
  };
}

export function PinsProvider({
  slug,
  source,
  shown,
  barHeight,
  children,
}: {
  slug: string;
  source: PinsSource;
  shown: string;
  barHeight: number;
  children: ReactNode;
}) {
  const toasts = useMemo(() => createToastManager(), []);
  const preview = source.kind === "preview" ? source : null;
  const fixture = preview?.fixture ?? null;

  const [pins, setPins] = useState<Pin[]>(fixture?.pins ?? []);
  const [load, setLoad] = useState<"loading" | "ok" | "error">(
    preview ? "ok" : "loading",
  );
  const [held, setHeld] = useState<Held>(() => {
    const kind = preview?.bar?.status.kind;
    return kind === "closed" || kind === "revoked" ? kind : null;
  });
  const [online, setOnline] = useState(fixture ? fixture.online : true);
  const [saved, setSaved] = useState(fixture?.saved ?? false);
  const [mode, setMode] = useState<CommentMode>(fixture?.mode ?? "off");
  const [draft, setDraft] = useState<Draft | null>(() =>
    draftFromFixture(fixture, shown),
  );
  const [announcement, setAnnouncement] = useState("");
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [openPin, setOpenPin] = useState<string | null>(null);
  const [positions, setPositions] = useState<
    Map<string, { left: number; top: number } | null>
  >(new Map());
  const [reloads, setReloads] = useState(0);

  const sender = useRef<PinSender | null>(null);
  const queue = useRef<QueueStore | null>(null);
  const pinButtons = useRef(new Map<string, HTMLButtonElement>());
  const regionRef = useRef<HTMLDivElement | null>(null);
  const onlineRef = useRef(online);
  onlineRef.current = online;
  const pinsRef = useRef(pins);
  pinsRef.current = pins;

  const announce = useCallback((text: string | null) => {
    if (text) setAnnouncement(text);
  }, []);

  const step = useCallback(
    (event: CommentModeEvent) => {
      setMode((current) => {
        const next = commentModeStep(current, event);
        announce(next.announcement);
        return next.mode;
      });
    },
    [announce],
  );

  // After React's commit and the popover's own focus return: a task, not a
  // frame, so it also runs in a tab that draws no frames.
  const focusLater = useCallback((target: () => HTMLElement | null) => {
    setTimeout(() => target()?.focus(), 0);
  }, []);

  // The preview's sender keeps pins in memory and never sends. The
  // reviewer's is made after mount, where storage may be read.
  if (preview && !sender.current) {
    queue.current = createQueueStore(null, "preview");
    sender.current = createPinSender({
      queue: queue.current,
      online: () => onlineRef.current,
      save: async () => "ok",
      remove: async () => "ok",
    });
  }
  const reviewerId = source.kind === "reviewer" ? source.reviewerId : null;

  /** Marks each pin sent or unsent by whether the queue still holds it. */
  const syncFromQueue = useCallback(() => {
    const q = queue.current;
    if (!q) return;
    setPins((current) =>
      current.map((pin) => {
        const sync = q.get(pin.id) ? "unsent" : "sent";
        return pin.sync === sync ? pin : { ...pin, sync };
      }),
    );
  }, []);

  const noteHeld = useCallback(
    (outcome: SendOutcome | null) => {
      if (outcome === "closed" || outcome === "revoked") {
        setHeld(outcome);
        step({ type: "disable" });
        setDraft(null);
      }
    },
    [step],
  );

  const flush = useCallback(async () => {
    const s = sender.current;
    if (!s || s.held()) return;
    const { sent, last } = await s.flush();
    syncFromQueue();
    noteHeld(last);
    if (sent.length) {
      setSaved(true);
      announce(W.sent(sent.length));
    }
  }, [announce, noteHeld, syncFromQueue]);

  // A reviewer's load, after mount: their pins, the queue over them, then
  // the queue resent. Storage is read here, never during render.
  useEffect(() => {
    if (!reviewerId) return;
    let live = true;
    if (!sender.current) {
      const q = createQueueStore(
        localStorageOrNull(),
        queueKey(slug, reviewerId),
      );
      queue.current = q;
      sender.current = createPinSender({
        queue: q,
        online: () => navigator.onLine,
        save: (entry) => saveComment(slug, entry).then((r) => r.kind),
        remove: (id) => deleteComment(slug, { id }).then((r) => r.kind),
      });
    }
    setOnline(navigator.onLine);
    setLoad("loading");
    void (async () => {
      const result = await listMyComments(slug).catch(
        () => ({ kind: "failed" }) as const,
      );
      if (!live) return;
      const queued = queue.current!.all();
      if (result.kind === "ok") {
        setPins(mergeLoaded(result.comments, queued));
        setLoad("ok");
        await flush();
      } else {
        setPins(mergeLoaded([], queued));
        if (result.kind === "closed" || result.kind === "revoked") {
          setLoad("ok");
          noteHeld(result.kind);
        } else setLoad("error");
      }
    })();
    return () => {
      live = false;
    };
    // `reloads` is Retry after a failed load.
  }, [slug, reviewerId, reloads, flush, noteHeld]);

  // Offline and back: new pins wait; reconnecting resends the queue.
  useEffect(() => {
    if (!reviewerId) return;
    const goOnline = () => {
      setOnline(true);
      void flush();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [reviewerId, flush]);

  // A fixture's toast opens once, after the Toaster has subscribed.
  const fixtureToast = useRef(false);
  useEffect(() => {
    if (fixture?.toast !== "kept" || fixtureToast.current) return;
    const timer = setTimeout(() => {
      fixtureToast.current = true;
      toasts.add({ title: W.keptToast, timeout: 0 });
    }, 0);
    return () => clearTimeout(timer);
  }, [fixture, toasts]);

  const retry = useCallback(() => {
    if (load === "error") setReloads((n) => n + 1);
    else void flush();
  }, [load, flush]);

  /** What a send came to, for a new pin, an edit, or an Undo. */
  const settle = useCallback(
    (entry: QueueEntry, outcome: SendOutcome) => {
      syncFromQueue();
      noteHeld(outcome);
      if (outcome === "ok") {
        setSaved(true);
        announce(W.saved(entry.number));
      } else if (outcome === "offline") {
        announce(W.keptOffline(entry.number));
      } else if (
        outcome !== "closed" &&
        outcome !== "revoked" &&
        outcome !== "held"
      ) {
        announce(W.keptError(entry.number));
        toasts.add({ title: W.keptToast, timeout: 8000 });
      }
    },
    [announce, noteHeld, syncFromQueue, toasts],
  );

  const send = useCallback(
    async (entry: QueueEntry) => {
      const s = sender.current;
      if (!s) return "held" as const;
      const outcome = await s.save(entry);
      settle(entry, outcome);
      return outcome;
    },
    [settle],
  );

  const saveDraft = useCallback(() => {
    const d = draft;
    if (!d || d.saving) return;
    const body = d.body;
    if (!body.trim() || body.length > 2000) return;
    const before = pinsRef.current.find((p) => p.id === d.id);
    const entry: QueueEntry = before
      ? { ...entryOf(before), kind: d.pinKind, body }
      : {
          id: d.id,
          number: d.number,
          design: d.design,
          kind: d.pinKind,
          body,
          anchor: d.anchor,
          viewportW: Math.max(1, Math.round(window.innerWidth)),
          viewportH: Math.max(1, Math.round(window.innerHeight)),
          clientCreatedAt: new Date().toISOString(),
        };
    setDraft({ ...d, saving: true });
    setPins((current): Pin[] =>
      before
        ? current.map((p) =>
            p.id === d.id
              ? { ...p, kind: entry.kind, body, sync: "sending" as const }
              : p,
          )
        : [...current, { ...entry, sync: "sending" as const }].sort(
            (a, b) => a.number - b.number,
          ),
    );
    void send(entry).then(() => {
      setDraft(null);
      if (d.kind === "new") step({ type: "saved" });
      focusLater(() => pinButtons.current.get(d.id) ?? d.returnTo);
    });
  }, [draft, send, step, focusLater]);

  const dismissDraft = useCallback(
    (how: "escape" | "cancel" | "outside") => {
      const d = draft;
      if (!d || d.saving) return;
      setDraft(null);
      if (d.kind === "new")
        step({ type: how === "escape" ? "escape" : "cancel" });
      const original = pinsRef.current.find((p) => p.id === d.id);
      const typed = original ? d.body !== original.body : d.body.trim() !== "";
      if (how !== "cancel" && typed) {
        const toastId = toasts.add({
          title: W.discarded,
          timeout: 8000,
          actionProps: {
            children: W.undo,
            onClick: () => {
              toasts.close(toastId);
              setDraft({ ...d, saving: false });
              if (d.kind === "new") setMode("composing");
            },
          },
        });
      }
      focusLater(() => pinButtons.current.get(d.id) ?? d.returnTo);
    },
    [draft, step, toasts, focusLater],
  );

  const startEdit = useCallback(
    (pin: Pin) => {
      if (held) return;
      setOpenPin(null);
      setDraft({
        kind: "edit",
        id: pin.id,
        number: pin.number,
        design: pin.design,
        anchor: pin.anchor,
        pinKind: pin.kind,
        body: pin.body,
        saving: false,
        returnTo: pinButtons.current.get(pin.id) ?? null,
      });
    },
    [held],
  );

  const deletePin = useCallback(
    (pin: Pin) => {
      const s = sender.current;
      if (held || !s) return;
      setOpenPin(null);
      const queued = queue.current?.get(pin.id);
      setPins((current) => current.filter((p) => p.id !== pin.id));
      const restore = () =>
        setPins((current) =>
          current.some((p) => p.id === pin.id)
            ? current
            : [...current, pin].sort((a, b) => a.number - b.number),
        );
      const toastId = toasts.add({
        title: W.deleted(pin.number),
        timeout: 8000,
        actionProps: {
          children: W.undo,
          onClick: () => {
            toasts.close(toastId);
            restore();
            void send(entryOf(pin));
          },
        },
      });
      focusLater(() => regionRef.current);
      void s.remove(pin.id).then((outcome) => {
        noteHeld(outcome);
        if (outcome === "ok" || outcome === "held") return;
        // Not deleted: the pin comes back in place, queued again if it was.
        toasts.close(toastId);
        if (queued) queue.current?.put(queued);
        restore();
        syncFromQueue();
        toasts.add({ title: W.notDeleted(pin.number), timeout: 8000 });
      });
    },
    [held, toasts, send, noteHeld, syncFromQueue, focusLater],
  );

  const toggleMode = useCallback(() => {
    if (held) return;
    if (draft?.kind === "new" && !draft.saving) setDraft(null);
    step({ type: "toggle" });
  }, [held, draft, step]);

  // Comment mode on the shown design's root: Tab stops, the crosshair, and
  // the design's own clicks and keys swallowed in the capture phase.
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const pinsForNumber = useRef(pins);
  pinsForNumber.current = pins;
  useEffect(() => {
    if (!root || mode === "off") return;
    root.setAttribute("data-commenting", "");

    const kept: { element: Element; attrs: Record<string, string | null> }[] =
      [];
    for (const region of Array.from(
      root.querySelectorAll(`[${REGION_ATTRIBUTE}]`),
    )) {
      const names = ["tabindex", "role", "aria-label", "aria-labelledby"];
      kept.push({
        element: region,
        attrs: Object.fromEntries(
          names.map((n) => [n, region.getAttribute(n)]),
        ),
      });
      const name =
        region.getAttribute(REGION_NAME_ATTRIBUTE) ??
        region.getAttribute(REGION_ATTRIBUTE)!;
      region.setAttribute("tabindex", "0");
      region.setAttribute("role", "button");
      region.setAttribute("aria-label", W.regionStop(name));
      region.removeAttribute("aria-labelledby");
    }

    const place = (
      target: Element,
      point: { x: number; y: number },
      returnTo: HTMLElement | null,
    ) => {
      const anchor = buildAnchor(root, target, point, placeName(root, target));
      if (!anchor) return;
      setDraft({
        kind: "new",
        id: crypto.randomUUID(),
        number: nextPinNumber(pinsForNumber.current),
        design: shown,
        anchor,
        pinKind: null,
        body: "",
        saving: false,
        returnTo,
      });
      step({ type: "place" });
    };

    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (modeRef.current !== "on") return;
      if (event.target instanceof Element)
        place(event.target, { x: event.clientX, y: event.clientY }, null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const isRegion = target.hasAttribute(REGION_ATTRIBUTE);
      if (!isRegion && !target.matches(CONTROLS)) return;
      event.preventDefault();
      event.stopPropagation();
      if (modeRef.current !== "on") return;
      place(
        target,
        keyboardPoint(target, isRegion ? "region" : "control"),
        target,
      );
    };
    let hovered: Element | null = null;
    const onPointerOver = (event: PointerEvent) => {
      hovered?.removeAttribute("data-pin-hover");
      hovered =
        event.target instanceof Element && event.target !== root
          ? event.target
          : null;
      hovered?.setAttribute("data-pin-hover", "");
    };
    const onPointerLeave = () => {
      hovered?.removeAttribute("data-pin-hover");
      hovered = null;
    };
    const onSubmit = (event: Event) => event.preventDefault();

    root.addEventListener("click", onClick, true);
    root.addEventListener("auxclick", onClick, true);
    root.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("submit", onSubmit, true);
    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerleave", onPointerLeave);
    return () => {
      root.removeAttribute("data-commenting");
      onPointerLeave();
      for (const { element, attrs } of kept)
        for (const [name, value] of Object.entries(attrs))
          if (value === null) element.removeAttribute(name);
          else element.setAttribute(name, value);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("auxclick", onClick, true);
      root.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("submit", onSubmit, true);
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [root, mode, shown, step]);

  // Escape leaves comment mode (the composer handles its own Escape first).
  useEffect(() => {
    if (mode !== "on") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modeRef.current === "on")
        step({ type: "escape" });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode, step]);

  // Where each of the shown design's pins sits, in page coordinates. Re-laid
  // on resize, after each switch, and whenever the pins change.
  const shownPins = useMemo(() => pinsOnDesign(pins, shown), [pins, shown]);
  const relay = useCallback(() => {
    if (!root) return;
    const box = root.getBoundingClientRect();
    const origin = {
      left: box.left + window.scrollX,
      top: box.top + window.scrollY,
    };
    const next = new Map<string, { left: number; top: number } | null>();
    const at = (anchor: Anchor) => {
      const offset = pinOffset(root, anchor);
      return offset
        ? { left: origin.left + offset.left, top: origin.top + offset.top }
        : null;
    };
    for (const pin of shownPins) next.set(pin.id, at(pin.anchor));
    if (draft) next.set(`draft:${draft.id}`, at(draft.anchor));
    setPositions(next);
  }, [root, shownPins, draft]);

  useLayoutEffect(() => relay(), [relay]);
  useEffect(() => {
    if (!root) return;
    const observer = new ResizeObserver(() => relay());
    observer.observe(root);
    window.addEventListener("resize", relay);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", relay);
    };
  }, [root, relay]);

  const bar = useMemo<BarData>(
    () => preview?.bar ?? pinsBar({ pins, load, held, online, saved }),
    [preview, pins, load, held, online, saved],
  );

  const counts = useMemo(() => {
    if (load !== "ok" || preview?.bar) return null;
    const byDesign: Record<string, number> = {};
    for (const pin of pins)
      byDesign[pin.design] = (byDesign[pin.design] ?? 0) + 1;
    return byDesign;
  }, [pins, load, preview]);

  const value = useMemo<PinsContextValue>(
    () => ({
      bar,
      counts,
      held,
      mode,
      shown,
      drawn: shownPins
        .filter((pin) => !(draft?.kind === "edit" && draft.id === pin.id))
        .map((pin) => ({ pin, at: positions.get(pin.id) ?? null })),
      draft: draft && draft.design === shown ? draft : null,
      draftAt: draft ? (positions.get(`draft:${draft.id}`) ?? null) : null,
      openPin,
      toggleMode,
      retry,
      setRoot,
      setOpenPin,
      updateDraft: (change) =>
        setDraft((current) => (current ? { ...current, ...change } : current)),
      saveDraft,
      dismissDraft,
      startEdit,
      deletePin,
      registerPin: (id, element) => {
        if (element) pinButtons.current.set(id, element);
        else pinButtons.current.delete(id);
      },
      announcement,
      regionRef,
    }),
    [
      bar,
      counts,
      held,
      mode,
      shown,
      shownPins,
      positions,
      draft,
      openPin,
      toggleMode,
      retry,
      saveDraft,
      dismissDraft,
      startEdit,
      deletePin,
      announcement,
    ],
  );

  return (
    <PinsContext.Provider value={value}>
      <PinsToaster toastManager={toasts} barHeight={barHeight}>
        {children}
      </PinsToaster>
    </PinsContext.Provider>
  );
}
