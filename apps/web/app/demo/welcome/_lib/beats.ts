/**
 * What each onboarding key shows and where its controls go (onboarding.md
 * States and Words). The words are the UX file's, verbatim.
 */

export type OnboardingKey =
  | "beat-1"
  | "beat-2"
  | "beat-3"
  | "empty"
  | "loading"
  | "error"
  | "partial"
  | "offline";

export type BeatSlot = "rows" | "diff" | "dialog" | "empty" | "skeleton";

export type BeatPrimary =
  | { label: string; kind: "beat"; to: OnboardingKey }
  | {
      label: string;
      kind: "leave";
      href: "/demo/records" | "/demo/records/new";
    };

export interface Beat {
  /** "Step n of 3" and the progress fill; null hides both. */
  step: 1 | 2 | 3 | null;
  /** Null while loading: the title and body are skeletons. */
  title: string | null;
  body: string | null;
  slot: BeatSlot | null;
  primary: BeatPrimary;
  back: OnboardingKey | null;
  skip: boolean;
  offline: boolean;
  loading: boolean;
}

const BEAT_1 = {
  title: "Every record is a vendor contract",
  body: "Each one has an owner, a status, an annual value, a renewal date and the terms you agreed. All of it is sample data.",
};
const BEAT_2 = {
  title: "Find one, read what changed",
  body: "Sort and filter the table, open a record, and compare its terms with the version before.",
};
const GO_TO_RECORDS: BeatPrimary = {
  label: "Go to records",
  kind: "leave",
  href: "/demo/records",
};
const NEXT = (to: OnboardingKey): BeatPrimary => ({
  label: "Next",
  kind: "beat",
  to,
});

const BASE = { offline: false, loading: false } as const;

export const BEATS: Readonly<Record<OnboardingKey, Beat>> = {
  "beat-1": {
    ...BASE,
    ...BEAT_1,
    step: 1,
    slot: "rows",
    primary: NEXT("beat-2"),
    back: null,
    skip: true,
  },
  "beat-2": {
    ...BASE,
    ...BEAT_2,
    step: 2,
    slot: "diff",
    primary: NEXT("beat-3"),
    back: "beat-1",
    skip: true,
  },
  "beat-3": {
    ...BASE,
    title: "Change it safely",
    body: "Edit a record and each save keeps a version. Delete asks first, and demo data comes back when you reload.",
    step: 3,
    slot: "dialog",
    primary: GO_TO_RECORDS,
    back: "beat-2",
    skip: false,
  },
  empty: {
    ...BASE,
    title: "Your table is empty",
    body: "Add your first vendor contract to see the rest of the demo: reading, comparing and deleting.",
    step: 3,
    slot: "empty",
    primary: { label: "New record", kind: "leave", href: "/demo/records/new" },
    back: "beat-2",
    skip: false,
  },
  loading: {
    ...BASE,
    title: null,
    body: null,
    step: 1,
    slot: "skeleton",
    primary: NEXT("beat-2"),
    back: null,
    skip: true,
    loading: true,
  },
  error: {
    ...BASE,
    title: "The welcome did not load",
    body: "You can go straight to records. Replay this any time from Settings.",
    step: null,
    slot: null,
    primary: GO_TO_RECORDS,
    back: null,
    skip: false,
  },
  partial: {
    ...BASE,
    ...BEAT_2,
    step: 2,
    slot: null,
    primary: NEXT("beat-3"),
    back: "beat-1",
    skip: true,
  },
  offline: {
    ...BASE,
    ...BEAT_1,
    step: 1,
    slot: "rows",
    primary: NEXT("beat-2"),
    back: null,
    skip: true,
    offline: true,
  },
};

export const OFFLINE_NOTE =
  "You are offline. These steps still work; records may not load until you reconnect.";
