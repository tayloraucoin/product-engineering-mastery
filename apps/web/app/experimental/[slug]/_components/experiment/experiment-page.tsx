/**
 * The experiment page (experiment.md; S15, R9). Renders every design on the
 * server and hands them to the switcher, which mounts only the shown one.
 * Which design opens, the order and the primary come from
 * lib/sandbox/experiment/experiment.ts; the team is never counted (D-LAB-14).
 *
 * A team `?state=exp-*` key renders its fixture: the bar's data, the
 * primary, and for `exp-single` one design. A team pins.md key renders its
 * pins (LAB-12). Fixtures read and write nothing.
 */
import { randomInt } from "node:crypto";

import { createLogger } from "@pem/observability/logger";

import type { ExperimentConfig } from "../../../_experiments/registry";
import {
  designOption,
  experimentFixture,
  isExperimentStateKey,
} from "../../../../../lib/sandbox/client/experiment-view";
import {
  isListStateKey,
  listFixture,
} from "../../../../../lib/sandbox/client/pin-list";
import {
  heldPinsFixture,
  isPinsStateKey,
  pinsFixture,
} from "../../../../../lib/sandbox/client/pins-view";
import {
  drawFirstDesign,
  experimentDepsFor,
  openingDesignWith,
  type Opening,
  type OpeningRequest,
  type OpeningViewer,
} from "../../../../../lib/sandbox/experiment/experiment";
import { sandboxDb } from "../../../../../lib/sandbox/shared/access";
import type { PinsSource } from "../pins/pins-provider";
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

  // The team previews pins on a pins.md fixture, a pin-list.md one (the
  // list open on arrival), or LAB-11's bar fixture; a reviewer's pins load
  // in the browser after mount.
  const list =
    who.kind === "team" && isListStateKey(state) ? listFixture(state) : null;
  const pins: PinsSource =
    who.kind === "reviewer"
      ? { kind: "reviewer", reviewerId: who.viewer.reviewerId }
      : {
          kind: "preview",
          fixture: list
            ? list.pins
            : isPinsStateKey(state)
              ? pinsFixture(state)
              : state === "exp-closed" || state === "exp-revoked"
                ? heldPinsFixture()
                : null,
          bar: fixture?.bar ?? null,
          list,
        };

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
      pins={pins}
    />
  );
}

/**
 * A reviewer's opening reads and may claim. If the database fails, the page
 * still renders, uncounted, on a design drawn the same way, so an outage
 * never shows every reviewer the config's first design. Nothing is stored,
 * so a later visit draws again.
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
    const shown = drawFirstDesign(experiment.designs, randomInt);
    const ids = experiment.designs.map((d) => d.id);
    return {
      shown,
      order: [shown, ...ids.filter((id) => id !== shown)],
      primary: request.from === "review" ? "back" : "finish",
      counted: false,
    };
  }
}
