import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, test } from "node:test";

import { SANDBOX_NOINDEX_HEADERS } from "./robots.ts";
import {
  SANDBOX_SECRET_MIN_BYTES,
  sandboxSecretProblem,
} from "./secret-check.ts";

const app = (path: string) => new URL(`../../${path}`, import.meta.url);

describe("C7: noindex headers and the secret's length", () => {
  test("C7: X-Robots-Tag: noindex, nofollow on /experimental/:path* and /admin/:path*, and no other source", () => {
    assert.deepEqual(SANDBOX_NOINDEX_HEADERS, [
      {
        source: "/experimental/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]);
  });

  test("C7: next.config.ts's headers() returns that array, and nothing else sets headers there", () => {
    const source = readFileSync(app("next.config.ts"), "utf8");
    assert.match(
      source,
      /import \{ SANDBOX_NOINDEX_HEADERS \} from "\.\/lib\/sandbox\/robots";/,
    );
    assert.match(
      source,
      /async headers\(\) \{\s*return SANDBOX_NOINDEX_HEADERS;\s*\}/,
    );
    // One definition of headers in the config; a comment that mentions it does not count.
    assert.equal(source.match(/^\s*(async\s+)?headers\s*[(:]/gm)?.length, 1);
  });

  test("C7: no robots file disallows the sandbox, and proxy.ts does not mention it", () => {
    for (const path of ["app/robots.ts", "app/robots.txt", "public/robots.txt"])
      assert.equal(existsSync(app(path)), false, path);
    const proxy = readFileSync(app("proxy.ts"), "utf8");
    assert.doesNotMatch(proxy, /experimental|admin|X-Robots-Tag/);
  });

  test("C7: a SANDBOX_SECRET under 32 bytes is refused, by bytes, and the message never holds the value", () => {
    assert.equal(SANDBOX_SECRET_MIN_BYTES, 32);
    const short = "s".repeat(31);
    const problem = sandboxSecretProblem(short);
    assert.ok(problem);
    assert.ok(!problem.includes(short));
    assert.equal(sandboxSecretProblem("s".repeat(32)), null);
    // 16 two-byte characters are 32 bytes; 15 are 30.
    assert.equal(sandboxSecretProblem("\u00e9".repeat(16)), null);
    assert.ok(sandboxSecretProblem("\u00e9".repeat(15)));
  });

  test("C7: env.ts refines SANDBOX_SECRET with that check and picks it by tier", () => {
    const env = readFileSync(app("env.ts"), "utf8");
    assert.match(
      env,
      /SANDBOX_SECRET: z\s*\.string\(\)\s*\.min\(1\)\s*\.optional\(\)\s*\.superRefine\(\(value, context\) => \{\s*const problem = value && sandboxSecretProblem\(value\);/,
    );
    assert.match(
      env,
      /SANDBOX_SECRET: pickTiered\(raw, "SANDBOX_SECRET", tier\)/,
    );
    for (const name of [
      "SANDBOX_SECRET",
      "SANDBOX_SECRET_LOCAL",
      "SANDBOX_SECRET_STAGING",
    ])
      assert.match(env, new RegExp(`${name}: process\\.env\\.${name},`));
  });
});
