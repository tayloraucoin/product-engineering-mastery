/**
 * The closing review (LAB-17, review.md, D-LAB-2): its own page under the
 * experiment's address. `resolveViewer` decides who is asking first
 * (lib/sandbox/review.ts): a reviewer answers; the team is sent to the
 * experiment page (S18) unless a review `?state=` key renders its fixture;
 * anyone without live access, or on a closed experiment, is sent to the
 * experiment's address, which shows the gate or the ended page.
 *
 * The reviewer's comments and latest send load behind a static skeleton
 * (review-loading). The title is the gate's, fixed for every slug.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { appIcon } from "@pem/brand/icon";

import type { ExperimentConfig } from "../../_experiments/registry";
import { resolveViewer } from "../../../../lib/sandbox/access";
import { designOption } from "../../../../lib/sandbox/client/experiment-view";
import type { QueueEntry } from "../../../../lib/sandbox/client/queue";
import { REVIEW_CORE as W } from "../../../../lib/sandbox/client/review-core";
import { reviewFixture } from "../../../../lib/sandbox/client/review-view";
import { GATE_WORDS } from "../../../../lib/sandbox/gate";
import {
  experimentPath,
  reviewPageView,
  type ReviewPageView,
} from "../../../../lib/sandbox/review";
import { loadReviewFor } from "../../../../lib/sandbox/review-data";
import {
  readSandboxState,
  type SandboxViewerKind,
} from "../../../../lib/sandbox/state";
import {
  ReviewFormView,
  type ReviewPageConfig,
} from "./_components/review-form";
import { ReviewSkeleton } from "./_components/review-skeleton";

export const metadata: Metadata = { title: GATE_WORDS.title };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const result = await resolveViewer(slug);
  const viewerKind: SandboxViewerKind =
    result.kind === "team" || result.kind === "not-found"
      ? "team"
      : result.kind === "gate"
        ? "guest"
        : "reviewer";
  const view = reviewPageView(
    result,
    readSandboxState(query.state, viewerKind),
    slug,
  );

  switch (view.kind) {
    case "not-found":
      return notFound();
    case "redirect":
      return redirect(view.to);
    case "fixture": {
      const fixture = reviewFixture(view.key, view.experiment.designs[0]!.id);
      return (
        <ReviewShell experiment={view.experiment}>
          {fixture.loading ? (
            <ReviewSkeleton />
          ) : (
            <ReviewFormView
              key={view.key}
              config={pageConfig(view.experiment)}
              source={{ kind: "fixture", fixture }}
            />
          )}
        </ReviewShell>
      );
    }
    case "reviewer":
      return (
        <ReviewShell experiment={view.experiment}>
          <Suspense fallback={<ReviewSkeleton />}>
            <ReviewerForm viewer={view.viewer} experiment={view.experiment} />
          </Suspense>
        </ReviewShell>
      );
  }
}

/** The reviewer's own comments and latest send, read on the server, handed to the form. */
async function ReviewerForm({
  viewer,
  experiment,
}: {
  viewer: Extract<ReviewPageView, { kind: "reviewer" }>["viewer"];
  experiment: ExperimentConfig;
}) {
  const { comments, latest } = await loadReviewFor(viewer);
  return (
    <ReviewFormView
      config={pageConfig(experiment)}
      source={{
        kind: "reviewer",
        reviewerId: viewer.reviewerId,
        comments: comments.map((c) => ({
          id: c.id,
          number: c.number,
          design: c.design,
          kind: c.kind,
          body: c.body,
          anchor: c.anchor as QueueEntry["anchor"],
          viewportW: c.viewportW,
          viewportH: c.viewportH,
          clientCreatedAt: c.clientCreatedAt.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
        latest: latest
          ? {
              createdAt: latest.createdAt.toISOString(),
              answers: latest.answers,
              triage: latest.triage,
            }
          : null,
      }}
    />
  );
}

/** What the form needs from the config, as plain data: no design loaders cross to the browser. */
function pageConfig(experiment: ExperimentConfig): ReviewPageConfig {
  const designs = experiment.designs.map(designOption);
  const back = experimentPath(experiment.slug);
  return {
    slug: experiment.slug,
    goals: experiment.goals,
    targetedQuestion: experiment.targetedQuestion,
    questions: experiment.questions,
    designs,
    backHref: `${back}?from=review`,
    lookAgainHref:
      designs.length === 1
        ? `${back}?design=${encodeURIComponent(designs[0]!.id)}&from=review`
        : null,
    endedHref: back,
  };
}

function ReviewShell({
  experiment,
  children,
}: {
  experiment: ExperimentConfig;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-prose flex-col gap-8 px-4 pt-16 pb-24 sm:px-6 sm:pt-24">
      <div className="flex items-center justify-between gap-4">
        <Image src={appIcon.src} alt="" width={24} height={24} />
        <Link
          href={`${experimentPath(experiment.slug)}?from=review`}
          className="-my-3 inline-block py-3 text-sm underline underline-offset-4"
        >
          {W.back}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {experiment.title}
      </h1>
      {children}
    </main>
  );
}
