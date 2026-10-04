/**
 * The one default template (D-STK-12): a heading, paragraphs and an optional
 * button, framed by the brand. Rendered as a plain template string, with no
 * renderer dependency; every value is escaped. Every brand value (the name,
 * the home URL, the support address and the two colours) is read from
 * @pem/brand, and the colours are converted to hex because email clients do
 * not read OKLCH.
 *
 * A product's other transactional mail either calls this with its own words,
 * or lives as a Resend dashboard template whose id the app's env.ts holds
 * (`mailer.ts`).
 */

import { brand } from "@pem/brand/brand";
import { oklchToHex } from "@pem/brand/color";

export type DefaultEmail = {
  subject: string;
  /** The inbox preview line; the first paragraph when absent. */
  preview?: string;
  heading: string;
  paragraphs: readonly string[];
  /** One call to action, rendered as a button and repeated as a link in the text part. */
  action?: { label: string; url: string };
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

const ink = oklchToHex(brand.theme.primary.light);
const paper = oklchToHex(brand.theme.primaryForeground.light);

/** Email clients ignore web fonts; the brand font stays on the web (D-STK-9). */
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
}

/** An action URL must be absolute http(s); anything else is a bug in the caller. */
function safeUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    throw new Error(`An email action needs an http(s) URL, not ${url}`);
  return parsed.href;
}

function renderHtml(content: DefaultEmail, actionUrl?: string): string {
  const preview = content.preview ?? content.paragraphs[0] ?? "";
  const paragraphs = content.paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:24px;">${escapeHtml(paragraph)}</p>`,
    )
    .join("\n");
  const action =
    content.action && actionUrl
      ? `<p style="margin:24px 0;"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:${ink};color:${paper};font-weight:600;text-decoration:none;">${escapeHtml(content.action.label)}</a></p>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${paper};color:${ink};font-family:${FONT_STACK};">
<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${paper};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 0 24px;font-size:14px;font-weight:600;letter-spacing:0.04em;">${escapeHtml(brand.name)}</td></tr>
<tr><td>
<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;font-weight:600;">${escapeHtml(content.heading)}</h1>
${paragraphs}
${action}
</td></tr>
<tr><td style="padding:24px 0 0;border-top:1px solid ${ink};font-size:13px;line-height:20px;">
Questions? Reply to this email or write to <a href="mailto:${escapeHtml(brand.contact.support)}" style="color:${ink};">${escapeHtml(brand.contact.support)}</a>.<br>
<a href="${escapeHtml(brand.urls.home)}" style="color:${ink};">${escapeHtml(brand.name)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function renderText(content: DefaultEmail, actionUrl?: string): string {
  const lines = [
    content.heading,
    "",
    ...content.paragraphs.flatMap((p) => [p, ""]),
  ];
  if (content.action && actionUrl)
    lines.push(`${content.action.label}: ${actionUrl}`, "");
  lines.push(
    "--",
    `Questions? Reply to this email or write to ${brand.contact.support}.`,
    `${brand.name}: ${brand.urls.home}`,
  );
  return lines.join("\n");
}

/** The default template with `content` in it, as the HTML and plain-text parts of one message. */
export function renderDefaultEmail(content: DefaultEmail): RenderedEmail {
  const actionUrl = content.action ? safeUrl(content.action.url) : undefined;
  return {
    subject: content.subject,
    html: renderHtml(content, actionUrl),
    text: renderText(content, actionUrl),
  };
}
