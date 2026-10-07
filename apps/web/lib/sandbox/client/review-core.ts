/**
 * The closing review's core, wording v1 (review.md; S20, Envoy's set,
 * research §1a), held as data: the sections in page order, each question's
 * id, its words and its options. The form, the server's check and /admin
 * (LAB-22, LAB-23) read the wording from here, never from a copy. Wording
 * changes only with a new core version, and every version stores the core
 * version it was asked in.
 *
 * Answers store option ids, never labels, so a label reads from here. With
 * several designs, LAB-18 replaces `overall` by its section id and adds the
 * choice; nothing else here assumes one design.
 *
 * Pure and client-safe: no @pem/db, next or env.ts.
 */

export const CORE_VERSION = "v1";

/** review.md's goal-fit scale, in order, with "Can't judge yet" set apart. */
export const OVERALL_SCALE = [
  { id: "not-at-all", label: "Not at all well" },
  { id: "slightly", label: "Slightly well" },
  { id: "moderately", label: "Moderately well" },
  { id: "very", label: "Very well" },
  { id: "extremely", label: "Extremely well" },
] as const;

export const CANT_JUDGE = {
  id: "cant-judge",
  label: "Can't judge yet",
} as const;

export const TRIAGE_OPTIONS = [
  { id: "must", label: "Must change" },
  { id: "should", label: "Should change" },
  { id: "fine", label: "Fine either way" },
] as const;

export const NEXT_STEP_OPTIONS = [
  { id: "approve", label: "Approve as it is" },
  {
    id: "approve-after-must",
    label: "Approve once my must-change items are done",
  },
  { id: "another-round", label: "I need another round before deciding" },
  { id: "rethink", label: "Rethink the direction" },
] as const;

export type OverallId =
  (typeof OVERALL_SCALE)[number]["id"] | (typeof CANT_JUDGE)["id"];
export type TriageId = (typeof TRIAGE_OPTIONS)[number]["id"];
export type NextStepId = (typeof NEXT_STEP_OPTIONS)[number]["id"];

/** The core sections in page order; the config's questions sit between Gaps and Next step. */
export const CORE_SECTIONS = [
  "overall",
  "comments",
  "blockers",
  "gaps",
  "questions",
  "next-step",
] as const;
export type CoreSection = (typeof CORE_SECTIONS)[number];

/** review.md's Words, verbatim. */
export const REVIEW_CORE = {
  coreVersion: CORE_VERSION,
  overall: {
    heading: "Overall",
    question: "How well does this design meet the goals below?",
    lookAgain: "Look at the design again",
  },
  comments: {
    heading: "Your comments",
    lead: "Here are the comments you left. For each, choose: Must change, Should change or Fine either way. Then pick the one that matters most.",
    locked: "Answer the question above to see your comments.",
    none: "You didn't leave any comments. That's fine; you can go back and add some, or carry on.",
    mattersMost: "Which matters most?",
    triageGroup: (n: number) =>
      `Comment ${n}: Must change, Should change or Fine either way`,
    delete: "Delete",
  },
  blockers: {
    heading: "Blockers",
    question: "What, if anything, would stop you approving this as it stands?",
    none: "Nothing, I'd approve it",
    disabledReason: "Untick to write blockers",
  },
  gaps: {
    heading: "Gaps",
    question: "Is anything missing that you expected to see?",
  },
  nextStep: {
    heading: "Next step",
    question: "What should happen next?",
  },
  back: "Back to the designs",
  send: "Send review",
  sendChanges: "Send changes",
  sending: "Sending",
  leadDraft: "Answers are kept in this browser until you send.",
  leadEdit: (sentOn: string) =>
    `You sent this on ${sentOn}. The team sees your latest answers and can look back at earlier ones.`,
  missing: (n: number) =>
    // [ASSUMPTION] the singular; the Words give "3 answers are missing".
    n === 1 ? "1 answer is missing" : `${n} answers are missing`,
  offline:
    "You're offline. Your answers are kept in this browser; send when you're back.",
  sendFailed:
    "Your review didn't send. Your answers are still here. Try again.",
  closed:
    "This review closed before your answers arrived, so they weren't saved.",
  closedLink: "See what happened",
} as const;

/**
 * Each required answer's field error. [ASSUMPTION] review.md names the
 * required answers but gives no error words; these say what to do.
 */
export const REVIEW_ERRORS = {
  overall: "Choose how well it meets the goals, or Can't judge yet.",
  triage: "Choose Must change, Should change or Fine either way.",
  mattersMost: "Choose the comment that matters most.",
  blockers: "Write what would stop you, or tick Nothing, I'd approve it.",
  question: "Answer this question.",
  nextStep: "Choose what should happen next.",
} as const;

export function overallLabel(id: string): string | null {
  if (id === CANT_JUDGE.id) return CANT_JUDGE.label;
  return OVERALL_SCALE.find((o) => o.id === id)?.label ?? null;
}

export function triageLabel(id: string): string | null {
  return TRIAGE_OPTIONS.find((o) => o.id === id)?.label ?? null;
}

export function nextStepLabel(id: string): string | null {
  return NEXT_STEP_OPTIONS.find((o) => o.id === id)?.label ?? null;
}
