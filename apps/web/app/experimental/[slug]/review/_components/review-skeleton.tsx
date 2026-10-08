/**
 * review-loading: the sections' shape, static (review.md), while the
 * reviewer's comments and latest send load. Never a spinner (A-18), never a
 * pulse (A-14). With several designs, "Each design" and "Your choice"
 * stand where they will (LAB-18).
 */
import { Skeleton } from "@pem/ui/skeleton";

import { REVIEW_CORE as W } from "../../../../../lib/sandbox/client/review-core";
import { VARIANTS_WORDS as V } from "../../../../../lib/sandbox/client/review-variants-form";

const SECTIONS = [
  W.overall.heading,
  W.comments.heading,
  W.blockers.heading,
  W.gaps.heading,
  W.nextStep.heading,
];

const VARIANTS_SECTIONS = [
  V.eachHeading,
  W.comments.heading,
  V.choiceHeading,
  W.blockers.heading,
  W.gaps.heading,
  W.nextStep.heading,
];

export function ReviewSkeleton({ several = false }: { several?: boolean }) {
  return (
    <div className="flex flex-col gap-12" aria-busy="true">
      <Skeleton className="h-5 w-3/4 animate-none" />
      {(several ? VARIANTS_SECTIONS : SECTIONS).map((heading) => (
        <section key={heading} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
          <Skeleton className="h-5 w-2/3 animate-none" />
          <Skeleton className="h-5 w-1/2 animate-none" />
          <Skeleton className="h-5 w-1/2 animate-none" />
        </section>
      ))}
      <Skeleton className="h-11 w-32 animate-none" />
    </div>
  );
}
