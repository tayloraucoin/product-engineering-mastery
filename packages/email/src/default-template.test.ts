/** C2: the default template renders the brand's name, from and reply-to from @pem/brand, and the package writes no brand literal. */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { brand } from "@pem/brand/brand";
import { oklchToHex } from "@pem/brand/color";

import { escapeHtml, renderDefaultEmail } from "./default-template.ts";

const content = {
  subject: "Synthetic subject",
  heading: "Synthetic heading",
  paragraphs: ["First synthetic paragraph.", "Second synthetic paragraph."],
  action: { label: "Open", url: "https://app.example.test/open" },
};

test("C2: the HTML part carries the brand's name, support address, home URL and colours", () => {
  const { html } = renderDefaultEmail(content);

  assert.ok(html.includes(escapeHtml(brand.name)));
  assert.ok(html.includes(`mailto:${brand.contact.support}`));
  assert.ok(html.includes(`href="${brand.urls.home}"`));
  assert.ok(html.includes(oklchToHex(brand.theme.primary.light)));
  assert.ok(html.includes(oklchToHex(brand.theme.primaryForeground.light)));
  assert.ok(html.includes("Synthetic heading"));
  assert.ok(html.includes('href="https://app.example.test/open"'));
});

test("C2: the text part carries the brand and the action as a link", () => {
  const { subject, text } = renderDefaultEmail(content);

  assert.equal(subject, "Synthetic subject");
  assert.ok(text.includes(brand.name));
  assert.ok(text.includes(brand.contact.support));
  assert.ok(text.includes(brand.urls.home));
  assert.ok(text.includes("Open: https://app.example.test/open"));
  assert.ok(text.includes("Second synthetic paragraph."));
});

test("C2: every caller value is escaped", () => {
  const { html } = renderDefaultEmail({
    ...content,
    heading: `<script>alert("x")</script>`,
    paragraphs: [`Tom & Jerry's "quote"`],
  });

  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Tom &amp; Jerry&#39;s &quot;quote&quot;"));
});

test("C2: an action URL that is not http(s) is refused", () => {
  assert.throws(
    () =>
      renderDefaultEmail({
        ...content,
        action: { label: "Run", url: "javascript:alert(1)" },
      }),
    /needs an http\(s\) URL/,
  );
});

test("C2: no source file in @pem/email writes a brand value or a colour literal", () => {
  const dir = new URL("./", import.meta.url);
  const sources = readdirSync(dir, {
    recursive: true,
    encoding: "utf8",
  }).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"));
  assert.ok(sources.length >= 2);
  const brandValues = [
    brand.name,
    brand.shortName,
    brand.urls.home,
    brand.urls.support,
    brand.contact.email,
    brand.contact.support,
  ];

  for (const name of sources) {
    const source = readFileSync(new URL(name, dir), "utf8");
    for (const value of brandValues)
      assert.ok(!source.includes(value), `${name} writes "${value}"`);
    assert.doesNotMatch(
      source,
      /#[0-9a-fA-F]{3,8}\b/,
      `${name} writes a hex colour`,
    );
    assert.doesNotMatch(
      source,
      /\boklch\(/,
      `${name} writes an oklch() colour`,
    );
    assert.doesNotMatch(
      source,
      /@[a-z0-9-]+\.[a-z]{2,}/i,
      `${name} writes an address`,
    );
  }
});

test("C2: a subject with a line break stays one header line", () => {
  const { subject } = renderDefaultEmail({
    ...content,
    subject: "Hello\r\nBcc: someone@example.test",
  });
  assert.equal(subject, "Hello Bcc: someone@example.test");
});
