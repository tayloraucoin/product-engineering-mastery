/**
 * The closing review's form, pure (review.md; S20, S21, S22, D-LAB-2): what
 * the reviewer has answered, what is still required and in which order, when
 * the comments show, which comment matters most, the payload a send carries,
 * and the draft kept in this browser. The form leaf renders it; the server
 * checks a send with the same `requiredGaps`, so the browser's check is never
 * trusted alone.
 *
 * The draft is localStorage `sandbox:review-draft:<slug>:<reviewerId>`
 * (LAB-21 reads and removes it), JSON `{ answers, triage, versionId? }`,
 * removed on a send's ok. Storage can throw (private windows, blocked site
 * data, a full quota): every read and write is wrapped, and the form then
 * lives in memory for the page.
 *
 * Pure and client-safe: no @pem/db, next or env.ts.
 */

import type { ConfigQuestion } from "../../../app/experimental/_experiments/registry.ts";
import type { StorageLike } from "./queue.ts";
import {
  CANT_JUDGE,
  NEXT_STEP_OPTIONS,
  OVERALL_SCALE,
  REVIEW_CORE,
  REVIEW_ERRORS,
  TRIAGE_OPTIONS,
  type TriageId,
} from "./review-core.ts";

/** What the reviewer has typed and chosen, as the form holds it. */
export type FormAnswers = {
  overall: string | null;
  blockersText: string;
  /** "Nothing, I'd approve it": the text box is disabled and its text kept unsent. */
  blockersNone: boolean;
  gaps: string;
  targeted: string | null;
  /** The config's extra questions, by id. */
  questions: Record<string, string>;
  nextStep: string | null;
};

/** The triage as sent and stored: a choice per comment id, and the one that matters most. */
export type ReviewTriage = {
  comments: Record<string, TriageId>;
  mattersMost: string | null;
};

export type ReviewForm = FormAnswers & {
  triage: Record<string, TriageId>;
  mattersMost: string | null;
};

/** The answers as one version stores them: option ids, text only where written. */
export type ReviewAnswers = {
  overall?: string;
  blockers?: { none: true } | { text: string };
  gaps?: string;
  targeted?: string;
  questions?: Record<string, string>;
  nextStep?: string;
};

export type ReviewPayload = { answers: ReviewAnswers; triage: ReviewTriage };

/** What the review asks beyond the core: the config's part. */
export type ReviewConfig = {
  goals: readonly string[];
  targetedQuestion?: { text: string; labels: readonly string[] };
  questions: readonly ConfigQuestion[];
};

/** One comment as the form plays it back. */
export type ReviewComment = { id: string; number: number };

export function emptyForm(): ReviewForm {
  return {
    overall: null,
    blockersText: "",
    blockersNone: false,
    gaps: "",
    targeted: null,
    questions: {},
    nextStep: null,
    triage: {},
    mattersMost: null,
  };
}

const isTriage = (value: unknown): value is TriageId =>
  TRIAGE_OPTIONS.some((o) => o.id === value);

/** Keeps only the triage of comments still here: a deleted comment is gone. */
function triageOf(
  raw: unknown,
  comments: readonly ReviewComment[],
): Record<string, TriageId> {
  const out: Record<string, TriageId> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const c of comments) {
    const choice = (raw as Record<string, unknown>)[c.id];
    if (isTriage(choice)) out[c.id] = choice;
  }
  return out;
}

/**
 * Edit mode: the latest version filled in. Comments added since are
 * untriaged; deleted ones are gone.
 */
export function formFromVersion(
  version: { answers: unknown; triage: unknown },
  comments: readonly ReviewComment[],
): ReviewForm {
  const a = (version.answers ?? {}) as ReviewAnswers;
  const t = (version.triage ?? {}) as Partial<ReviewTriage>;
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  const blockers = a.blockers as { none?: unknown; text?: unknown } | undefined;
  const triage = triageOf(t.comments, comments);
  return {
    overall: typeof a.overall === "string" ? a.overall : null,
    blockersText: text(blockers?.text),
    blockersNone: blockers?.none === true,
    gaps: text(a.gaps),
    targeted: typeof a.targeted === "string" ? a.targeted : null,
    questions:
      a.questions && typeof a.questions === "object"
        ? Object.fromEntries(
            Object.entries(a.questions).filter(
              (e): e is [string, string] => typeof e[1] === "string",
            ),
          )
        : {},
    nextStep: typeof a.nextStep === "string" ? a.nextStep : null,
    triage,
    mattersMost:
      typeof t.mattersMost === "string" && t.mattersMost in triage
        ? t.mattersMost
        : null,
  };
}

