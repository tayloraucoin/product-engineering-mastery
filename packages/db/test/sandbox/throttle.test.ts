/**
 * The gate's wrong-code throttle on the local database (`yarn test:db`),
 * LAB-6: the counts, the locks, the window reset, parallel tries, and what a
 * row holds. Each test makes its own keys and fixes its own clock, so the
 * prune every write runs never reaches a row a running test still reads.
 */

import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { inArray } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

import { clearGateKey, readGateLock, recordGateFailure } from "@pem/db/sandbox";

import { sandboxGateAttempts } from "../../src/schema/index.ts";
import { openSandboxTestDb, type TestDatabase } from "./fixtures.ts";

const MINUTE = 60 * 1000;
const BROWSER = { limit: 5, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE };
const NETWORK = { limit: 30, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE };
const T0 = new Date("2026-10-06T09:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);

let database: TestDatabase;
const made: Buffer[] = [];

/** A fresh key hash, remembered for clean-up. */
function newKey(): Buffer {
  const key = randomBytes(32);
  made.push(key);
  return key;
}

before(async () => {
  database = await openSandboxTestDb();
});

after(async () => {
  if (database) {
    if (made.length)
      await database.db
        .delete(sandboxGateAttempts)
        .where(inArray(sandboxGateAttempts.keyHash, made));
    await database.db.$client.end();
    await database.admin.end();
  }
});

const db = () => database.db;
const fail = (
  keyHash: Uint8Array,
  now: Date,
  limits: typeof BROWSER = BROWSER,
) => recordGateFailure(db(), { keyHash, ...limits, now });

describe("C3: counts, locks and the window", () => {
  test("C3: 5 failures on a browser key in 15 minutes lock it for 15 minutes", async () => {
    const key = newKey();
    for (let i = 1; i <= 4; i++)
      assert.deepEqual(await fail(key, at(i * MINUTE)), {
        failures: i,
        lockedUntil: null,
      });
    assert.deepEqual(await fail(key, at(14 * MINUTE)), {
      failures: 5,
      lockedUntil: at(29 * MINUTE),
    });
    assert.deepEqual(
      await readGateLock(db(), { keyHashes: [key], now: at(28 * MINUTE) }),
      { lockedUntil: at(29 * MINUTE) },
    );
    assert.deepEqual(
      await readGateLock(db(), { keyHashes: [key], now: at(29 * MINUTE) }),
      { lockedUntil: null },
    );
  });

  test("C3: 30 failures lock a network key; 29 do not", async () => {
    const key = newKey();
    for (let i = 1; i <= 29; i++) {
      const result = await fail(key, at(i * 1000), NETWORK);
      assert.equal(result.failures, i);
      assert.equal(result.lockedUntil, null);
    }
    assert.deepEqual(await fail(key, at(30 * 1000), NETWORK), {
      failures: 30,
      lockedUntil: at(30 * 1000 + 15 * MINUTE),
    });
  });

  test("C3: a failure after an expired window starts again at 1", async () => {
    const key = newKey();
    await fail(key, at(0));
    await fail(key, at(MINUTE));
    assert.equal((await fail(key, at(15 * MINUTE))).failures, 1);
    assert.equal((await fail(key, at(16 * MINUTE))).failures, 2);
  });

  test("C3: a window that expired under a running lock starts again at 1 and keeps the lock", async () => {
    const key = newKey();
    const limits = { limit: 2, windowMs: MINUTE, lockMs: 30 * MINUTE };
    await fail(key, at(0), limits);
    assert.deepEqual(await fail(key, at(1000), limits), {
      failures: 2,
      lockedUntil: at(1000 + 30 * MINUTE),
    });
    assert.deepEqual(await fail(key, at(5 * MINUTE), limits), {
      failures: 1,
      lockedUntil: at(1000 + 30 * MINUTE),
    });
  });

  test("C3: the latest lock across the keys is returned", async () => {
    const browser = newKey();
    const network = newKey();
    const quick = { limit: 1, windowMs: MINUTE, lockMs: 5 * MINUTE };
    await fail(browser, at(0), quick);
    await fail(network, at(0), { ...quick, lockMs: 9 * MINUTE });
    assert.deepEqual(
      await readGateLock(db(), {
        keyHashes: [browser, network],
        now: at(MINUTE),
      }),
      { lockedUntil: at(9 * MINUTE) },
    );
    assert.deepEqual(
      await readGateLock(db(), { keyHashes: [], now: at(MINUTE) }),
      { lockedUntil: null },
    );
  });

  test("C3: a success clears the browser row only", async () => {
    const browser = newKey();
    const network = newKey();
    await fail(browser, at(0));
    await fail(network, at(0), NETWORK);
    assert.deepEqual(
      await clearGateKey(db(), { keyHash: browser, now: at(MINUTE) }),
      { cleared: 1 },
    );
    const left = await db()
      .select({ keyHash: sandboxGateAttempts.keyHash })
      .from(sandboxGateAttempts)
      .where(inArray(sandboxGateAttempts.keyHash, [browser, network]));
    assert.deepEqual(
      left.map((row) => Buffer.from(row.keyHash).toString("hex")),
      [network.toString("hex")],
    );
  });
});

describe("C4: parallel tries", () => {
  test("C4: ten concurrent failures on one key count ten", async () => {
    const key = newKey();
    const limits = { limit: 100, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE };
    const results = await Promise.all(
      Array.from({ length: 10 }, () => fail(key, at(0), limits)),
    );
    assert.deepEqual(
      results.map((r) => r.failures).sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );
    const [row] = await db()
      .select({ failures: sandboxGateAttempts.failures })
      .from(sandboxGateAttempts)
      .where(inArray(sandboxGateAttempts.keyHash, [key]));
    assert.equal(row?.failures, 10);
  });

  test("C4: ten concurrent failures past the limit all count, and the key locks", async () => {
    const key = newKey();
    const results = await Promise.all(
      Array.from({ length: 10 }, () => fail(key, at(0))),
    );
    assert.equal(Math.max(...results.map((r) => r.failures)), 10);
    assert.equal(results.filter((r) => r.lockedUntil !== null).length, 6);
  });
});

describe("C5: what a row holds, and how long", () => {
  test("C5: the table holds a key hash, a count and two instants: no slug, no link to feedback", () => {
    const config = getTableConfig(sandboxGateAttempts);
    assert.deepEqual(config.columns.map((c) => c.name).sort(), [
      "failures",
      "key_hash",
      "locked_until",
      "window_ends_at",
    ]);
    assert.deepEqual(config.foreignKeys, []);
  });

  test("C5: after tries, no row holds the raw browser id or address or its plain SHA-256", async () => {
    // The app's keys (apps/web/lib/sandbox/throttle.ts): HMAC-SHA256 under
    // SANDBOX_SECRET of "throttle", a newline, then b:<id> or n:<address>.
    const secret = randomBytes(48).toString("base64");
    const browserId = randomBytes(16).toString("base64url");
    const address = "203.0.113.7";
    const hmac = (data: string) =>
      createHmac("sha256", secret).update(`throttle\n${data}`).digest();
    const browser = hmac(`b:${browserId}`);
    const network = hmac(`n:${address}`);
    made.push(browser, network);
    for (let i = 0; i < 3; i++) {
      await fail(browser, at(i * 1000));
      await fail(network, at(i * 1000), NETWORK);
    }
    const rows = await db().select().from(sandboxGateAttempts);
    const forbidden = [browserId, address, `b:${browserId}`, `n:${address}`];
    const forbiddenHashes = forbidden.map((raw) =>
      createHash("sha256").update(raw).digest("hex"),
    );
    for (const row of rows) {
      const keyHex = Buffer.from(row.keyHash).toString("hex");
      const keyText = Buffer.from(row.keyHash).toString("latin1");
      for (const raw of forbidden) assert.ok(!keyText.includes(raw));
      for (const hash of forbiddenHashes) assert.notEqual(keyHex, hash);
      const text = JSON.stringify(row);
      for (const raw of [browserId, address]) assert.ok(!text.includes(raw));
    }
  });

  test("C5: a row past the later of its window and lock is gone after the next write; one still locked stays", async () => {
    const plain = newKey();
    const locked = newKey();
    const other = newKey();
    await fail(plain, at(0));
    await fail(locked, at(0), {
      limit: 1,
      windowMs: MINUTE,
      lockMs: 30 * MINUTE,
    });
    const present = async () =>
      (
        await db()
          .select({ keyHash: sandboxGateAttempts.keyHash })
          .from(sandboxGateAttempts)
          .where(inArray(sandboxGateAttempts.keyHash, [plain, locked]))
      )
        .map((row) => Buffer.from(row.keyHash).toString("hex"))
        .sort();

    await fail(other, at(20 * MINUTE));
    assert.deepEqual(await present(), [locked.toString("hex")]);

    await clearGateKey(db(), { keyHash: other, now: at(30 * MINUTE) });
    assert.deepEqual(await present(), []);
  });
});
