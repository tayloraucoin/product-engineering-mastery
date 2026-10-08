/**
 * An experiment's one address (door 3, R1). `resolveViewer` decides who is
 * asking before anything else; without access the Gate renders here, in
 * place, with status 200, the same for every slug. The team on an unknown
 * slug gets the app's 404. The title is fixed for every slug.
 *
 * The experiment is LAB-11's (`_components/experiment/`). A live access on a
 * closed experiment gets the ended page (LAB-21, `_components/ended/`), and
 * the team reaches it only through its `?state=` fixtures.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  readLinkEmail,
  resolveViewer,
  sandboxDb,
} from "../../../lib/sandbox/access";
import { endedPageFor } from "../../../lib/sandbox/ended-data";
import {
  GATE_WORDS,
  gatePath,
  gateView,
  isGateStateKey,
} from "../../../lib/sandbox/gate";
import {
  readSandboxState,
  type SandboxViewerKind,
} from "../../../lib/sandbox/state";
import { teamMemberOf } from "../../../lib/sandbox/team";
import { getAuthContext } from "../../../lib/supabase/context";
import { Ended } from "./_components/ended/ended";
import { Experiment } from "./_components/experiment/experiment-page";
import { Gate } from "./_components/gate/gate";

export const metadata: Metadata = { title: GATE_WORDS.title };

export default async function ExperimentPage({
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
  const stateKey = readSandboxState(query.state, viewerKind);
  const state = isGateStateKey(stateKey) ? stateKey : null;

  let accountEmail: string | null = null;
  let prefilledEmail: string | null = null;
  if (result.kind === "gate" && state === null) {
    const auth = await getAuthContext();
    if (auth && !teamMemberOf(auth) && auth.email) accountEmail = auth.email;
    // The link prefills the email on the guest face only, and never grants
    // access. A token that cannot be read, even for want of a database, is
    // ignored: the gate shows blank.
    else if (typeof query.r === "string") {
      const token = query.r;
      prefilledEmail = await Promise.resolve()
        .then(() => readLinkEmail(sandboxDb(), slug, token))
        .catch(() => null);
    }
  }

  const view = gateView(result, {
    path: gatePath(slug),
    prefilledEmail,
    accountEmail,
    state,
  });

  switch (view.kind) {
    case "not-found":
      return notFound();
    case "gate":
      return <Gate {...view.props} />;
    case "ended":
    case "experiment": {
      const ended = await endedPageFor(result, stateKey);
      if (ended) return <Ended {...ended} />;
      if (result.kind !== "team" && result.kind !== "reviewer")
        return notFound();
      return (
        <Experiment
          experiment={result.experiment}
          who={
            result.kind === "team"
              ? { kind: "team" }
              : { kind: "reviewer", viewer: result.viewer }
          }
          request={{ design: query.design, from: query.from }}
          state={stateKey}
        />
      );
    }
  }
}