/** The comments marked Must or Should, in number order: the choices for "matters most". */
export function mattersMostChoices(
  triage: Readonly<Record<string, TriageId>>,
  comments: readonly ReviewComment[],
): ReviewComment[] {
  return [...comments]
    .sort((a, b) => a.number - b.number)
    .filter((c) => triage[c.id] === "must" || triage[c.id] === "should");
}

/**
 * "Which matters most?": shown only for two or more Must or Should; with
 * exactly one, it is set to that one and hidden; with none, neither.
 */
export function mattersMostView(
  form: Pick<ReviewForm, "triage" | "mattersMost">,
  comments: readonly ReviewComment[],
): { shown: boolean; value: string | null; choices: ReviewComment[] } {
  const choices = mattersMostChoices(form.triage, comments);
  if (choices.length === 0) return { shown: false, value: null, choices };
  if (choices.length === 1)
    return { shown: false, value: choices[0]!.id, choices };
  const value = choices.some((c) => c.id === form.mattersMost)
    ? form.mattersMost
    : null;
  return { shown: true, value, choices };
}

/**
 * Goal fit comes first (research §3): on a first send no comment text
 * renders until goal fit has an answer ("Can't judge yet" counts). In edit
 * mode the comments are open.
 */
export function commentsOpen(
  form: Pick<ReviewForm, "overall">,
  editing: boolean,
): boolean {
  return editing || form.overall !== null;
}

/** What one send carries: option ids, text only where written, the triage of comments still here. */
export function toPayload(
  form: ReviewForm,
  comments: readonly ReviewComment[],
): ReviewPayload {
  const answers: ReviewAnswers = {};
  if (form.overall) answers.overall = form.overall;
  if (form.blockersNone) answers.blockers = { none: true };
  else if (form.blockersText.trim())
    answers.blockers = { text: form.blockersText };
  if (form.gaps.trim()) answers.gaps = form.gaps;
  if (form.targeted) answers.targeted = form.targeted;
  const questions = Object.fromEntries(
    Object.entries(form.questions).filter(([, v]) => v.trim() !== ""),
  );
  if (Object.keys(questions).length) answers.questions = questions;
  if (form.nextStep) answers.nextStep = form.nextStep;
  const triage = triageOf(form.triage, comments);
  return {
    answers,
    triage: {
      comments: triage,
      mattersMost: mattersMostView(
        { triage, mattersMost: form.mattersMost },
        comments,
      ).value,
    },
  };
}

/** One required answer still missing: where its field is, what it is called, and its error. */
export type Gap = {
  /** The field's id on the page, and the id the server names. */
  id: string;
  label: string;
  message: string;
};

export const GAP_IDS = {
  overall: "overall",
  triage: (commentId: string) => `triage-${commentId}`,
  mattersMost: "matters-most",
  blockers: "blockers",
  question: (questionId: string) => `question-${questionId}`,
  nextStep: "next-step",
} as const;

/**
 * Every required answer still missing, in page order: goal fit ("Can't
 * judge yet" counts), the triage of every comment, "matters most" when two
 * or more are Must or Should, blockers (text or the box), each question the
 * config marks required, and the next step.
 */
