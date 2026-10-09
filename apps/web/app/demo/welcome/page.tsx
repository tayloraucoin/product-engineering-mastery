import { readDemoState } from "../../../lib/demo/states";
import { BeatIllustration } from "./_components/beat-illustration";
import { OnboardingView } from "./_components/onboarding-view";
import { BEATS, type OnboardingKey } from "./_lib/beats";

/** Three beats, then the records (onboarding.md). No key, or an unknown one, is beat 1. */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const key = (readDemoState((await searchParams).state, "onboarding") ??
    "beat-1") as OnboardingKey;
  const slot = BEATS[key].slot;
  return (
    <OnboardingView
      stateKey={key}
      illustration={slot ? <BeatIllustration slot={slot} /> : null}
    />
  );
}
