/**
 * Sending (D-STK-12). `resend` is imported here and nowhere else (D-STK-16).
 * The app's env.ts hands in the tier, the key and the optional sending
 * address; the sender's name and the reply-to address come from @pem/brand.
 *
 * The local tier never sends: it logs the rendered message and returns
 * `logged`, so a developer reads the mail in the terminal and no real inbox is
 * reached. A deployment left on the local tier logs neither the body nor the
 * subject, since reset and sign-in links live there and platform logs are
 * retained; it warns and returns `withheld`. Staging and production send
 * through Resend and need the key.
 *
 * Two kinds of message: `content` renders the default template here
 * (`default-template.ts`); `template` names a template kept in the Resend
 * dashboard, by an id the app's env.ts reads, and Resend renders it.
 */

import { Resend, type CreateEmailOptions } from "resend";

import { brand } from "@pem/brand/brand";
import type { Tier } from "@pem/env/tier";
import { createLogger, type Logger } from "@pem/observability/logger";

import { renderDefaultEmail, type DefaultEmail } from "./default-template.ts";

export type MailerConfig = {
  /** `DATABASE_ENVIRONMENT`: the tier this process talks to. */
  tier: Tier;
  /** `RESEND_API_KEY` for the tier; unused on local. */
  apiKey?: string;
  /** `EMAIL_FROM`: an address on a domain verified in Resend; `brand.contact.email` when unset. */
  fromAddress?: string;
  /**
   * Whether this process may be serving real users: a deployment or a
   * production build (`productionRuntime` in apps/web/env.ts), never set by hand.
   */
  deployed: boolean;
};

/** A Resend dashboard template: its id from env.ts, and the values for its variables. */
export type DashboardTemplate = {
  id: string;
  variables?: Record<string, string | number>;
};

export type EmailMessage = { to: string | readonly string[] } & (
  | { content: DefaultEmail; template?: never }
  | { template: DashboardTemplate; content?: never }
);

export type SendResult =
  | { status: "sent"; id: string }
  | { status: "logged" }
  | { status: "withheld" };

/** The one vendor call, injectable so a test can prove when it is made. */
export type SendEmail = (options: CreateEmailOptions) => Promise<{
  data: { id: string } | null;
  error: { message: string } | null;
}>;

export type Mailer = { send(message: EmailMessage): Promise<SendResult> };

/** `"Name <address>"`, the form Resend reads for a sender with a display name. */
export function formatSender(name: string, address: string): string {
  return `${singleLine(name).replace(/["<>]/g, "")} <${singleLine(address)}>`;
}

/** A header value on one line: CR and LF become spaces, so no value can add a header. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** The first letter, `***` and the domain: enough to tell recipients apart in a local log, never the address. */
export function maskAddress(address: string): string {
  const at = address.lastIndexOf("@");
  return at < 1 ? "***" : `${address[0]}***${address.slice(at)}`;
}

function resendSender(apiKey: string): SendEmail {
  const resend = new Resend(apiKey);
  return (options) => resend.emails.send(options);
}

export function createMailer(
  config: MailerConfig,
  deps: { sendEmail?: SendEmail; logger?: Logger } = {},
): Mailer {
  const log = deps.logger ?? createLogger("email");
  const from = formatSender(
    brand.name,
    config.fromAddress ?? brand.contact.email,
  );
  const replyTo = brand.contact.support;
  let sendEmail = deps.sendEmail;

  return {
    async send(message) {
      const to = [message.to].flat();
      const part = message.template
        ? { template: message.template }
        : renderDefaultEmail(message.content);

      if (config.tier === "local" && config.deployed) {
        log.warn("email.withheld", {
          tier: config.tier,
          reason:
            "DATABASE_ENVIRONMENT is local in a deployment or production build, so the message is neither sent nor logged",
          recipientCount: to.length,
        });
        return { status: "withheld" };
      }

      if (config.tier === "local") {
        log.info("email.logged", {
          tier: config.tier,
          from,
          replyTo,
          recipients: to.map(maskAddress),
          ...("template" in part
            ? {
                templateId: part.template.id,
                templateVariables: Object.keys(part.template.variables ?? {}),
              }
            : { subject: part.subject, text: part.text }),
        });
        return { status: "logged" };
      }

      if (!config.apiKey)
        throw new Error(
          `RESEND_API_KEY is not set for the ${config.tier} tier, so @pem/email cannot send; set it, or its _STAGING form, in the app's environment.`,
        );
      sendEmail ??= resendSender(config.apiKey);

      const { data, error } = await sendEmail({ from, replyTo, to, ...part });
      if (error || !data)
        throw new Error(
          `Resend refused the message: ${error?.message ?? "no id returned"}`,
        );
      log.info("email.sent", {
        tier: config.tier,
        id: data.id,
        recipientCount: to.length,
        ...("template" in part ? { templateId: part.template.id } : {}),
      });
      return { status: "sent", id: data.id };
    },
  };
}
