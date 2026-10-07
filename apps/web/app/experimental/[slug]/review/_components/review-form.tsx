"use client";

/**
 * The closing review's form (review.md; S20, S21, S22, D-LAB-2). The rules
 * are pure, in lib/sandbox/client/review-*.ts: this leaf holds the state,
 * the draft and the sends.
 *
 * - The draft is read after mount and wins over the latest version (it is
 *   the newest unsent work); every change is kept in this browser.
 * - Send: the browser's check first (nothing is sent with a gap; the summary
 *   takes focus), then LAB-12's queue flushes, then the version, under an id
 *   minted on Send and kept while nothing changes.
 * - Text edits and Delete go through LAB-12's one pin sender, so a queued
 *   pin and its edit never race.
 * - A `?state=` fixture (the team) reads and writes nothing: its send only
 *   shows the browser's check.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import { Button } from "@pem/ui/button";
import { Checkbox } from "@pem/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@pem/ui/field";
import { Textarea } from "@pem/ui/textarea";

import type { ConfigQuestion } from "../../../_experiments/registry";
import type { DesignOption } from "../../../../../lib/sandbox/client/experiment-view";
import {
  mergeLoaded,
  PIN_WORDS,
  type Pin,
} from "../../../../../lib/sandbox/client/pins-view";
import {
  createPinSender,
  createQueueStore,
  queueKey,
  type PinSender,
  type QueueEntry,
  type QueueStore,
} from "../../../../../lib/sandbox/client/queue";
import {
  CANT_JUDGE,
  NEXT_STEP_OPTIONS,
  OVERALL_SCALE,
  REVIEW_CORE as W,
  type TriageId,
} from "../../../../../lib/sandbox/client/review-core";
import {
  clearDraft,
  commentsOpen,
  draftKey,
  draftOf,
  emptyForm,
  formFromVersion,
  GAP_IDS,
  readDraft,
  requiredGaps,
  toPayload,
  withoutComment,
  writeDraft,
  type ReviewForm as Form,
  type Gap,
} from "../../../../../lib/sandbox/client/review-form";
import {
  nextVersionId,
  sendReviewFlow,
} from "../../../../../lib/sandbox/client/review-send";
import {
  editedPin,
  SENT_WORDS,
  sentOn,
  type ReviewFixture,
  type ReviewStatus,
} from "../../../../../lib/sandbox/client/review-view";
import { deleteComment, saveComment, sendReview } from "../../actions";
import { ChoiceGroup } from "./choice-group";
import { ReviewComments } from "./review-comments";

/** What the form asks beyond the core, and where its links go. */
export type ReviewPageConfig = {
  slug: string;
  goals: readonly string[];
  targetedQuestion?: { text: string; labels: readonly string[] };
  questions: readonly ConfigQuestion[];
  designs: readonly DesignOption[];
  backHref: string;
  /** "Look at the design again": one design only (LAB-18 adds one per design). */
  lookAgainHref: string | null;
  endedHref: string;
};

export type ReviewSource =
  | {
      kind: "reviewer";
      reviewerId: string;
      comments: (QueueEntry & { createdAt?: string })[];
      latest: { createdAt: string; answers: unknown; triage: unknown } | null;
    }
  | { kind: "fixture"; fixture: ReviewFixture };

/** Where "Look at the design again" was pressed from, so focus returns to it. */
const returnKey = (slug: string) => `sandbox:review-return:${slug}`;

function storageOrNull(kind: "localStorage" | "sessionStorage") {
  try {
    return window[kind];
  } catch {
    return null;
  }
}

const FOCUSABLE =
  "[role=radio]:not([data-disabled]), textarea:not(:disabled), button:not(:disabled)";

/** Focus a field by its gap id: its first control, else the field itself. */
function focusField(id: string) {
  const field = document.getElementById(id);
  const control =
    field?.querySelector<HTMLElement>("[role=radio][data-checked]") ??
    field?.querySelector<HTMLElement>(FOCUSABLE);
  (control ?? field)?.focus();
}

