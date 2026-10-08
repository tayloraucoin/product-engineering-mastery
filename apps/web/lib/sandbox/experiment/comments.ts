/**
 * The pins' server logic (LAB-12, pins.md, S17, D-LAB-43), pure behind a
 * deps seam, as experiment.ts: each action validates, calls `resolveViewer`,
 * makes one call, and returns a fixed result that never echoes input.
 * `comments-data.ts` binds the seam to @pem/db/sandbox.
 *
 * - A reviewer on an open experiment is served. Closed with live access
 *   (`ended`) is `closed`; access that no longer passes (`gate`) is
 *   `revoked`, which holds the browser's queue untouched for LAB-21.
 * - The team and an unknown slug get `not-saved`: team notes are LAB-14's.
 * - A pin's design is checked against the experiment's config.
 * - An id held by someone else (`taken`), malformed input, and any thrown
 *   error are `not-saved`; the browser keeps the pin queued.
 */

import type {
  MyComment,
  ReviewerViewer,
  SaveCommentInput,
  SaveCommentOutcome,
} from "@pem/db/sandbox";

import type { QueueEntry, SendResult } from "../client/queue.ts";
import type { ViewerResult } from "../shared/access-check.ts";
import { isSandboxSlug } from "../shared/slug.ts";
import { commentIdInput, pinInput } from "../shared/validators.ts";

export type CommentResult = { kind: SendResult };

export type ListCommentsResult =
  | { kind: "ok"; comments: (QueueEntry & { createdAt: string })[] }
  | { kind: "closed" }
  | { kind: "revoked" }
  | { kind: "failed" };

export type CommentsDeps = {
  resolveViewer(slug: string): Promise<ViewerResult>;
  listMyComments(viewer: ReviewerViewer): Promise<MyComment[]>;
  saveComment(
    viewer: ReviewerViewer,
    input: SaveCommentInput,
  ): Promise<SaveCommentOutcome>;
  deleteComment(viewer: ReviewerViewer, input: { id: string }): Promise<void>;
};

type Served =
  | { kind: "reviewer"; result: Extract<ViewerResult, { kind: "reviewer" }> }
  | { kind: "closed" }
  | { kind: "revoked" }
  | { kind: "not-saved" };

async function serve(deps: CommentsDeps, slug: string): Promise<Served> {
  const result = await deps.resolveViewer(slug);
  switch (result.kind) {
    case "reviewer":
      return { kind: "reviewer", result };
    case "ended":
      return { kind: "closed" };
    case "gate":
      return { kind: "revoked" };
    default:
      return { kind: "not-saved" };
  }
}

/** The reviewer's own pins on this slug, loaded after mount (`exp-loading`). */
export async function listMyCommentsWith(
  deps: CommentsDeps,
  slug: unknown,
): Promise<ListCommentsResult> {
  if (!isSandboxSlug(slug)) return { kind: "failed" };
  try {
    const served = await serve(deps, slug);
    if (served.kind === "closed" || served.kind === "revoked")
      return { kind: served.kind };
    if (served.kind !== "reviewer") return { kind: "failed" };
    const rows = await deps.listMyComments(served.result.viewer);
    return {
      kind: "ok",
      comments: rows.map((row) => ({
        id: row.id,
        number: row.number,
        design: row.design,
        kind: row.kind,
        body: row.body,
        anchor: row.anchor as QueueEntry["anchor"],
        viewportW: row.viewportW,
        viewportH: row.viewportH,
        clientCreatedAt: row.clientCreatedAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      })),
    };
  } catch {
    return { kind: "failed" };
  }
}

/** One pin, new, edited or restored by Undo, under its browser-minted id. */
export async function saveCommentWith(
  deps: CommentsDeps,
  slug: unknown,
  input: unknown,
): Promise<CommentResult> {
  const parsed = pinInput.safeParse(input);
  if (!isSandboxSlug(slug) || !parsed.success) return { kind: "not-saved" };
  try {
    const served = await serve(deps, slug);
    if (served.kind !== "reviewer") return { kind: served.kind };
    const pin = parsed.data;
    if (!served.result.experiment.designs.some((d) => d.id === pin.design))
      return { kind: "not-saved" };
    const outcome = await deps.saveComment(served.result.viewer, {
      ...pin,
      anchor: pin.anchor as SaveCommentInput["anchor"],
      clientCreatedAt: new Date(pin.clientCreatedAt),
    });
    return {
      kind:
        outcome === "saved"
          ? "ok"
          : outcome === "limit"
            ? "limit"
            : "not-saved",
    };
  } catch {
    return { kind: "not-saved" };
  }
}

/** Deletes the reviewer's own pin; sent, never queued. */
export async function deleteCommentWith(
  deps: CommentsDeps,
  slug: unknown,
  input: unknown,
): Promise<CommentResult> {
  const parsed = commentIdInput.safeParse(input);
  if (!isSandboxSlug(slug) || !parsed.success) return { kind: "not-saved" };
  try {
    const served = await serve(deps, slug);
    if (served.kind !== "reviewer") return { kind: served.kind };
    await deps.deleteComment(served.result.viewer, { id: parsed.data.id });
    return { kind: "ok" };
  } catch {
    return { kind: "not-saved" };
  }
}
