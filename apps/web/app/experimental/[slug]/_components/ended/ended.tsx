/**
 * "Review has ended" (ended.md), on the server: the gate's column and brand
 * mark, the heading, the sent or not-sent line, and the footer. What this
 * browser held is the leaf's (`EndedBrowser`); the sent date is formatted in
 * the client (`EndedSentLine`). There is no primary action, and nothing here
 * writes or requests anything.
 */

import Image from "next/image";

import { appIcon } from "@pem/brand/icon";

import { ENDED_WORDS, type EndedProps } from "../../../../../lib/sandbox/ended";
import { EndedBrowser } from "./ended-browser";
import { EndedSentLine } from "./ended-sent-line";

export function Ended({ sentAt, browser }: EndedProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-4 pt-16 pb-16 sm:px-6 sm:pt-24">
      <Image src={appIcon.src} alt="" width={24} height={24} />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ENDED_WORDS.heading}
        </h1>
        {sentAt ? (
          <EndedSentLine sentAt={sentAt} />
        ) : (
          <p className="text-muted-foreground">{ENDED_WORDS.notSent}</p>
        )}
        <EndedBrowser source={browser} />
      </div>
      <p className="text-sm">
        {ENDED_WORDS.footerLead}{" "}
        <a
          href={`mailto:${ENDED_WORDS.email}`}
          className="-my-3 inline-block py-3 underline underline-offset-4"
        >
          {ENDED_WORDS.email}
        </a>
      </p>
    </main>
  );
}
