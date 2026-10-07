/**
 * The experiment page's words, design labels and `?state=` fixtures
 * (ux/experimental/experiment.md; D-LAB-9, D-LAB-10), pure and client-safe:
 * nothing here imports @pem/db, next/headers or env.ts, so the bar and the
 * switcher import it, and `node --test` runs it.
 */

/** Neutral labels, fixed per experiment (D-LAB-10): glyph plus shape name, never a colour alone. */
export const SHAPE_LABELS = {
  circle: { glyph: "●", name: "Circle" },
  square: { glyph: "■", name: "Square" },
  triangle: { glyph: "▲", name: "Triangle" },
  diamond: { glyph: "◆", name: "Diamond" },
} as const;

export type DesignShapeKey = keyof typeof SHAPE_LABELS;

/** One design as the bar shows it. */
export type DesignOption = {
  id: string;
  shape: DesignShapeKey;
  /** "● Circle" */
  label: string;
  /** "Circle design", the switcher item's accessible name. */
  accessibleName: string;
  /** "Circle", for the switch announcement. */
  name: string;
};

export function designOption(design: {
  id: string;
  shape: DesignShapeKey;
}): DesignOption {
  const { glyph, name } = SHAPE_LABELS[design.shape];
  return {
    id: design.id,
    shape: design.shape,
    label: `${glyph} ${name}`,
    accessibleName: `${name} design`,
    name,
  };
}

/** experiment.md's Words, verbatim. */
export const EXPERIMENT_WORDS = {
  barRegion: "Review tools",
  switcherGroup: "Designs",
  comment: "Comment",
  comments: (count: number) => `Comments ${count}`,
  // [ASSUMPTION] the button's name when the count failed to load; the Words give none.
  commentsUncounted: "Comments",
  loadingComments: "Loading comments",
  loadError: "Couldn't load your comments.",
  retry: "Retry",
  unsent: (count: number) => `${count} not sent yet`,
  offline:
    "Offline. New comments stay in this browser and send when you're back.",
  saved: "Saved",
  closed:
    "This review has closed, so new comments can't be sent. Reload to see what was kept.",
  revoked: "This page can't save comments any more. Reload the page.",
  finish: "Finish review",
  edit: "Edit your review",
  back: "Back to your review",
} as const;

/** Which primary the bar shows: before sending, after sending, or opened from the review. */
export type PrimaryKind = "finish" | "edit" | "back";

export function primaryLabel(kind: PrimaryKind): string {
  return kind === "back"
    ? EXPERIMENT_WORDS.back
    : kind === "edit"
      ? EXPERIMENT_WORDS.edit
      : EXPERIMENT_WORDS.finish;
}

/** The review page a primary links to (LAB-17). */
export function reviewPath(slug: string): string {
  return `/experimental/${encodeURIComponent(slug)}/review`;
}

/**
 * What the save status shows. `none` is empty at rest. `offline`, `closed`
 * and `revoked` are a full-width line above the bar at every width; the rest
 * sit in the bar beside the primary.
 */
export type SaveStatus =
  | { kind: "none" }
  | { kind: "error" }
  | { kind: "partial"; unsent: number }
  | { kind: "offline" }
  | { kind: "saved" }
  | { kind: "closed" }
  | { kind: "revoked" };

/** The bar's live data. LAB-12 and LAB-13 feed it; here it comes from fixtures. */
export type BarData = {
  /** Comments across every design; null while they load. */
  commentCount: number | null;
  status: SaveStatus;
};

export const BAR_AT_REST: BarData = {
  commentCount: 0,
  status: { kind: "none" },
};

/** The Comments button: its count, "Loading comments" while loading, and no count when the load failed. */
export function commentsButtonView(bar: BarData): {
  label: string;
  disabled: boolean;
} {
  if (bar.commentCount !== null)
    return {
      label: EXPERIMENT_WORDS.comments(bar.commentCount),
      disabled: false,
    };
  if (bar.status.kind === "error")
    return { label: EXPERIMENT_WORDS.commentsUncounted, disabled: false };
  return { label: EXPERIMENT_WORDS.loadingComments, disabled: true };
}

/** Placing is disabled once the review has closed or access has ended. */
export function placingDisabled(status: SaveStatus): boolean {
  return status.kind === "closed" || status.kind === "revoked";
}

/** experiment.md's States, each reachable by `?state=` for the team only. */
export const EXPERIMENT_STATE_KEYS = [
  "exp-empty",
  "exp-loading",
  "exp-error",
  "exp-partial",
  "exp-offline",
  "exp-success",
  "exp-single",
  "exp-returning",
  "exp-sent",
  "exp-closed",
  "exp-revoked",
] as const;

export type ExperimentStateKey = (typeof EXPERIMENT_STATE_KEYS)[number];

export function isExperimentStateKey(
  value: unknown,
): value is ExperimentStateKey {
  return (EXPERIMENT_STATE_KEYS as readonly unknown[]).includes(value);
}

/** One fixture: the bar's data, the primary, and whether only one design renders. */
export type ExperimentFixture = {
  bar: BarData;
  primary: PrimaryKind;
  single: boolean;
};

/** Synthetic values only: counts, never a reviewer's words. */
export function experimentFixture(key: ExperimentStateKey): ExperimentFixture {
  const base: ExperimentFixture = {
    bar: { commentCount: 5, status: { kind: "none" } },
    primary: "finish",
    single: false,
  };
  switch (key) {
    case "exp-empty":
      return { ...base, bar: BAR_AT_REST };
    case "exp-loading":
      return { ...base, bar: { commentCount: null, status: { kind: "none" } } };
    case "exp-error":
      return {
        ...base,
        bar: { commentCount: null, status: { kind: "error" } },
      };
    case "exp-partial":
      return {
        ...base,
        bar: { commentCount: 5, status: { kind: "partial", unsent: 2 } },
      };
    case "exp-offline":
      return { ...base, bar: { commentCount: 5, status: { kind: "offline" } } };
    case "exp-success":
      return { ...base, bar: { commentCount: 5, status: { kind: "saved" } } };
    case "exp-single":
      return { ...base, single: true };
    case "exp-returning":
      return { ...base, primary: "back" };
    case "exp-sent":
      return { ...base, primary: "edit" };
    case "exp-closed":
      return { ...base, bar: { commentCount: 5, status: { kind: "closed" } } };
    case "exp-revoked":
      return { ...base, bar: { commentCount: 5, status: { kind: "revoked" } } };
  }
}
