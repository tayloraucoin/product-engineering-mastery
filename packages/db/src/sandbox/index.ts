/**
 * `@pem/db/sandbox`: the experimental sandbox's data access (D-LAB-34). Only
 * apps/web/lib/sandbox may import it (the `web-sandbox` boundary). It takes
 * `db` as an argument, never the singleton, and imports neither next nor
 * react. Each runtime export has its cases in the isolation suite
 * (test/sandbox/isolation.test.ts); an export with none fails it.
 */

export {
  findLiveReviewerByCodeHash,
  createAccess,
  checkAccess,
  findAccessEmail,
  readGateLock,
  recordGateFailure,
  clearGateKey,
  type CreateAccessInput,
} from "./gate.ts";
export {
  recordAction,
  ROLE_CHANGE_ACTION,
  type RecordActionInput,
} from "./actions.ts";
export { withRoleChangeLock, type RoleChangeTx } from "./roles.ts";
export { listExperimentStats, type ExperimentStats } from "./experiments.ts";
export {
  CODE_ACTIONS,
  listCodes,
  makeCode,
  replaceCode,
  revokeCode,
  type CodeRow,
} from "./codes.ts";
export {
  ACTIONS_PAGE_SIZE,
  countExperimentData,
  deleteExperimentData,
  ERASED_LABEL,
  ERASURE_ACTIONS,
  eraseEmail,
  findErasure,
  findReviewerEmails,
  listActions,
  type ActionRow,
  type ActionsPage,
  type ErasureCounts,
  type ErasureFound,
  type ExperimentDataCounts,
  type ExperimentDataCountsRead,
  type HeldCounts,
  type NameLabel,
  type ReviewerEmails,
} from "./erasure.ts";
export {
  deleteComment,
  listMyComments,
  saveComment,
  type CommentAnchor,
  type MyComment,
  type SaveCommentInput,
  type SaveCommentOutcome,
} from "./comments.ts";
export {
  deleteReply,
  listReplies,
  listThread,
  saveReply,
  type ListRepliesInput,
  type ListThreadInput,
  type RemovedComment,
  type ReviewerAuthor,
  type SaveReplyInput,
  type SaveReplyOutcome,
  type TeamAuthor,
  type ThreadComment,
  type ThreadReply,
  type ThreadRoot,
} from "./threads.ts";
export {
  latestSentAt,
  readMyLatestVersion,
  saveReviewVersion,
  type MyReviewVersion,
  type SaveReviewVersionInput,
} from "./review.ts";
export {
  claimFirstDesign,
  readReviewerDesigns,
  recordViewEvent,
  type ReviewerDesigns,
} from "./experiment.ts";
export {
  SandboxAccessError,
  type ReviewerViewer,
  type ReviewMode,
  type SandboxDb,
  type TeamViewer,
  type Viewer,
} from "./viewer.ts";
