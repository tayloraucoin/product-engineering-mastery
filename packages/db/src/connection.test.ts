import assert from "node:assert/strict";
import { test } from "node:test";

import { assertPooler, describeUrl } from "./connection.ts";

const host = "aws-0-example.pooler.supabase.test";
const transaction = `postgresql://app.example:synthetic@${host}:6543/postgres`;
const session = `postgresql://app.example:synthetic@${host}:5432/postgres`;
const direct = `postgresql://app.example:synthetic@${host}/postgres`;

test("runtime takes the transaction pooler on a hosted tier", () => {
  assert.equal(assertPooler(transaction, "runtime", "production"), transaction);
  assert.throws(
    () => assertPooler(session, "runtime", "staging"),
    /transaction pooler \(port 6543\)/,
  );
});

test("migrations take the session pooler on a hosted tier", () => {
  assert.equal(assertPooler(session, "migration", "staging"), session);
  assert.equal(assertPooler(direct, "migration", "production"), direct);
  assert.throws(
    () => assertPooler(transaction, "migration", "production"),
    /session pooler \(port 5432\)/,
  );
});

test("the local tier is not checked beyond the scheme", () => {
  const local = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  assert.equal(assertPooler(local, "runtime", "local"), local);
  assert.throws(() => assertPooler("mysql://x@y/z", "runtime", "local"));
  assert.throws(() => assertPooler("not a url", "runtime", "local"));
});

test("errors and descriptions never carry credentials", () => {
  assert.equal(describeUrl(session), `${host}:5432/postgres`);
  assert.throws(
    () => assertPooler(session, "runtime", "production"),
    (error: Error) => !error.message.includes("synthetic"),
  );
});
