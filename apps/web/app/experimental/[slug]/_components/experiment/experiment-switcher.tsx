"use client";

/**
 * The experiment page's client leaf (R9, D-LAB-40). Every design arrives
 * rendered on the server; this mounts only the shown one, inside `main`, in
 * a root marked `data-sandbox-design`, so two designs' own ids never share a
 * document. A switch is a state change: no request before the new design
 * paints, the scroll kept and clamped to the new page, then one switch
 * logged fire-and-forget and the switch announced politely.
 *
 * The load is logged once from an effect after mount, guarded by a ref,
 * never in render: prefetch and Strict Mode would count it twice. Nothing
 * is logged for the team.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  type DesignOption,
  type PrimaryKind,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  clampScroll,
  planSwitch,
  type SwitchLog,
} from "../../../../../lib/sandbox/client/switcher";
import { recordView } from "../../actions";
import { PinsLayer } from "../pins/pins-layer";
import { PinsProvider, usePins, type PinsSource } from "../pins/pins-provider";
import {
  CommentsButton,
  CommentToggle,
  SaveStatusText,
  useStatusLine,
} from "./bar-slots";
import { ReviewBar } from "./review-bar";

export type ExperimentSwitcherProps = {
  slug: string;
  /** In switcher order, each with its server-rendered design. */
  designs: readonly (DesignOption & { element: ReactNode })[];
  initialShown: string;
  primary: PrimaryKind;
  /** Whether views are logged: a reviewer only (D-LAB-14). */
  counted: boolean;
  /** Whose pins: the reviewer's, or the team's preview of a fixture (LAB-12). */
  pins: PinsSource;
};

function sendLog(
  slug: string,
  log: SwitchLog | { kind: "load"; design: string },
) {
  // Fire-and-forget: a failed log never undoes a switch or breaks the page.
  void recordView(slug, log).catch(() => undefined);
}

export function ExperimentSwitcher(props: ExperimentSwitcherProps) {
  const [shown, setShown] = useState(props.initialShown);
  const [barHeight, setBarHeight] = useState(0);
  return (
    <PinsProvider
      slug={props.slug}
      source={props.pins}
      shown={shown}
      barHeight={barHeight}
    >
      <SwitcherBody
        {...props}
        shown={shown}
        setShown={setShown}
        barHeight={barHeight}
        setBarHeight={setBarHeight}
      />
    </PinsProvider>
  );
}

function SwitcherBody({
  slug,
  designs,
  initialShown,
  primary,
  counted,
  shown,
  setShown,
  barHeight,
  setBarHeight,
}: ExperimentSwitcherProps & {
  shown: string;
  setShown(design: string): void;
  barHeight: number;
  setBarHeight(height: number): void;
}) {
  const pins = usePins();
  const commentsOn = pins.counts;
  const statusLine = useStatusLine();
  const [announcement, setAnnouncement] = useState("");
  const loadLogged = useRef(false);
  const pendingScroll = useRef<number | null>(null);
  const pendingLog = useRef<SwitchLog | null>(null);

  useEffect(() => {
    if (!counted || loadLogged.current) return;
    loadLogged.current = true;
    sendLog(slug, { kind: "load", design: initialShown });
  }, [counted, slug, initialShown]);

  // Before paint: the kept scroll, clamped to the new design's length.
  useLayoutEffect(() => {
    const kept = pendingScroll.current;
    if (kept === null) return;
    pendingScroll.current = null;
    const root = document.documentElement;
    window.scrollTo({
      top: clampScroll(kept, root.scrollHeight, window.innerHeight),
      behavior: "instant",
    });
  }, [shown]);

  // After paint: the one switch log. React flushes a click's effects before
  // the browser paints, so the send waits for the next frame, then a task.
  // A tab that draws no frame (hidden) sends after a short wait instead.
  useEffect(() => {
    const log = pendingLog.current;
    if (!log) return;
    pendingLog.current = null;
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      sendLog(slug, log);
    };
    const fallback = setTimeout(send, 250);
    requestAnimationFrame(() => {
      clearTimeout(fallback);
      setTimeout(send, 0);
    });
  }, [shown, slug]);

  const onSwitch = useCallback(
    (to: string) => {
      const plan = planSwitch({
        designs,
        shown,
        to,
        counted,
        commentsOn: commentsOn ? (commentsOn[to] ?? 0) : null,
      });
      if (!plan) return;
      pendingScroll.current = window.scrollY;
      pendingLog.current = plan.log;
      setShown(plan.shown);
      setAnnouncement(plan.announcement);
    },
    [designs, shown, counted, commentsOn, setShown],
  );

  const current = designs.find((d) => d.id === shown) ?? designs[0]!;

  return (
    <div
      style={{ "--review-bar-height": `${barHeight}px` } as CSSProperties}
      className="contents"
    >
      <main className="min-h-dvh pb-(--review-bar-height)">
        <div
          key={current.id}
          ref={pins.setRoot}
          data-sandbox-design={current.id}
          // Comment mode (LAB-12): the crosshair, the hovered element's
          // outline, and a visible ring on each region's Tab stop.
          className="data-commenting:cursor-crosshair data-commenting:**:cursor-crosshair data-commenting:[&_[data-pin-hover]]:outline-2 data-commenting:[&_[data-pin-hover]]:outline-offset-2 data-commenting:[&_[data-pin-hover]]:outline-ring data-commenting:[&_[data-sandbox-region]:focus-visible]:outline-3 data-commenting:[&_[data-sandbox-region]:focus-visible]:outline-offset-4 data-commenting:[&_[data-sandbox-region]:focus-visible]:outline-ring"
        >
          {current.element}
        </div>
      </main>
      <PinsLayer />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <ReviewBar
        slug={slug}
        designs={designs}
        shown={current.id}
        onSwitch={onSwitch}
        primary={primary}
        commentToggle={<CommentToggle />}
        commentsButton={<CommentsButton />}
        saveStatus={<SaveStatusText />}
        statusLine={statusLine}
        onHeight={setBarHeight}
      />
    </div>
  );
}
