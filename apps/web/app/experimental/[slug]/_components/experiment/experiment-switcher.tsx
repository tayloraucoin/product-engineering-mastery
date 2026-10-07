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
  type BarData,
  type DesignOption,
  type PrimaryKind,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  clampScroll,
  planSwitch,
  type SwitchLog,
} from "../../../../../lib/sandbox/client/switcher";
import { recordView } from "../../actions";
import {
  CommentsButton,
  CommentToggle,
  SaveStatusText,
  statusLineFor,
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
  bar: BarData;
  /** The viewer's comment count per design, for the switch announcement; null until LAB-12 loads them. */
  commentsOn: Readonly<Record<string, number>> | null;
};

function sendLog(
  slug: string,
  log: SwitchLog | { kind: "load"; design: string },
) {
  // Fire-and-forget: a failed log never undoes a switch or breaks the page.
  void recordView(slug, log).catch(() => undefined);
}

export function ExperimentSwitcher({
  slug,
  designs,
  initialShown,
  primary,
  counted,
  bar,
  commentsOn,
}: ExperimentSwitcherProps) {
  const [shown, setShown] = useState(initialShown);
  const [announcement, setAnnouncement] = useState("");
  const [barHeight, setBarHeight] = useState(0);
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

  // After paint: the one switch log.
  useEffect(() => {
    const log = pendingLog.current;
    if (!log) return;
    pendingLog.current = null;
    sendLog(slug, log);
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
    [designs, shown, counted, commentsOn],
  );

  const current = designs.find((d) => d.id === shown) ?? designs[0]!;

  return (
    <div
      style={{ "--review-bar-height": `${barHeight}px` } as CSSProperties}
      className="contents"
    >
      <main className="min-h-dvh pb-(--review-bar-height)">
        <div key={current.id} data-sandbox-design={current.id}>
          {current.element}
        </div>
      </main>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <ReviewBar
        slug={slug}
        designs={designs}
        shown={current.id}
        onSwitch={onSwitch}
        primary={primary}
        commentToggle={<CommentToggle status={bar.status} />}
        commentsButton={<CommentsButton count={bar.commentCount} />}
        saveStatus={<SaveStatusText status={bar.status} />}
        statusLine={statusLineFor(bar.status)}
        onHeight={setBarHeight}
      />
    </div>
  );
}
