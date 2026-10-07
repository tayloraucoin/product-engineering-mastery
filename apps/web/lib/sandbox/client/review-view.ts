/**
 * The review page's `?state=` keys and their fixtures (review.md States;
 * canon C-P08), and how a comment is played back. Each key renders for the
 * team only, on synthetic data; a fixture reads and writes nothing.
 *
 * Pure and client-safe: no @pem/db, next or env.ts.
 */

import type { DesignOption } from "./experiment-view.ts";
import { COMMENT_BODY_MAX, PIN_WORDS, placeOf } from "./pins-view.ts";
import type { QueueEntry } from "./queue.ts";
import { REVIEW_CORE } from "./review-core.ts";
import { emptyForm, type ReviewForm } from "./review-form.ts";

export const REVIEW_STATE_KEYS = [
  "review-empty",
  "review-no-comments",
  "review-loading",
  "review-error",
  "review-partial",
  "review-offline",
  "review-sending",
  "review-send-failed",
  "review-closed",
  "review-edit",
  "review-success",
] as const;

export type ReviewStateKey = (typeof REVIEW_STATE_KEYS)[number];

export function isReviewStateKey(value: unknown): value is ReviewStateKey {
  return (REVIEW_STATE_KEYS as readonly unknown[]).includes(value);
}

/** Where the form is: answering, sending, or one of the lines above the button. */
export type ReviewStatus =
  "idle" | "sending" | "send-failed" | "offline" | "closed";

/** One fixture: the comments, the form, the latest send (edit mode), and the status. */
export type ReviewFixture = {
  comments: QueueEntry[];
  form: ReviewForm;
  /** The latest version's send time, ISO: edit mode. */
  latestAt: string | null;
  status: ReviewStatus;
  /** Whether the summary and field errors show. */
  showErrors: boolean;
  /** Section skeletons while the comments load. */
  loading: boolean;
  /** The sent slot (LAB-19 fills it): first send or a later one. */
  sent: "first" | "later" | null;
};

const viewport = { viewportW: 390, viewportH: 844 };

/** Synthetic pins: invented words on the demo experiment's designs. */
export function fixtureComments(design: string): QueueEntry[] {
  return [
    {
      id: "00000000-0000-4000-8000-000000000101",
      number: 1,
      design,
      kind: "problem",
      body: "The annual price is hard to find until I scroll past the plans.",
      anchor: { marked: "plans", x: 0.4, y: 0.3, place: "Plans" },
      ...viewport,
      clientCreatedAt: "2026-10-05T09:12:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      number: 2,
      design,
      kind: "question",
      body: "Does the Team plan include guest seats?",
      anchor: {
        marked: "compare",
        x: 0.6,
        y: 0.5,
        place: "Comparison table",
      },
      ...viewport,
      clientCreatedAt: "2026-10-05T09:15:00.000Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      number: 3,
      design,
      kind: "keep",
      body: "The plain wording on the free plan reads well.",
      anchor: { marked: "faq", x: 0.2, y: 0.8, place: "Questions" },
      ...viewport,
      clientCreatedAt: "2026-10-05T09:21:00.000Z",
    },
  ];
}

const [C1, C2, C3] = [
  "00000000-0000-4000-8000-000000000101",
  "00000000-0000-4000-8000-000000000102",
  "00000000-0000-4000-8000-000000000103",
];

/** A filled form: every required answer given. */
function filledForm(): ReviewForm {
  return {
    ...emptyForm(),
    overall: "moderately",
    triage: { [C1]: "must", [C2]: "should", [C3]: "fine" },
    mattersMost: C1,
    blockersText: "The annual price needs to be visible next to each plan.",
    gaps: "A line on what happens when a team outgrows its plan.",
    nextStep: "approve-after-must",
  };
}

export function reviewFixture(
  key: ReviewStateKey,
  design: string,
): ReviewFixture {
  const base: ReviewFixture = {
    comments: fixtureComments(design),
    form: emptyForm(),
    latestAt: null,
    status: "idle",
    showErrors: false,
    loading: false,
    sent: null,
  };
  switch (key) {
    case "review-empty":
      return base;
    case "review-no-comments":
      return { ...base, comments: [], form: { ...emptyForm() } };
    case "review-loading":
      return { ...base, loading: true };
    case "review-error":
      // Three gaps: comment 3's triage, blockers and the next step.
      return {
        ...base,
        form: {
          ...emptyForm(),
          overall: "very",
          triage: { [C1]: "must", [C2]: "fine" },
        },
        showErrors: true,
      };
    case "review-partial":
      return {
        ...base,
        form: {
          ...emptyForm(),
          overall: "moderately",
          triage: { [C1]: "must", [C2]: "should" },
        },
      };
    case "review-offline":
      return { ...base, form: filledForm(), status: "offline" };
    case "review-sending":
      return { ...base, form: filledForm(), status: "sending" };
    case "review-send-failed":
      return { ...base, form: filledForm(), status: "send-failed" };
    case "review-closed":
      return { ...base, form: filledForm(), status: "closed" };
    case "review-edit":
      return {
        ...base,
        form: filledForm(),
        latestAt: "2026-10-05T14:32:00.000Z",
      };
    case "review-success":
      return { ...base, form: filledForm(), sent: "first" };
  }
}

/** The edit lead's date, in the reader's locale: "5 October". */
export function sentOn(iso: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/** sent.md's heading, until LAB-19 builds the sent view: a first send or a later one. */
export const SENT_WORDS = {
  first: "Review sent",
  later: "Changes sent",
} as const;

/** One comment as the review plays it back: number, design (several only), place and type. */
export type CommentPlayback = {
  id: string;
  number: number;
  /** "Comment 3 · ■ Square · Plans · Problem" */
  meta: string;
  body: string;
  /** The triage group's name (review.md Access). */
  triageGroup: string;
};

export function commentPlayback(
  pins: readonly QueueEntry[],
  designs: readonly DesignOption[],
): CommentPlayback[] {
  const several = designs.length > 1;
  return [...pins]
    .sort((a, b) => a.number - b.number)
    .map((pin) => ({
      id: pin.id,
      number: pin.number,
      meta: [
        `Comment ${pin.number}`,
        several ? designs.find((d) => d.id === pin.design)?.label : null,
        placeOf(pin.anchor),
        pin.kind ? PIN_WORDS.kinds[pin.kind] : null,
      ]
        .filter(Boolean)
        .join(" · "),
      body: pin.body,
      triageGroup: REVIEW_CORE.comments.triageGroup(pin.number),
    }));
}

/**
 * A text edit in the review saves the pin itself, under its own id: the
 * entry to send, or null when nothing should be sent (unchanged, empty, or
 * over 2,000 characters; the pin keeps its own text).
 */
export function editedPin(pin: QueueEntry, body: string): QueueEntry | null {
  if (body === pin.body || !body.trim() || body.length > COMMENT_BODY_MAX)
    return null;
  return { ...pin, body };
}
