/** C1: the local tier logs the rendered message and never calls the vendor; staging and production do. */

import assert from "node:assert/strict";
import { test } from "node:test";

import { brand } from "@pem/brand/brand";
import type { LogFields, Logger } from "@pem/observability/logger";

import {
  createMailer,
  formatSender,
  maskAddress,
  type SendEmail,
} from "./mailer.ts";

const content = {
  subject: "Synthetic subject",
  heading: "Synthetic heading",
  paragraphs: ["A synthetic paragraph."],
  action: { label: "Open", url: "https://app.example.test/open" },
};

/** A vendor stand-in that records each call. */
function fakeVendor() {
  const calls: Parameters<SendEmail>[0][] = [];
  const sendEmail: SendEmail = async (options) => {
    calls.push(options);
    return { data: { id: "email_synthetic" }, error: null };
  };
  return { calls, sendEmail };
}

/** A logger that keeps each line. */
function memoryLogger() {
  const lines: { event: string; fields?: LogFields }[] = [];
  const keep = (event: string, fields?: LogFields) => {
    lines.push({ event, fields });
  };
  const logger: Logger = { info: keep, warn: keep, error: keep };
  return { lines, logger };
}

test("C1: a send on the local tier logs the rendered message and does not call the vendor", async () => {
  const vendor = fakeVendor();
  const { lines, logger } = memoryLogger();
  const mailer = createMailer(
    { tier: "local", deployed: false, apiKey: "re_synthetic" },
    { sendEmail: vendor.sendEmail, logger },
  );

  const result = await mailer.send({ to: "person@example.test", content });

  assert.deepEqual(result, { status: "logged" });
  assert.equal(vendor.calls.length, 0);
  assert.equal(lines.length, 1);
  const fields = lines[0]?.fields ?? {};
  assert.equal(lines[0]?.event, "email.logged");
  assert.equal(fields.subject, "Synthetic subject");
  assert.match(String(fields.text), /Synthetic heading/);
  assert.match(String(fields.text), /Open: https:\/\/app\.example\.test\/open/);
  assert.deepEqual(fields.recipients, ["p***@example.test"]);
  assert.ok(!JSON.stringify(fields).includes("person@example.test"));
});

test("C1: a dashboard template on the local tier logs its id and variable names, not their values", async () => {
  const vendor = fakeVendor();
  const { lines, logger } = memoryLogger();
  const mailer = createMailer(
    { tier: "local", deployed: false },
    { sendEmail: vendor.sendEmail, logger },
  );

  await mailer.send({
    to: ["person@example.test"],
    template: { id: "tmpl_synthetic", variables: { firstName: "Synthetic" } },
  });

  assert.equal(vendor.calls.length, 0);
  assert.equal(lines[0]?.fields?.templateId, "tmpl_synthetic");
  assert.deepEqual(lines[0]?.fields?.templateVariables, ["firstName"]);
  assert.ok(!JSON.stringify(lines[0]?.fields).includes('Synthetic"'));
});

test("C1: the local tier needs no key", async () => {
  const mailer = createMailer(
    { tier: "local", deployed: false },
    memoryLogger(),
  );
  assert.deepEqual(await mailer.send({ to: "person@example.test", content }), {
    status: "logged",
  });
});

test("C1: staging and production call the vendor once, with the brand's sender and reply-to", async () => {
  for (const tier of ["staging", "production"] as const) {
    const vendor = fakeVendor();
    const mailer = createMailer(
      { tier, deployed: true, apiKey: "re_synthetic" },
      { sendEmail: vendor.sendEmail, logger: memoryLogger().logger },
    );

    const result = await mailer.send({ to: "person@example.test", content });

    assert.deepEqual(result, { status: "sent", id: "email_synthetic" });
    assert.equal(vendor.calls.length, 1);
    const options = vendor.calls[0];
    assert.equal(options?.from, `${brand.name} <${brand.contact.email}>`);
    assert.equal(options?.replyTo, brand.contact.support);
    assert.deepEqual(options?.to, ["person@example.test"]);
    assert.equal(options?.subject, "Synthetic subject");
    assert.match(String(options?.html), /Synthetic heading/);
  }
});

