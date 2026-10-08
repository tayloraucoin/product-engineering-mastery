/**
 * The threads' actions, bound to the request's world (LAB-25): `resolveViewer`,
 * the registry's `findExperiment`, and @pem/db/sandbox. The rules are in
 * threads.ts. A failure is logged as a fixed event: never a body, an id or a
 * query's error text (a failed insert's error carries its parameters).
 */

import "server-only";

import {
  deleteReply,
  listReplies,
  listThread,
  saveReply,
} from "@pem/db/sandbox";
import { createLogger } from "@pem/observability/logger";

import { findExperiment } from "../../app/experimental/_experiments/registry.ts";
import { resolveViewer, sandboxDb } from "./access.ts";
import {
  deleteReplyWith,
  listRepliesWith,
  listThreadWith,
  saveReplyWith,
  type ListRepliesResult,
  type ListThreadResult,
  type ReplyResult,
  type ThreadsDeps,
} from "./threads.ts";

const log = createLogger("sandbox");

const deps: ThreadsDeps = {
  resolveViewer,
  findExperiment,
  listThread: (viewer, input) => listThread(sandboxDb(), viewer, input),
  listTeamThread: (viewer, input) => listThread(sandboxDb(), viewer, input),
  listReplies: (viewer, input) => listReplies(sandboxDb(), viewer, input),
  listTeamReplies: (viewer, input) => listReplies(sandboxDb(), viewer, input),
  saveReply: (viewer, input) => saveReply(sandboxDb(), viewer, input),
  deleteReply: (viewer, input) => deleteReply(sandboxDb(), viewer, input),
};

export async function listThreadFor(slug: unknown): Promise<ListThreadResult> {
  const result = await listThreadWith(deps, slug);
  if (result.kind === "failed") log.warn("sandbox.thread_load_failed");
  return result;
}

export async function listRepliesFor(
  slug: unknown,
  input: unknown,
): Promise<ListRepliesResult> {
  const result = await listRepliesWith(deps, slug, input);
  if (result.kind === "failed") log.warn("sandbox.replies_load_failed");
  return result;
}

export async function saveReplyFor(
  slug: unknown,
  input: unknown,
): Promise<ReplyResult> {
  const result = await saveReplyWith(deps, slug, input);
  if (result.kind === "not-saved") log.warn("sandbox.reply_not_saved");
  return result;
}

export async function deleteReplyFor(
  slug: unknown,
  input: unknown,
): Promise<ReplyResult> {
  const result = await deleteReplyWith(deps, slug, input);
  if (result.kind === "not-saved") log.warn("sandbox.reply_not_deleted");
  return result;
}
