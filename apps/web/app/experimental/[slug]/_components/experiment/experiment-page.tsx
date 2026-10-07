/**
 * The experiment page (experiment.md; S15, R9). Renders every design on the
 * server and hands them to the switcher, which mounts only the shown one.
 * Which design opens, the order and the primary come from
 * lib/sandbox/experiment.ts; the team is never counted (D-LAB-14).
 *
 * A team `?state=exp-*` key renders its fixture: the bar's data, the
 * primary, and for `exp-single` one design. Fixtures read and write nothing.
 */
import { createLogger } from "@pem/observability/logger";

import type { ExperimentConfig } from "../../../_experiments/registry";
import { sandboxDb } from "../../../../../lib/sandbox/access";
import {
  BAR_AT_REST,
  designOption,
  experimentFixture,
  isExperimentStateKey,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  experimentDepsFor,
  openingDesignWith,
  type Opening,
  type OpeningRequest,
  type OpeningViewer,
} from "../../../../../lib/sandbox/experiment";
import { ExperimentSwitcher } from "./experiment-switcher";

const log = createLogger("sandbox");

export type ExperimentProps = {
  experiment: ExperimentConfig;
  who: OpeningViewer;
  request: OpeningRequest;
  /** A team `?state=` key, or null. */
  state: string | null;
};

export async function Experiment({
  experiment,
  who,
  request,
  state,
}: ExperimentProps) {
  const fixture =
    who.kind === "team" && isExperimentStateKey(state)
      ? experimentFixture(state)
      : null;

  const opening = await openingFor(experiment, who, request);
  const order = fixture?.single ? opening.order.slice(0, 1) : opening.order;

  const designs = await Promise.all(
    order.map(async (id) => {
      const config = experiment.designs.find((d) => d.id === id)!;
      const Design = await config.component();
      return { ...designOption(config), element: <Design /> };
    }),
  );

  return (
    <ExperimentSwitcher
      slug={experiment.slug}
      designs={designs}
      initialShown={
        order.includes(opening.shown) ? opening.shown : designs[0]!.id
      }
      primary={fixture?.primary ?? opening.primary}
      counted={opening.counted}
      bar={fixture?.bar ?? BAR_AT_REST}
      commentsOn={null}
    />
  );
}

/**
 * A reviewer's opening reads and may claim. If the database fails, the page
 * still renders, on the config's first design, and logs nothing, so no view
 * is recorded against a design the reviewer was never stored as seeing first.
 * [ASSUMPTION: rendering uncounted beats an error page for a reviewer.]
 */
async function openingFor(
  experiment: ExperimentConfig,
  who: ExperimentProps["who"],
  request: OpeningRequest,
): Promise<Opening> {
  try {
    return await openingDesignWith(
      experimentDepsFor(sandboxDb),
      who,
      experiment,
      request,
    );
  } catch (error) {
    log.warn("sandbox.opening_failed", { error });
    const ids = experiment.designs.map((d) => d.id);
    return { shown: ids[0]!, order: ids, primary: "finish", counted: false };
  }
}
