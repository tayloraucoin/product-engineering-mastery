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

/**
 * Free text cannot be redacted by key, so every string, an error's message and
 * stack included, is scrubbed of the shapes a secret or an address takes.
 * Each pattern replaces only the sensitive part, so the line stays readable.
 */
const TEXT_PATTERNS: [pattern: RegExp, replacement: string][] = [
  // An email address.
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, REDACTED],
  // An Authorization value: `Bearer <token>`, `Basic <credentials>`.
  [/\b(Bearer|Basic)\s+[\w.~+/=-]+/gi, `$1 ${REDACTED}`],
  // A JSON Web Token.
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, REDACTED],
  // A secret in a URL's query or a `key=value` pair.
  [
    /\b((?:access_|refresh_|id_)?token|api_?key|apikey|secret|password|code|signature|sig)=[^&\s"']+/gi,
    `$1=${REDACTED}`,
  ],
];

/** `text` with every email address, bearer credential, JWT and secret query value replaced. */
export function scrubText(text: string): string {
  return TEXT_PATTERNS.reduce(
    (scrubbed, [pattern, replacement]) =>
      scrubbed.replace(pattern, replacement),
    text,
  );
}

/** An Error as its name, scrubbed message and stack, and cause; its other own properties are dropped, never printed. */
function describeError(error: Error, depth: number): Record<string, unknown> {
  const described: Record<string, unknown> = {
    name: error.name,
    message: scrubText(error.message),
  };
  if (error.stack) described.stack = scrubText(error.stack);
  if (error.cause !== undefined)
    described.cause = redactValue(error.cause, depth + 1);
  return described;
}

/** A copy of `value` with every secret key's value replaced by `[redacted]` and every string scrubbed. */
export function redactValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrubText(value);
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
