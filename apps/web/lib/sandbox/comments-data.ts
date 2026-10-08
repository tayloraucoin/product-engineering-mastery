/**
 * The pins' actions, bound to the request's world (LAB-12): `resolveViewer`
 * and @pem/db/sandbox. The rules are in comments.ts. A failure is logged as
 * a fixed event: never a body, an anchor, an id or a query's error text (a
 * failed insert's error carries its parameters).
 */

import "server-only";

import { deleteComment, listMyComments, saveComment } from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import { resolveViewer, sandboxDb } from "./access.ts";
import {
  deleteCommentWith,
  listMyCommentsWith,
  saveCommentWith,
  type CommentResult,
  type CommentsDeps,
  type ListCommentsResult,
} from "./comments.ts";

const log = createLogger("sandbox");

const deps: CommentsDeps = {
  resolveViewer,
  listMyComments: (viewer) => listMyComments(sandboxDb(), viewer, {}),
  saveComment: (viewer, input) => saveComment(sandboxDb(), viewer, input),
  deleteComment: (viewer, input) => deleteComment(sandboxDb(), viewer, input),
};

export async function listCommentsFor(
  slug: unknown,
): Promise<ListCommentsResult> {
  const result = await listMyCommentsWith(deps, slug);
  if (result.kind === "failed") log.warn("sandbox.comments_load_failed");
  return result;
}

export async function saveCommentFor(
  slug: unknown,
  input: unknown,
): Promise<CommentResult> {
  const result = await saveCommentWith(deps, slug, input);
  if (result.kind === "not-saved") log.warn("sandbox.comment_not_saved");
  return result;
}

export async function deleteCommentFor(
  slug: unknown,
  input: unknown,
): Promise<CommentResult> {
  const result = await deleteCommentWith(deps, slug, input);
  if (result.kind === "not-saved") log.warn("sandbox.comment_not_deleted");
  return result;
}
