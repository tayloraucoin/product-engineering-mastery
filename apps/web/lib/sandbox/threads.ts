/**
 * The threads' server logic (LAB-25, threads.md, beat 2), pure behind a deps
 * seam, as comments.ts: each action validates, calls `resolveViewer`, makes
 * one call, and returns a fixed result that never echoes input.
 * `threads-data.ts` binds the seam to @pem/db/sandbox.
 *
 * - The mode is the registry's, read by `findExperiment(viewer.slug)` (the
 *   route's slug for the team), never from the request: no input carries a
 *   mode, and a private config reaches the database as private.
 * - A reviewer on an open experiment is served; closed with live access is
 *   `closed`; access that no longer passes is `revoked`. The team is served
 *   open or closed (team replies after close, as D-LAB-15 lets it add notes)
 *   and names the slug to the database; a reviewer never does.
 * - Malformed input, an unknown slug, a refused reply and any thrown error
 *   are `not-saved` (or `failed` for a read); the browser keeps a reply
 *   queued.
 */

import type {
  ReviewerAuthor,
  ReviewerViewer,
  ReviewMode,
  SaveReplyInput,
  SaveReplyOutcome,
  TeamAuthor,
  TeamViewer,
  ThreadReply,
  ThreadRoot,
} from "@pem/db/sandbox";

import type { ExperimentConfig } from "../../app/experimental/_experiments/registry.ts";
import type { ViewerResult } from "./access-check.ts";
import type { SendResult } from "./client/queue.ts";
import { commentIdInput, replyInput, replyRootInput } from "./validators.ts";

/** A reply as the browser reads it: its time as an ISO string. */
export type ClientReply<A> = Omit<ThreadReply<A>, "createdAt"> & {
  createdAt: string;
};

/** A thread as the browser reads it: a comment with its time as an ISO string, or a removed root. */
export type ClientThreadRoot<A> =
  | (Omit<Extract<ThreadRoot<A>, { body: string }>, "createdAt" | "replies"> & {
      createdAt: string;
      replies: ClientReply<A>[];
    })
  | (Omit<Extract<ThreadRoot<A>, { removed: true }>, "replies"> & {
      replies: ClientReply<A>[];
    });

export type ListThreadResult =
  | {
      kind: "ok";
      face: "reviewer";
      threads: ClientThreadRoot<ReviewerAuthor>[];
    }
  | { kind: "ok"; face: "team"; threads: ClientThreadRoot<TeamAuthor>[] }
  | { kind: "closed" }
  | { kind: "revoked" }
  | { kind: "failed" };

export type ListRepliesResult =
  | { kind: "ok"; face: "reviewer"; replies: ClientReply<ReviewerAuthor>[] }
  | { kind: "ok"; face: "team"; replies: ClientReply<TeamAuthor>[] }
  | { kind: "closed" }
  | { kind: "revoked" }
  | { kind: "failed" };

export type ReplyResult = { kind: SendResult };

type ThreadInput = { mode: ReviewMode; slug?: string };

export type ThreadsDeps = {
  resolveViewer(slug: string): Promise<ViewerResult>;
  findExperiment(slug: string): ExperimentConfig | null;
  listThread(
    viewer: ReviewerViewer,
    input: ThreadInput,
  ): Promise<ThreadRoot<ReviewerAuthor>[]>;
  listTeamThread(
    viewer: TeamViewer,
    input: ThreadInput,
  ): Promise<ThreadRoot<TeamAuthor>[]>;
  listReplies(
    viewer: ReviewerViewer,
    input: ThreadInput & { rootId: string },
  ): Promise<ThreadReply<ReviewerAuthor>[]>;
  listTeamReplies(
    viewer: TeamViewer,
    input: ThreadInput & { rootId: string },
  ): Promise<ThreadReply<TeamAuthor>[]>;
  saveReply(
    viewer: ReviewerViewer | TeamViewer,
    input: SaveReplyInput,
  ): Promise<SaveReplyOutcome>;
  deleteReply(
    viewer: ReviewerViewer | TeamViewer,
    input: { id: string },
  ): Promise<void>;
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length <= 48 && SLUG.test(slug);
}

type Served =
  | { kind: "reviewer"; viewer: ReviewerViewer; input: ThreadInput }
  | { kind: "team"; viewer: TeamViewer; input: ThreadInput }
  | { kind: "closed" }
  | { kind: "revoked" }
  | { kind: "not-saved" };

