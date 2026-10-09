import { GATE_WORDS } from "../../../../../lib/sandbox/gate/gate";

/**
 * "What we keep" (door 8): the notice's four points as plain text, before the
 * email field in DOM order, never behind a link. The signed-in face names the
 * account's email in the first point; the rest is unchanged.
 */
export function GateNotice({ signedIn }: { signedIn: boolean }) {
  const [first, ...rest] = GATE_WORDS.notice;
  return (
    <section aria-labelledby="gate-notice" className="flex flex-col gap-2">
      <h2 id="gate-notice" className="text-base font-medium">
        {GATE_WORDS.noticeHeading}
      </h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>{signedIn ? GATE_WORDS.noticeSignedInFirst : first}</p>
        {rest.map((point) => (
          <p key={point}>{point}</p>
        ))}
      </div>
    </section>
  );
}