export function ReviewFormView({
  config,
  source,
}: {
  config: ReviewPageConfig;
  source: ReviewSource;
}) {
  const fixture = source.kind === "fixture" ? source.fixture : null;
  const reviewer = source.kind === "reviewer" ? source : null;

  const [pins, setPins] = useState<Pin[]>(() =>
    fixture
      ? fixture.comments.map((c) => ({ ...c, sync: "sent" as const }))
      : mergeLoaded(reviewer!.comments, []),
  );
  const latestAt = fixture
    ? fixture.latestAt
    : (reviewer!.latest?.createdAt ?? null);
  const editing = latestAt !== null;
  const [form, setForm] = useState<Form>(() =>
    fixture
      ? fixture.form
      : reviewer!.latest
        ? formFromVersion(reviewer!.latest, reviewer!.comments)
        : emptyForm(),
  );
  const [versionId, setVersionId] = useState<string | undefined>();
  const [status, setStatus] = useState<ReviewStatus>(fixture?.status ?? "idle");
  const [online, setOnline] = useState(fixture?.status !== "offline");
  const [showErrors, setShowErrors] = useState(fixture?.showErrors ?? false);
  const [sent, setSent] = useState<"first" | "later" | null>(
    fixture?.sent ?? null,
  );
  const [sentDate, setSentDate] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const summaryRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLParagraphElement>(null);
  const queue = useRef<QueueStore | null>(null);
  const sender = useRef<PinSender | null>(null);
  const key = reviewer ? draftKey(config.slug, reviewer.reviewerId) : null;

  // The edit lead's date, in the reader's own locale: after mount, never on
  // the server, whose locale is not theirs.
  useEffect(() => {
    if (latestAt) setSentDate(sentOn(latestAt));
  }, [latestAt]);

  // A reviewer's draft, queue and connection, after mount: storage is read
  // here, never during render.
  useEffect(() => {
    if (!reviewer || !key) return;
    const local = storageOrNull("localStorage");
    const q = createQueueStore(
      local,
      queueKey(config.slug, reviewer.reviewerId),
    );
    queue.current = q;
    sender.current = createPinSender({
      queue: q,
      online: () => navigator.onLine,
      save: (entry) => saveComment(config.slug, entry).then((r) => r.kind),
      remove: (id) => deleteComment(config.slug, { id }).then((r) => r.kind),
    });
    const merged = mergeLoaded(reviewer.comments, q.all());
    setPins(merged);
    const draft = readDraft(local, key, merged);
    if (draft) {
      setForm(draft.form);
      setVersionId(draft.versionId);
    }
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Back from "Look at the design again": focus the question left from.
    const session = storageOrNull("sessionStorage");
    try {
      const from = session?.getItem(returnKey(config.slug));
      if (from) {
        session?.removeItem(returnKey(config.slug));
        setTimeout(() => focusField(from), 0);
      }
    } catch {
      // Focus stays where the browser put it.
    }
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
    // The source is fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Every change: the form, the draft kept, and a new version id on the next send. */
  const change = useCallback(
    (update: (current: Form) => Form) => {
      setForm((current) => {
        const next = update(current);
        if (key) writeDraft(storageOrNull("localStorage"), key, draftOf(next));
        return next;
      });
      setVersionId(undefined);
      if (status === "send-failed") setStatus("idle");
    },
    [key, status],
  );

  const payload = useMemo(() => toPayload(form, pins), [form, pins]);
  const gaps = useMemo(
    () => requiredGaps(payload, pins, config),
    [payload, pins, config],
  );
  const errors = useMemo(
    () =>
      showErrors
        ? Object.fromEntries(gaps.map((g) => [g.id, g.message]))
        : ({} as Record<string, string>),
    [showErrors, gaps],
  );

  const announce = (text: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(text), 50);
  };

  const onEdit = (pin: Pin, body: string) => {
    const entry = editedPin(pin, body);
    if (!entry) return;
    setPins((current) =>
      current.map((p) =>
        p.id === pin.id ? { ...p, body, sync: "sending" } : p,
      ),
    );
    if (!sender.current) return;
    void sender.current.save(entry).then((outcome) => {
      setPins((current) =>
        current.map((p) =>
          p.id === pin.id
            ? { ...p, sync: queue.current?.get(p.id) ? "unsent" : "sent" }
            : p,
        ),
      );
      if (outcome === "ok") announce(PIN_WORDS.saved(pin.number));
      else if (outcome === "closed") setStatus("closed");
      else announce(PIN_WORDS.keptError(pin.number));
    });
  };

  const onDelete = (pin: Pin) => {
    const drop = () => {
      setPins((current) => current.filter((p) => p.id !== pin.id));
      change((current) => withoutComment(current, pin.id));
      announce(PIN_WORDS.deleted(pin.number));
    };
    if (!sender.current) return drop();
    void sender.current.remove(pin.id).then((outcome) => {
      if (outcome === "ok") drop();
      else if (outcome === "closed" || outcome === "held") setStatus("closed");
      else announce(PIN_WORDS.notDeleted(pin.number));
    });
  };

  const send = async () => {
    if (status === "sending" || status === "closed") return;
    if (gaps.length) {
      setShowErrors(true);
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    if (!reviewer || !sender.current || !online) return;
    const id = nextVersionId(versionId, () => crypto.randomUUID());
    setVersionId(id);
    if (key) writeDraft(storageOrNull("localStorage"), key, draftOf(form, id));
    setStatus("sending");
    const outcome = await sendReviewFlow(
      {
        flushPins: () => sender.current!.flush(),
        queuedPins: () => queue.current?.all().length ?? 0,
        sendReview: (input) => sendReview(config.slug, input),
      },
      id,
      payload,
    );
    switch (outcome.kind) {
      case "sent":
        if (key) clearDraft(storageOrNull("localStorage"), key);
        setStatus("idle");
        setSent(editing ? "later" : "first");
        setTimeout(() => sentRef.current?.focus(), 0);
        return;
      case "invalid":
        setStatus("idle");
        setShowErrors(true);
        setTimeout(() => summaryRef.current?.focus(), 0);
        return;
      case "closed":
        setStatus("closed");
        return;
      case "send-failed":
        setStatus("send-failed");
        return;
    }
  };

  if (sent)
    return (
      <div className="flex flex-col gap-6">
        <p
          ref={sentRef}
          tabIndex={-1}
          className="text-xl font-semibold tracking-tight outline-none"
        >
          {SENT_WORDS[sent]}
        </p>
        <p>
          <Link href={config.backHref} className="underline underline-offset-4">
            {W.back}
          </Link>
        </p>
      </div>
    );

  const closed = status === "closed";
  const sending = status === "sending";
  const locked = closed || sending;
  const shownStatus = !online && status !== "closed" ? "offline" : status;
  const line =
    shownStatus === "offline"
      ? W.offline
      : shownStatus === "send-failed"
        ? W.sendFailed
        : shownStatus === "closed"
          ? W.closed
          : null;

  return (
    <form
      noValidate
      className="flex flex-col gap-12"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <p className="text-muted-foreground">
        {editing ? (sentDate ? W.leadEdit(sentDate) : " ") : W.leadDraft}
      </p>

      {showErrors && gaps.length ? (
        <Summary gaps={gaps} summaryRef={summaryRef} />
      ) : null}

      <Section heading={W.overall.heading}>
        <ChoiceGroup
          id={GAP_IDS.overall}
          legend={W.overall.question}
          options={OVERALL_SCALE}
          apart={[CANT_JUDGE]}
          value={form.overall}
          onChange={(value) => change((f) => ({ ...f, overall: value }))}
          error={errors[GAP_IDS.overall]}
          disabled={locked}
        >
          <ul className="mb-4 list-disc pl-5 text-muted-foreground">
            {config.goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </ChoiceGroup>
        {config.lookAgainHref ? (
          <p>
            <Link
              href={config.lookAgainHref}
              className="-my-3 inline-block py-3 underline underline-offset-4"
              onClick={() => {
                try {
                  storageOrNull("sessionStorage")?.setItem(
                    returnKey(config.slug),
                    GAP_IDS.overall,
                  );
                } catch {
                  // Focus will not return; the page still does.
                }
              }}
            >
              {W.overall.lookAgain}
            </Link>
          </p>
        ) : null}
      </Section>

      <Section heading={W.comments.heading}>
        <ReviewComments
          comments={pins}
          designs={config.designs}
          form={form}
          open={commentsOpen(form, editing)}
          errors={errors}
          backHref={config.backHref}
          disabled={locked}
          onTriage={(id, choice: TriageId) =>
            change((f) => ({ ...f, triage: { ...f.triage, [id]: choice } }))
          }
          onMattersMost={(id) => change((f) => ({ ...f, mattersMost: id }))}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Section>

      <Section heading={W.blockers.heading}>
        <FieldSet
          id={GAP_IDS.blockers}
          tabIndex={-1}
          data-invalid={errors[GAP_IDS.blockers] ? true : undefined}
        >
          <FieldLegend id="blockers-legend">{W.blockers.question}</FieldLegend>
          <Field>
            <Textarea
              id="blockers-text"
              aria-labelledby="blockers-legend"
              value={form.blockersText}
              disabled={locked || form.blockersNone}
              aria-invalid={errors[GAP_IDS.blockers] ? true : undefined}
              aria-describedby={
                [
                  form.blockersNone ? "blockers-reason" : null,
                  errors[GAP_IDS.blockers] ? "blockers-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              onChange={(event) => {
                const value = event.target.value;
                change((f) => ({ ...f, blockersText: value }));
              }}
            />
            {form.blockersNone ? (
              <FieldDescription id="blockers-reason">
                {W.blockers.disabledReason}
              </FieldDescription>
            ) : null}
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="blockers-none"
              aria-labelledby="blockers-none-label"
              checked={form.blockersNone}
              disabled={locked}
              onCheckedChange={(checked: boolean) =>
                change((f) => ({ ...f, blockersNone: checked }))
              }
            />
            <FieldLabel
              id="blockers-none-label"
              htmlFor="blockers-none"
              className="font-normal"
            >
              {W.blockers.none}
            </FieldLabel>
          </Field>
          {errors[GAP_IDS.blockers] ? (
            <FieldError id="blockers-error">
              {errors[GAP_IDS.blockers]}
            </FieldError>
          ) : null}
        </FieldSet>
      </Section>

      <Section heading={W.gaps.heading}>
        <FieldSet>
          <FieldLegend id="gaps-legend">{W.gaps.question}</FieldLegend>
          <Textarea
            id="gaps-text"
            aria-labelledby="gaps-legend"
            value={form.gaps}
            disabled={locked}
            onChange={(event) => {
              const value = event.target.value;
              change((f) => ({ ...f, gaps: value }));
            }}
          />
        </FieldSet>
      </Section>

      {config.targetedQuestion || config.questions.length ? (
        <div className="flex flex-col gap-12">
          {config.targetedQuestion ? (
            <ChoiceGroup
              id="targeted"
              legend={config.targetedQuestion.text}
              options={config.targetedQuestion.labels.map((label) => ({
                id: label,
                label,
              }))}
              value={form.targeted}
              onChange={(value) => change((f) => ({ ...f, targeted: value }))}
              disabled={locked}
            />
          ) : null}
          {config.questions.map((question) => (
            <ConfigQuestionField
              key={question.id}
              question={question}
              value={form.questions[question.id] ?? ""}
              error={errors[GAP_IDS.question(question.id)]}
              disabled={locked}
              onChange={(value) =>
                change((f) => ({
                  ...f,
                  questions: { ...f.questions, [question.id]: value },
                }))
              }
            />
          ))}
        </div>
      ) : null}

      <Section heading={W.nextStep.heading}>
        <ChoiceGroup
          id={GAP_IDS.nextStep}
          legend={W.nextStep.question}
          options={NEXT_STEP_OPTIONS}
          value={form.nextStep}
          onChange={(value) => change((f) => ({ ...f, nextStep: value }))}
          error={errors[GAP_IDS.nextStep]}
          disabled={locked}
        />
      </Section>

      <div className="flex flex-col gap-4">
        <p role="status" className={line ? "text-sm" : "sr-only"}>
          {line}
          {shownStatus === "closed" ? (
            <>
              {" "}
              <Link
                href={config.endedHref}
                className="underline underline-offset-4"
              >
                {W.closedLink}
              </Link>
            </>
          ) : null}
        </p>
        <div>
          <Button
            type="submit"
            className="h-11 px-4"
            disabled={shownStatus === "offline" || sending || closed}
          >
            {sending ? W.sending : editing ? W.sendChanges : W.send}
          </Button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </form>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      {children}
    </section>
  );
}

/** "3 answers are missing", linking to each, in page order; focused on a refused send. */
function Summary({
  gaps,
  summaryRef,
}: {
  gaps: readonly Gap[];
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      aria-labelledby="review-summary-heading"
      className="flex flex-col gap-3 rounded-md border border-destructive p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <h2
        id="review-summary-heading"
        className="font-semibold text-destructive"
      >
        {W.missing(gaps.length)}
      </h2>
      <ul className="flex flex-col gap-2">
        {gaps.map((gap) => (
          <li key={gap.id}>
            <a
              href={`#${gap.id}`}
              className="underline underline-offset-4"
              onClick={(event) => {
                event.preventDefault();
                focusField(gap.id);
              }}
            >
              {gap.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One of the config's extra questions: a scale or a choice among its options, or free text. */
function ConfigQuestionField({
  question,
  value,
  error,
  disabled,
  onChange,
}: {
  question: ConfigQuestion;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange(value: string): void;
}) {
  const id = GAP_IDS.question(question.id);
  if (question.kind !== "text")
    return (
      <ChoiceGroup
        id={id}
        legend={question.text}
        options={(question.options ?? []).map((option) => ({
          id: option,
          label: option,
        }))}
        value={value || null}
        onChange={onChange}
        error={error}
        disabled={disabled}
      />
    );
  return (
    <FieldSet id={id} tabIndex={-1} data-invalid={error ? true : undefined}>
      <FieldLegend id={`${id}-legend`}>{question.text}</FieldLegend>
      <Textarea
        id={`${id}-text`}
        aria-labelledby={`${id}-legend`}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </FieldSet>
  );
}
