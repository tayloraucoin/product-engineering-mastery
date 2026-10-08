/**
 * The one gate (gate.md), for every slug: heading, lead, the notice, the
 * form, the team link. Its props are the path, a prefilled email, the
 * signed-in account's email and the state, and nothing read from the
 * registry, so a real and an unknown slug render the same (S12b).
 */

import Image from "next/image";

import { appIcon } from "@pem/brand/icon";

import {
  GATE_WORDS,
  gateFormView,
  slugOfGatePath,
  type GateProps,
} from "../../../../../lib/sandbox/gate/gate";
import {
  enterGate,
  holdGateFixture,
  holdSignOutFixture,
  signOutHere,
} from "../../actions";
import { GateForm } from "./gate-form";
import { GateNotice } from "./gate-notice";

export function Gate(props: GateProps) {
  const slug = slugOfGatePath(props.path);
  const signedIn = props.accountEmail !== null;
  const fixture = props.state !== null;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-4 pt-16 pb-16 sm:px-6 sm:pt-24">
      <Image src={appIcon.src} alt="" width={24} height={24} />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {GATE_WORDS.heading}
        </h1>
        <p className="text-muted-foreground">
          {signedIn ? GATE_WORDS.leadSignedIn : GATE_WORDS.lead}
        </p>
      </div>
      <GateNotice signedIn={signedIn} />
      <GateForm
        key={props.state ?? "live"}
        // A ?state= fixture is bound to actions that change nothing, so even
        // a press before hydration spends no try and ends no session.
        action={fixture ? holdGateFixture : enterGate.bind(null, slug)}
        signOut={(fixture ? holdSignOutFixture : signOutHere).bind(null, slug)}
        accountEmail={props.accountEmail}
        initial={gateFormView(props)}
        focusCode={props.prefilledEmail !== null}
      />
      {signedIn ? null : (
        <p className="text-sm">
          <a
            href={`/auth/sign-in?next=${encodeURIComponent(props.path)}`}
            className="-my-3 inline-block py-3 underline underline-offset-4"
          >
            {GATE_WORDS.teamLink}
          </a>
        </p>
      )}
    </main>
  );
}
