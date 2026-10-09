/**
 * The wrong-code throttle (gap 3, D-LAB-33, technical/gate.md "Wrong-code
 * throttle"). Two counters per try, both checked before the code lookup:
 *
 * - the browser key, the `sandbox_gate` cookie's random id;
 * - the network key, the client's address (IPv4 whole, IPv6 by /64), only
 *   where `x-forwarded-for` is trusted: a Vercel deployment, where the
 *   platform sets the first hop. Elsewhere, localhost included, only the
 *   browser counter runs.
 *
 * Neither is stored raw: each is HMAC-SHA256 under SANDBOX_SECRET, label
 * `throttle`, over `b:<id>` or `n:<address>`, so the kinds never collide.
 * Keys are global, never per slug, so an unknown slug counts and locks
 * exactly like a real one. A locked key refuses even a correct code.
 *
 * Pure: LAB-7's action reads the cookie and the header and binds the
 * database. Never log an address, a browser id or a key.
 */

import { randomBytes } from "node:crypto";
import { isIP } from "node:net";

import {
  clearGateKey,
  readGateLock,
  recordGateFailure,
  type SandboxDb,
} from "@pem/db/sandbox";

import {
  isUsableSecret,
  SANDBOX_MAC_LABELS,
  sandboxMac,
} from "../shared/secret.ts";

const MINUTE = 60 * 1000;

/** The thresholds, in one place (judgment, Mason and Warden). */
export const GATE_THROTTLE = {
  browser: { limit: 5, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE },
  network: { limit: 30, windowMs: 15 * MINUTE, lockMs: 15 * MINUTE },
} as const;

export const GATE_COOKIE = "sandbox_gate";
const GATE_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;
const BROWSER_ID_BYTES = 16;
const BROWSER_ID = /^[A-Za-z0-9_-]{22}$/;

/** A new browser id: 128 random bits, base64url. */
export function newBrowserId(): string {
  return randomBytes(BROWSER_ID_BYTES).toString("base64url");
}

/** The `sandbox_gate` cookie's id, or null when absent or not one this app set. */
export function readBrowserId(value: string | undefined): string | null {
  return typeof value === "string" && BROWSER_ID.test(value) ? value : null;
}

/**
 * How `sandbox_gate` is set: every slug's gate, HttpOnly, Lax, one day, and
 * Secure on any production runtime (the action passes `productionRuntime`).
 */
export function gateCookieOptions(secure: boolean) {
  return {
    path: "/experimental",
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: GATE_COOKIE_MAX_AGE_SECONDS,
  };
}