test("C1: a dashboard template is sent by its id, and EMAIL_FROM replaces the brand's address", async () => {
  const vendor = fakeVendor();
  const mailer = createMailer(
    {
      tier: "production",
      deployed: true,
      apiKey: "re_synthetic",
      fromAddress: "mail@example.test",
    },
    { sendEmail: vendor.sendEmail, logger: memoryLogger().logger },
  );

  await mailer.send({
    to: "person@example.test",
    template: { id: "tmpl_synthetic", variables: { firstName: "Synthetic" } },
  });

  assert.deepEqual(vendor.calls[0]?.template, {
    id: "tmpl_synthetic",
    variables: { firstName: "Synthetic" },
  });
  assert.equal(vendor.calls[0]?.from, `${brand.name} <mail@example.test>`);
  assert.equal(vendor.calls[0]?.html, undefined);
});

test("C1: staging without a key refuses to send, naming the variable", async () => {
  const vendor = fakeVendor();
  const mailer = createMailer(
    { tier: "staging", deployed: true },
    { sendEmail: vendor.sendEmail, logger: memoryLogger().logger },
  );

  await assert.rejects(
    mailer.send({ to: "person@example.test", content }),
    /RESEND_API_KEY is not set for the staging tier/,
  );
  assert.equal(vendor.calls.length, 0);
});

test("C1: a vendor error is thrown, not swallowed", async () => {
  const mailer = createMailer(
    { tier: "production", deployed: true, apiKey: "re_synthetic" },
    {
      sendEmail: async () => ({
        data: null,
        error: { message: "domain not verified" },
      }),
      logger: memoryLogger().logger,
    },
  );

  await assert.rejects(
    mailer.send({ to: "person@example.test", content }),
    /Resend refused the message: domain not verified/,
  );
});

test("maskAddress keeps the first letter and the domain only", () => {
  assert.equal(maskAddress("person@example.test"), "p***@example.test");
  assert.equal(maskAddress("not-an-address"), "***");
});

test("C1: a deployment left on the local tier neither sends nor logs the body", async () => {
  const vendor = fakeVendor();
  const { lines, logger } = memoryLogger();
  const mailer = createMailer(
    { tier: "local", deployed: true, apiKey: "re_synthetic" },
    { sendEmail: vendor.sendEmail, logger },
  );

  const result = await mailer.send({ to: "person@example.test", content });

  assert.deepEqual(result, { status: "withheld" });
  assert.equal(vendor.calls.length, 0);
  assert.equal(lines[0]?.event, "email.withheld");
  assert.ok(lines[0]?.fields?.error instanceof Error);
  const logged = JSON.stringify(lines);
  for (const leak of [
    "Synthetic subject",
    "Synthetic heading",
    "app.example.test",
    "person@",
  ])
    assert.ok(!logged.includes(leak), leak);
});

test("C1: a send logs its Resend id and recipient count, never the address or body", async () => {
  const vendor = fakeVendor();
  const { lines, logger } = memoryLogger();
  const mailer = createMailer(
    { tier: "production", deployed: true, apiKey: "re_synthetic" },
    { sendEmail: vendor.sendEmail, logger },
  );

  await mailer.send({ to: "person@example.test", content });

  assert.equal(lines[0]?.event, "email.sent");
  assert.equal(lines[0]?.fields?.id, "email_synthetic");
  assert.equal(lines[0]?.fields?.recipientCount, 1);
  const logged = JSON.stringify(lines);
  for (const leak of ["person@", "Synthetic heading", "Synthetic subject"])
    assert.ok(!logged.includes(leak), leak);
});

test("formatSender keeps a display name and address on one line", () => {
  assert.equal(
    formatSender('Brand "X"\r\nBcc: a', "mail@example.test\n"),
    "Brand X Bcc: a <mail@example.test>",
  );
});
