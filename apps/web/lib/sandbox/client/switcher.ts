/**
 * The design switch, pure (experiment.md "Switching"; R9, D-LAB-40). Every
 * design is already rendered on the server and handed to the switcher, so a
 * switch is a state change with no request: the new design mounts, the
 * scroll is restored clamped to the new page's length, the switch is logged
 * once after the paint, and it is announced politely.
 *
 * Client-safe: nothing here imports @pem/db, next/headers or env.ts.
 */

import type { DesignOption } from "./experiment-view.ts";

/** The one log a switch makes, sent fire-and-forget after the new design paints. */
export type SwitchLog = { kind: "switch"; design: string };

export type SwitchPlan = {
  /** The design to mount. */
  shown: string;
  /** Logged once, after the paint; null when the views are not counted (the team). */
  log: SwitchLog | null;
  announcement: string;
};

/**
 * What a press on `to` does, or null when it changes nothing: `to` is the
 * shown design, or not one of the experiment's designs. `commentsOn` is the
 * viewer's comment count on `to`, or null when there is none to give.
 */
export function planSwitch(input: {
  designs: readonly DesignOption[];
  shown: string;
  to: unknown;
  counted: boolean;
  commentsOn: number | null;
}): SwitchPlan | null {
  const target = input.designs.find((d) => d.id === input.to);
  if (!target || target.id === input.shown) return null;
  return {
    shown: target.id,
    log: input.counted ? { kind: "switch", design: target.id } : null,
    announcement: switchAnnouncement(target, input.commentsOn),
  };
}

/**
 * "Showing the Square design. 2 of your comments are on it."
 * [ASSUMPTION: the Words give only the plural; one reads "1 of your comments
 * is on it." and none "None of your comments are on it."; with no count, the
 * first sentence alone.]
 */
export function switchAnnouncement(
  design: DesignOption,
  commentsOn: number | null,
): string {
  const showing = `Showing the ${design.name} design.`;
  if (commentsOn === null) return showing;
  if (commentsOn === 0) return `${showing} None of your comments are on it.`;
  if (commentsOn === 1) return `${showing} 1 of your comments is on it.`;
  return `${showing} ${commentsOn} of your comments are on it.`;
}

/** The scroll kept across a switch, clamped to the new page's length. */
export function clampScroll(
  scrollTop: number,
  scrollHeight: number,
  viewportHeight: number,
): number {
  const max = Math.max(0, scrollHeight - viewportHeight);
  return Math.min(Math.max(0, scrollTop), max);
}
