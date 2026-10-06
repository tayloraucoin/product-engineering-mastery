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
  SandboxAccessError,
  type ReviewerViewer,
  type SandboxDb,
  type TeamViewer,
  type Viewer,
} from "./viewer.ts";
