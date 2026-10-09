import { Badge } from "@pem/ui/badge";

import type { Status } from "../_lib/record";

const LABELS: Record<Status, string> = {
  active: "Active",
  expiring: "Expiring",
  draft: "Draft",
  terminated: "Terminated",
};

const VARIANTS = {
  active: "secondary",
  expiring: "outline",
  draft: "outline",
  terminated: "destructive",
} as const;

/** The shape carries the status next to the word, so colour is never the only signal. */
function Shape({ status }: { status: Status }) {
  const common = {
    viewBox: "0 0 12 12",
    "aria-hidden": true,
    focusable: false,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  } as const;
  switch (status) {
    case "active":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "expiring":
      return (
        <svg {...common} strokeLinejoin="round">
          <path d="M6 1.75 11 10.25H1Z" />
        </svg>
      );
    case "draft":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4" strokeDasharray="2 1.6" />
        </svg>
      );
    case "terminated":
      return (
        <svg {...common} strokeLinecap="round">
          <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" />
        </svg>
      );
  }
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant={VARIANTS[status]} data-status={status}>
      <Shape status={status} />
      {LABELS[status]}
    </Badge>
  );
}
