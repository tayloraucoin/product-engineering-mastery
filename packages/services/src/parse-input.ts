/** Input through its validator, or Invalid naming each field that failed. */

import type { z } from "zod";

import { fieldErrors } from "@pem/validators/field-errors";

import { Invalid } from "./errors.ts";

export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const fields = fieldErrors(result.error);
  const named = Object.keys(fields).filter((field) => field !== "_");
  const subject = named.length ? named.join(", ") : "the input";
  throw new Invalid(
    `Check ${subject}: ${Object.values(fields).flat().join(" ")}`,
    fields,
  );
}
