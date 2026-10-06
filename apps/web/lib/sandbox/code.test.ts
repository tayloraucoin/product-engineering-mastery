import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { describe, test } from "node:test";

import {
  CODE_ALPHABET,
  formatCode,
  generateCode,
  hashCode,
  normaliseCode,
} from "./code.ts";

/**
 * A seeded generator (mulberry32) for the generated inputs. The seed is
 * random per run and printed on failure; to replay one, pass it to `seeded`.
 */
const SEED = randomBytes(4).readUInt32LE(0);
function seeded(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  const pick = <T>(items: readonly T[]): T => items[int(items.length)]!;
  return { next, int, pick };
}
const rand = seeded(SEED);
const RUNS = 500;
const seedNote = `(seed ${SEED})`;

/** A random normalised code drawn from the seeded generator. */
function randomSymbols(): string {
  let out = "";
  for (let i = 0; i < 16; i++) out += rand.pick([...CODE_ALPHABET]);
  return out;
}

const SEPARATORS = ["", "", "", " ", "-", "  ", " - ", "\t", "–", " "];
const CONFUSABLES: Record<string, readonly string[]> = {
  "0": ["0", "O", "o"],
  "1": ["1", "I", "i", "L", "l"],
};

/** The same code as a person might type or paste it. */
function forgivingSpelling(symbols: string): string {
  let out = rand.pick(["", " ", "\n"]);
  for (const symbol of symbols) {
    const spelled = rand.pick(CONFUSABLES[symbol] ?? [symbol]);
    out += rand.next() < 0.5 ? spelled.toLowerCase() : spelled;
    out += rand.pick(SEPARATORS);
  }
  return out + rand.pick(["", "\n", "\r\n", " "]);
}

/** Characters outside ASCII that look like, or upper-case into, a code symbol. */
const NON_ASCII_STAND_INS = [
  "\u039f", // Greek capital omicron, for 0 or O
  "\u041e", // Cyrillic capital O
  "\u0406", // Cyrillic capital I, for 1
  "\u0131", // dotless i: toUpperCase gives I
  "\u017f", // long s: toUpperCase gives S
  "\u00df", // sharp s: toUpperCase gives SS
  "\u212a", // Kelvin sign, for K
  "\uff21", // full-width A
  "\uff11", // full-width 1
  "\u13aa", // Cherokee A
];

const sameHash = (a: Uint8Array, b: Uint8Array) =>
  Buffer.from(a).equals(Buffer.from(b));

describe("C1: forgiving input normalises to one code; anything else is a wrong code", () => {
  test(`C1: any spacing, dashes, case, trailing newline or O/I/L confusable gives the same 16 symbols and hash ${seedNote}`, () => {
    for (let run = 0; run < RUNS; run++) {
      const symbols = randomSymbols();
      const typed = forgivingSpelling(symbols);
      assert.equal(
        normaliseCode(typed),
        symbols,
        `${JSON.stringify(typed)} ${seedNote}`,
      );
      assert.ok(sameHash(hashCode(normaliseCode(typed)!), hashCode(symbols)));
    }
  });

  test(`C1: a one-symbol change gives another code and another hash ${seedNote}`, () => {
    for (let run = 0; run < RUNS; run++) {
      const symbols = randomSymbols();
      const at = rand.int(16);
      const other = rand.pick(
        [...CODE_ALPHABET].filter((s) => s !== symbols[at]),
      );
      const changed = symbols.slice(0, at) + other + symbols.slice(at + 1);
      const normalised = normaliseCode(forgivingSpelling(changed));
      assert.notEqual(normalised, symbols, seedNote);
      assert.ok(!sameHash(hashCode(normalised!), hashCode(symbols)), seedNote);
    }
  });

  test(`C1: 15 or 17 symbols are a wrong code ${seedNote}`, () => {
    for (let run = 0; run < RUNS; run++) {
      const symbols = randomSymbols();
      const short = symbols.slice(0, 15);
      const long = symbols + rand.pick([...CODE_ALPHABET]);
      assert.equal(normaliseCode(forgivingSpelling(short)), null, seedNote);
      assert.equal(normaliseCode(forgivingSpelling(long)), null, seedNote);
    }
  });

  test(`C1: a U, in either case, is a wrong code, never remapped ${seedNote}`, () => {
    for (let run = 0; run < RUNS; run++) {
      const symbols = randomSymbols();
      const at = rand.int(16);
      const withU =
        symbols.slice(0, at) + rand.pick(["U", "u"]) + symbols.slice(at + 1);
      assert.equal(normaliseCode(forgivingSpelling(withU)), null, seedNote);
    }
  });

  test(`C1: a non-ASCII character standing in for a symbol is a wrong code ${seedNote}`, () => {
    for (let run = 0; run < RUNS; run++) {
      const symbols = randomSymbols();
      const at = rand.int(16);
      const standIn = rand.pick(NON_ASCII_STAND_INS);
      const typed = symbols.slice(0, at) + standIn + symbols.slice(at + 1);
      assert.equal(
        normaliseCode(typed),
        null,
        `${JSON.stringify(typed)} ${seedNote}`,
      );
    }
  });

  test("C1: each non-ASCII stand-in alone, in place of one symbol of a fixed code, is refused", () => {
    const symbols = "7KQM29XHPATR4WDN";
    for (const standIn of NON_ASCII_STAND_INS)
      for (let at = 0; at < 16; at++)
        assert.equal(
          normaliseCode(symbols.slice(0, at) + standIn + symbols.slice(at + 1)),
          null,
          `${standIn} at ${at}`,
        );
  });

  test("C1: what is not a string is a wrong code", () => {
    for (const value of [undefined, null, 7, {}, ["7KQM29XHPATR4WDN"]])
      assert.equal(normaliseCode(value), null);
  });

  test("C1: the hash is SHA-256 of the 16 ASCII symbols, 32 bytes", () => {
    const hash = hashCode("7KQM29XHPATR4WDN");
    assert.equal(hash.length, 32);
    assert.equal(
      Buffer.from(hash).toString("hex"),
      // printf '7KQM29XHPATR4WDN' | shasum -a 256
      "5d803cf9e9895ce6f88e59bd627b90a302858f9155c9f1e8b810c4dd03621d66",
    );
  });
});

describe("C2: generated codes", () => {
  test("C2: generateCode returns 16 Crockford symbols in four groups of four", () => {
    const shape = new RegExp(
      `^([${CODE_ALPHABET}]{4}-){3}[${CODE_ALPHABET}]{4}$`,
    );
    for (let i = 0; i < 100; i++) assert.match(generateCode(), shape);
  });

  test("C2: 1,000 codes are distinct and each normalises to itself", () => {
    const codes = Array.from({ length: 1000 }, generateCode);
    assert.equal(new Set(codes).size, 1000);
    for (const code of codes) {
      const normalised = normaliseCode(code);
      assert.equal(normalised, code.replaceAll("-", ""));
      assert.equal(formatCode(normalised!), code);
    }
  });
});
