/**
 * Next's `env` block inlines every value it holds into every bundle, client
 * chunks included (D-STK-4). This is the one door into it: it takes the
 * resolved public values and refuses any name without the NEXT_PUBLIC_
 * prefix, so a secret cannot ride in.
 */

export const PUBLIC_PREFIX = "NEXT_PUBLIC_";

/** The values for next.config.ts's `env`; throws on a name without the public prefix. Unset values are left out. */
export function nextPublicEnv(
  values: Readonly<Record<string, string | undefined>>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith(PUBLIC_PREFIX))
      throw new Error(
        `${name} cannot go in next.config.ts's env block: every value there reaches the browser. Only ${PUBLIC_PREFIX}* names may.`,
      );
    if (value !== undefined) out[name] = value;
  }
  return out;
}
