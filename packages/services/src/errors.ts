/**
 * The domain errors (D-STK-8), from this one module. A service throws only
 * these; each transport maps them once to its own shape (tRPC codes in STK-14,
 * a status in a Route Handler), so no service knows how it was called.
 */

import type { FieldErrors } from "@pem/validators/field-errors";

export type DomainErrorCode =
  "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "INVALID";

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
  }
}

/** The thing asked for does not exist, or row-level security withholds it: the caller cannot tell which. */
export class NotFound extends DomainError {
  constructor(message: string, options?: ErrorOptions) {
    super("NOT_FOUND", message, options);
  }
}

/** The caller may not do this; a policy refused the write. */
export class Forbidden extends DomainError {
  constructor(message: string, options?: ErrorOptions) {
    super("FORBIDDEN", message, options);
  }
}

/** The write collides with what is there already. */
export class Conflict extends DomainError {
  constructor(message: string, options?: ErrorOptions) {
    super("CONFLICT", message, options);
  }
}

/** The input failed its validator; `fields` names each field that failed. */
export class Invalid extends DomainError {
  readonly fields: FieldErrors;

  constructor(message: string, fields: FieldErrors, options?: ErrorOptions) {
    super("INVALID", message, options);
    this.fields = fields;
  }
}

/** Postgres's codes for a row-level-security or privilege refusal, and a unique violation. */
const INSUFFICIENT_PRIVILEGE = "42501";
const UNIQUE_VIOLATION = "23505";

/** The Postgres error code on `error`, or on the error drizzle wrapped it in. */
function postgresCode(error: unknown): string | undefined {
  for (let current = error, depth = 0; current && depth < 3; depth += 1) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string") return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/**
 * A database error as a domain error, when it is one: a policy's refusal is
 * Forbidden, a unique violation is Conflict. Anything else is returned as it
 * came, for the transport to report as a fault.
 */
export function toDomainError(error: unknown, what: string): unknown {
  if (error instanceof DomainError) return error;
  const code = postgresCode(error);
  if (code === INSUFFICIENT_PRIVILEGE)
    return new Forbidden(`You cannot change this ${what}.`, { cause: error });
  if (code === UNIQUE_VIOLATION)
    return new Conflict(`This ${what} already exists.`, { cause: error });
  return error;
}
