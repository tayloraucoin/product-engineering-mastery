/**
 * What a log line may never carry (STK-5): secrets, request bodies and
 * personal data. Matching is by key, at any depth, case and separator
 * ignored, so `apiKey`, `api_key` and `API-KEY` are one key.
 */

export const REDACTED = "[redacted]";

/** Keys whose value is replaced whole. Compared after lower-casing and dropping `-` and `_`. */
const SECRET_KEYS = [
  "password",
  "passwd",
  "secret",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "setcookie",
  "apikey",
  "privatekey",
  "clientsecret",
  "session",
  // Request bodies, by the names this stack gives them (a tRPC procedure's is `input`).
  "input",
  "payload",
  // Personal data that no suffix below catches.
  "ip",
  "firstname",
  "lastname",
  "fullname",
  "displayname",
];

/**
 * A key that ends in one of these is redacted too: `stripeSecret`,
 * `resendApiKey`, `idToken`, `requestBody`, `userEmail`, `phoneNumber`,
 * `ipAddress`.
 */
const SECRET_SUFFIXES = [
  "secret",
  "token",
  "apikey",
  "password",
  "cookie",
  "body",
  "email",
  "phone",
  "phonenumber",
  "address",
];

const normalise = (key: string) => key.toLowerCase().replace(/[-_]/g, "");

export function isSecretKey(key: string): boolean {
  const k = normalise(key);
  return (
    SECRET_KEYS.includes(k) || SECRET_SUFFIXES.some((end) => k.endsWith(end))
  );
}

const MAX_DEPTH = 6;

/** An Error as its name, message, stack and cause; its other own properties are dropped, never printed. */
function describeError(error: Error, depth: number): Record<string, unknown> {
  const described: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };
  if (error.stack) described.stack = error.stack;
  if (error.cause !== undefined)
    described.cause = redactValue(error.cause, depth + 1);
  return described;
}

/** A copy of `value` with every secret key's value replaced by `[redacted]`. */
export function redactValue(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (value instanceof Error) return describeError(value, depth);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value))
    return value.map((item) => redactValue(item, depth + 1));
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value))
    copy[key] = isSecretKey(key) ? REDACTED : redactValue(item, depth + 1);
  return copy;
}

export function redactFields(
  fields: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  return redactValue(fields) as Record<string, unknown>;
}