export function requiredGaps(
  payload: ReviewPayload,
  comments: readonly ReviewComment[],
  config: Pick<ReviewConfig, "questions">,
): Gap[] {
  const gaps: Gap[] = [];
  const { answers, triage } = payload;
  if (!answers.overall)
    gaps.push({
      id: GAP_IDS.overall,
      label: REVIEW_CORE.overall.question,
      message: REVIEW_ERRORS.overall,
    });
  const ordered = [...comments].sort((a, b) => a.number - b.number);
  for (const c of ordered)
    if (!triage.comments[c.id])
      gaps.push({
        id: GAP_IDS.triage(c.id),
        label: REVIEW_CORE.comments.triageGroup(c.number),
        message: REVIEW_ERRORS.triage,
      });
  const most = mattersMostView(
    { triage: triage.comments, mattersMost: triage.mattersMost },
    comments,
  );
  if (most.shown && most.value === null)
    gaps.push({
      id: GAP_IDS.mattersMost,
      label: REVIEW_CORE.comments.mattersMost,
      message: REVIEW_ERRORS.mattersMost,
    });
  if (!answers.blockers)
    gaps.push({
      id: GAP_IDS.blockers,
      label: REVIEW_CORE.blockers.question,
      message: REVIEW_ERRORS.blockers,
    });
  for (const q of config.questions)
    if (q.required && !answers.questions?.[q.id]?.trim())
      gaps.push({
        id: GAP_IDS.question(q.id),
        label: q.text,
        message: REVIEW_ERRORS.question,
      });
  if (!answers.nextStep)
    gaps.push({
      id: GAP_IDS.nextStep,
      label: REVIEW_CORE.nextStep.question,
      message: REVIEW_ERRORS.nextStep,
    });
  return gaps;
}

/** The option ids an answer may hold, for the server's check. */
export const ANSWER_OPTIONS = {
  overall: [...OVERALL_SCALE.map((o) => o.id), CANT_JUDGE.id] as string[],
  nextStep: NEXT_STEP_OPTIONS.map((o) => o.id) as string[],
};

// The draft ------------------------------------------------------------------

/** The draft as kept: the answers, the triage, and the version id once minted. */
export type ReviewDraft = {
  answers: FormAnswers;
  triage: ReviewTriage;
  versionId?: string;
};

export function draftKey(slug: string, reviewerId: string): string {
  return `sandbox:review-draft:${slug}:${reviewerId}`;
}

export function draftOf(form: ReviewForm, versionId?: string): ReviewDraft {
  const { triage, mattersMost, ...answers } = form;
  return {
    answers,
    triage: { comments: triage, mattersMost },
    ...(versionId ? { versionId } : {}),
  };
}

/** The draft as a form over the comments here, or null when none is kept or it cannot be read. */
export function readDraft(
  storage: StorageLike | null,
  key: string,
  comments: readonly ReviewComment[],
): { form: ReviewForm; versionId?: string } | null {
  let raw: unknown;
  try {
    const text = storage?.getItem(key);
    if (!text) return null;
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  const d = raw as Partial<ReviewDraft> | null;
  if (
    !d ||
    typeof d !== "object" ||
    !d.answers ||
    typeof d.answers !== "object"
  )
    return null;
  const a = d.answers as Partial<FormAnswers>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const strOrNull = (v: unknown) => (typeof v === "string" ? v : null);
  const triage = triageOf(d.triage?.comments, comments);
  const form: ReviewForm = {
    overall: strOrNull(a.overall),
    blockersText: str(a.blockersText),
    blockersNone: a.blockersNone === true,
    gaps: str(a.gaps),
    targeted: strOrNull(a.targeted),
    questions:
      a.questions && typeof a.questions === "object"
        ? Object.fromEntries(
            Object.entries(a.questions).filter(
              (e): e is [string, string] => typeof e[1] === "string",
            ),
          )
        : {},
    nextStep: strOrNull(a.nextStep),
    triage,
    mattersMost:
      typeof d.triage?.mattersMost === "string" &&
      d.triage.mattersMost in triage
        ? d.triage.mattersMost
        : null,
  };
  return typeof d.versionId === "string"
    ? { form, versionId: d.versionId }
    : { form };
}

/** Keeps the draft; a storage that refuses leaves it in memory for the page. */
export function writeDraft(
  storage: StorageLike | null,
  key: string,
  draft: ReviewDraft,
): void {
  try {
    storage?.setItem(key, JSON.stringify(draft));
  } catch {
    // The form still holds it.
  }
}

export function clearDraft(storage: StorageLike | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Nothing to keep.
  }
}

/** A comment deleted from the review: its triage goes, and "matters most" if it was that one. */
export function withoutComment(form: ReviewForm, id: string): ReviewForm {
  const triage = Object.fromEntries(
    Object.entries(form.triage).filter(([key]) => key !== id),
  );
  return {
    ...form,
    triage,
    mattersMost: form.mattersMost === id ? null : form.mattersMost,
  };
}
