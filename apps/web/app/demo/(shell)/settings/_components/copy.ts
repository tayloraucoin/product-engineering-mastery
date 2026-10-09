import type { DemoPrefs } from "../../../_lib/record";

type Sort = DemoPrefs["defaultSort"];
type ThemeChoice = "system" | "light" | "dark";

/** settings.md's Words, verbatim, in one table; nothing here is built in a component. */
export const SETTINGS_COPY = {
  subtitle: "Changes apply as you make them.",
  subtitleEmpty:
    "Nothing changed yet. These are the defaults, and changes apply as you make them.",
  display: "Display",
  records: "Records",
  demo: "Demo",
  theme: { label: "Theme", helper: "System follows your device." },
  themeOptions: [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ] satisfies { value: ThemeChoice; label: string }[],
  compact: { label: "Compact rows", helper: "Fits more records on screen." },
  sort: { legend: "Default sort" },
  sortOptions: [
    { value: "vendor-asc", label: "Vendor name, A to Z" },
    { value: "renews-asc", label: "Renewal date, soonest first" },
    { value: "value-desc", label: "Annual value, highest first" },
  ] satisfies { value: Sort; label: string }[],
  onboarding: {
    label: "Onboarding",
    helper: "See the three-step welcome again.",
    action: "Replay onboarding",
  },
  data: {
    label: "Demo data",
    helper: "Put back the 40 sample records and undo your edits.",
    action: "Reset demo data",
  },
  retry: "Retry",
  toasts: {
    sort: {
      title: "Default sort saved",
      body: {
        "vendor-asc": "Records now open sorted by vendor name.",
        "renews-asc": "Records now open sorted by renewal date.",
        "value-desc": "Records now open sorted by annual value.",
      } satisfies Record<Sort, string>,
    },
    theme: {
      title: "Theme saved",
      body: {
        system: "Following your device.",
        light: "Light is on.",
        dark: "Dark is on.",
      } satisfies Record<ThemeChoice, string>,
    },
    compact: {
      title: "Compact rows saved",
      on: "Rows are now compact.",
      off: "Rows are back to their usual height.",
    },
    reset: { title: "Demo data reset", body: "40 sample records are back." },
  },
  error: {
    title: "Default sort did not save",
    body: "It is back to Vendor name, A to Z.",
  },
  partial: {
    title: "Records settings did not load",
    body: "Display and Demo settings still work.",
  },
  offline: {
    title: "You are offline",
    body: "Settings show as last saved. Theme and Replay onboarding still work; other changes are off until you reconnect.",
  },
  reset: {
    title: "Reset demo data?",
    body: "All 40 sample records come back, and your edits and deletes are undone. Settings stay as they are.",
    confirm: "Reset data",
    pending: "Resetting…",
  },
} as const;