/** Eight hextets of an IPv6 address `isIP` accepted, or null. */
function expandIPv6(address: string): number[] | null {
  let text = address;
  const v4: number[] = [];
  if (text.includes(".")) {
    const at = text.lastIndexOf(":");
    const octets = text
      .slice(at + 1)
      .split(".")
      .map(Number);
    if (octets.length !== 4) return null;
    v4.push((octets[0]! << 8) | octets[1]!, (octets[2]! << 8) | octets[3]!);
    text = text.slice(0, at + 1);
    if (!text.endsWith("::")) text = text.slice(0, -1);
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const parse = (part: string) => (part === "" ? [] : part.split(":"));
  const head = parse(halves[0]!);
  const rest = halves.length === 2 ? parse(halves[1]!) : [];
  if (![...head, ...rest].every((h) => /^[0-9a-f]{1,4}$/.test(h))) return null;
  const known = head.length + rest.length + v4.length;
  if (halves.length === 2 ? known > 7 : known !== 8) return null;
  return [
    ...head.map((h) => parseInt(h, 16)),
    ...Array<number>(8 - known).fill(0),
    ...rest.map((h) => parseInt(h, 16)),
    ...v4,
  ];
}

/**
 * The network key for an `x-forwarded-for` value: the first hop's IPv4
 * address whole, or its IPv6 /64. An IPv4-mapped IPv6 address is its IPv4.
 * Null when not trusted, or the header is missing or malformed.
 *
 * `trusted` is env's `deployed` and nothing else: on Vercel the platform sets
 * the first hop. `productionRuntime` is true off Vercel too, where a client
 * could choose the header and lock out a whole office's network.
 */
export function networkKeyOf(
  headerValue: string | null | undefined,
  trusted: boolean,
): string | null {
  if (!trusted || typeof headerValue !== "string") return null;
  const first = headerValue.split(",")[0]!.trim();
  const version = isIP(first);
  if (version === 4) return first;
  if (version !== 6) return null;
  const hextets = expandIPv6(first.split("%")[0]!.toLowerCase());
  if (!hextets) return null;
  const isMapped =
    hextets.slice(0, 5).every((h) => h === 0) && hextets[5] === 0xffff;
  if (isMapped)
    return [
      hextets[6]! >> 8,
      hextets[6]! & 255,
      hextets[7]! >> 8,
      hextets[7]! & 255,
    ].join(".");
  return `${hextets
    .slice(0, 4)
    .map((h) => h.toString(16))
    .join(":")}::/64`;
}

export type ThrottleKeys = {
  browser: Uint8Array | null;
  network: Uint8Array | null;
};

/** The two keys' HMACs. Throws when SANDBOX_SECRET is unusable: the action fails closed before any try. */
export function throttleKeys(input: {
  secret: string | null | undefined;
  browserId: string | null;
  networkKey: string | null;
}): ThrottleKeys {
  const { secret } = input;
  if (!isUsableSecret(secret))
    throw new Error("SANDBOX_SECRET is unset for this tier.");
  const mac = (data: string) =>
    new Uint8Array(sandboxMac(secret, SANDBOX_MAC_LABELS.throttle, data));
  return {
    browser: input.browserId === null ? null : mac(`b:${input.browserId}`),
    network: input.networkKey === null ? null : mac(`n:${input.networkKey}`),
  };
}

/** The throttle's three database calls, as `bindGateThrottle` binds them. */
export type GateThrottleStore = {
  readGateLock(input: {
    keyHashes: readonly Uint8Array[];
    now: Date;
  }): Promise<{ lockedUntil: Date | null }>;
  recordGateFailure(input: {
    keyHash: Uint8Array;
    limit: number;
    windowMs: number;
    lockMs: number;
    now: Date;
  }): Promise<{ failures: number; lockedUntil: Date | null }>;
  clearGateKey(input: {
    keyHash: Uint8Array;
    now: Date;
  }): Promise<{ cleared: number }>;
};

export function bindGateThrottle(db: SandboxDb): GateThrottleStore {
  return {
    readGateLock: (input) => readGateLock(db, input),
    recordGateFailure: (input) => recordGateFailure(db, input),
    clearGateKey: (input) => clearGateKey(db, input),
  };
}

export type ThrottledResult<T> =
  { ok: true; value: T } | { ok: false; lockedUntil: Date | null };

/**
 * Runs one gate try under the throttle. Either key locked: the try is
 * refused with `lockedUntil` and `attempt` never runs. Otherwise `attempt`
 * runs (LAB-5's `grantAccess`): a value is a success and clears the browser
 * key only; null is a failure, counted on both keys, and `lockedUntil` says
 * whether this try started a lock.
 */
export async function withGateThrottle<T>(
  store: GateThrottleStore,
  keys: ThrottleKeys,
  now: Date,
  attempt: () => Promise<T | null>,
): Promise<ThrottledResult<T>> {
  const keyHashes = [keys.browser, keys.network].filter(
    (key): key is Uint8Array => key !== null,
  );
  const lock = await store.readGateLock({ keyHashes, now });
  if (lock.lockedUntil) return { ok: false, lockedUntil: lock.lockedUntil };

  const value = await attempt();
  if (value !== null) {
    if (keys.browser) await store.clearGateKey({ keyHash: keys.browser, now });
    return { ok: true, value };
  }

  let lockedUntil: Date | null = null;
  for (const [key, limits] of [
    [keys.browser, GATE_THROTTLE.browser],
    [keys.network, GATE_THROTTLE.network],
  ] as const) {
    if (!key) continue;
    const failure = await store.recordGateFailure({
      keyHash: key,
      ...limits,
      now,
    });
    if (
      failure.lockedUntil &&
      (!lockedUntil || failure.lockedUntil > lockedUntil)
    )
      lockedUntil = failure.lockedUntil;
  }
  return { ok: false, lockedUntil };
}