/** Who is asking, and the mode the registry gives their slug. */
async function serve(deps: ThreadsDeps, slug: string): Promise<Served> {
  const result = await deps.resolveViewer(slug);
  switch (result.kind) {
    case "reviewer": {
      const mode = deps.findExperiment(result.viewer.slug)?.mode;
      if (!mode) return { kind: "not-saved" };
      return { kind: "reviewer", viewer: result.viewer, input: { mode } };
    }
    case "team": {
      const mode = deps.findExperiment(slug)?.mode;
      if (!mode) return { kind: "not-saved" };
      return { kind: "team", viewer: result.viewer, input: { mode, slug } };
    }
    case "ended":
      return { kind: "closed" };
    case "gate":
      return { kind: "revoked" };
    default:
      return { kind: "not-saved" };
  }
}

function wireReply<A>(reply: ThreadReply<A>): ClientReply<A> {
  return { ...reply, createdAt: reply.createdAt.toISOString() };
}

function wireRoot<A>(root: ThreadRoot<A>): ClientThreadRoot<A> {
  const replies = root.replies.map(wireReply);
  if ("removed" in root) return { ...root, replies };
  return { ...root, createdAt: root.createdAt.toISOString(), replies };
}

/** Every thread the viewer may read on this slug, loaded with the page. */
export async function listThreadWith(
  deps: ThreadsDeps,
  slug: unknown,
): Promise<ListThreadResult> {
  if (!validSlug(slug)) return { kind: "failed" };
  try {
    const served = await serve(deps, slug);
    if (served.kind === "closed" || served.kind === "revoked")
      return { kind: served.kind };
    if (served.kind === "reviewer") {
      const roots = await deps.listThread(served.viewer, served.input);
      return { kind: "ok", face: "reviewer", threads: roots.map(wireRoot) };
    }
    if (served.kind === "team") {
      const roots = await deps.listTeamThread(served.viewer, served.input);
      return { kind: "ok", face: "team", threads: roots.map(wireRoot) };
    }
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

/** The replies under one root, loaded again when its pin opens. */
export async function listRepliesWith(
  deps: ThreadsDeps,
  slug: unknown,
  input: unknown,
): Promise<ListRepliesResult> {
  const parsed = replyRootInput.safeParse(input);
  if (!validSlug(slug) || !parsed.success) return { kind: "failed" };
  try {
    const served = await serve(deps, slug);
    if (served.kind === "closed" || served.kind === "revoked")
      return { kind: served.kind };
    const rootId = parsed.data.rootId;
    if (served.kind === "reviewer") {
      const replies = await deps.listReplies(served.viewer, {
        ...served.input,
        rootId,
      });
      return { kind: "ok", face: "reviewer", replies: replies.map(wireReply) };
    }
    if (served.kind === "team") {
      const replies = await deps.listTeamReplies(served.viewer, {
        ...served.input,
        rootId,
      });
      return { kind: "ok", face: "team", replies: replies.map(wireReply) };
    }
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

/** One reply, new, edited or restored by Undo, under its browser-minted id. */
export async function saveReplyWith(
  deps: ThreadsDeps,
  slug: unknown,
  input: unknown,
): Promise<ReplyResult> {
  const parsed = replyInput.safeParse(input);
  if (!validSlug(slug) || !parsed.success) return { kind: "not-saved" };
  try {
    const served = await serve(deps, slug);
    if (served.kind !== "reviewer" && served.kind !== "team")
      return { kind: served.kind };
    const outcome = await deps.saveReply(served.viewer, {
      ...parsed.data,
      ...served.input,
      clientCreatedAt: new Date(parsed.data.clientCreatedAt),
    });
    return { kind: outcome };
  } catch {
    return { kind: "not-saved" };
  }
}

/** Deletes the viewer's own reply; sent, never queued. */
export async function deleteReplyWith(
  deps: ThreadsDeps,
  slug: unknown,
  input: unknown,
): Promise<ReplyResult> {
  const parsed = commentIdInput.safeParse(input);
  if (!validSlug(slug) || !parsed.success) return { kind: "not-saved" };
  try {
    const served = await serve(deps, slug);
    if (served.kind !== "reviewer" && served.kind !== "team")
      return { kind: served.kind };
    await deps.deleteReply(served.viewer, { id: parsed.data.id });
    return { kind: "ok" };
  } catch {
    return { kind: "not-saved" };
  }
}
