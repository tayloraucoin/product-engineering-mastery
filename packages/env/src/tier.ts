/**
 * The tier switch (codebase-conventions §5; D-STK-3). It names which backing
 * services a process talks to. Pure: it parses a value it is handed and never
 * reads process.env.
 */

export const TIER_SWITCH = "DATABASE_ENVIRONMENT";

export const TIERS = ["local", "staging", "production"] as const;

export type Tier = (typeof TIERS)[number];

/** Whether a string is a tier name. */
export function isTier(value: string): value is Tier {
  return (TIERS as readonly string[]).includes(value);
}

/**
 * The tier a raw switch value names. Unset or empty is `local`; production is
 * never a default. Anything else throws, naming the variable.
 */
export function parseTier(raw: string | undefined): Tier {
  const value = raw?.trim() ?? "";
  if (value === "") return "local";
  if (isTier(value)) return value;
  throw new Error(
    `${TIER_SWITCH} is "${value}"; set it to one of ${TIERS.join(", ")}, or leave it unset for local.`,
  );
}
