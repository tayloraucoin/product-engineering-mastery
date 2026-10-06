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
  "pwd",
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
  "secretkey",
  "privatekey",
  "accesskey",
  "servicerolekey",
  "signingkey",
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
 * Free text cannot be redacted by key, so every string value, an error's
 * message and stack included, is scrubbed of the shapes a secret or an address
 * takes. Each pattern replaces only the sensitive part, so the line stays
 * readable. Every pattern is anchored by a lookbehind or a literal and bounded,
 * so a long string costs linear time, never quadratic.
 */
const TEXT_PATTERNS: [pattern: RegExp, replacement: string][] = [
  // The password in a connection string: `postgres://user:<password>@host`.
  [
    /((?<![\w+.-])[a-z][\w+.-]{0,31}:\/\/[^\s:/@]{1,256}:)[^\s@/]{1,256}@/gi,
    `$1${REDACTED}@`,
  ],
  // An Authorization header's whole value, scheme included.
  [
    /((?<![\w-])authorization["']?\s*[:=]\s*["']?)(?:(?:Bearer|Basic|Token)\s+)?[^\s"',;]{1,4096}/gi,
    `$1${REDACTED}`,
  ],
  // A bearer credential anywhere else; short words after "bearer" are prose.
  [/(?<![\w-])(Bearer)\s+[\w.~+/=-]{8,4096}/gi, `$1 ${REDACTED}`],
  // A JSON Web Token.
  [/(?<![\w-])eyJ[\w-]{1,4096}\.[\w-]{1,4096}\.[\w-]{0,4096}/g, REDACTED],
  // An OAuth code in a URL's query, and nowhere else (`code=23505` is a database error).
  [/([?&]code=)[^&\s"'#]{1,4096}/g, `$1${REDACTED}`],
  // An email address; `pkg@1.2.3`, a version, is not one.
  [
    /(?<![\w.+-])[\w.+-]{1,64}@(?!\d+(?:\.\d+)+\b)[\w-]{1,63}(?:\.[\w-]{1,63}){1,8}/g,
    REDACTED,
  ],
];

/**
 * `name=value`, `name: value` and `"name":"value"` in free text, whose name the
 * key rule (`isSecretKey`) calls secret: one rule for keys and for text.
 */
const PAIR =
  /(?<![\w-])([\w-]{1,64})(=|:[ \t]*|"[ \t]*:[ \t]*")([^&\s"',;]{1,4096})/g;

/** `text` with every connection-string password, credential, JWT, OAuth code, email address and secret-named value replaced. */
export function scrubText(text: string): string {
  const scrubbed = TEXT_PATTERNS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text,
  );
  return scrubbed.replace(PAIR, (pair, name: string, separator: string) =>
    isSecretKey(name) ? `${name}${separator}${REDACTED}` : pair,
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

/** A copy of `value` with every secret key's value replaced by `[redacted]` and every string value scrubbed (keys are not). */
export function redactValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrubText(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (value instanceof Error) return describeError(value, depth);
  // A logger never throws: an invalid Date has no ISO form.
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? "[invalid date]"
      : value.toISOString();
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
