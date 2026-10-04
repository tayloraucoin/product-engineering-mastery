/**
 * The machine's LAN IPv4 addresses, for `allowedDevOrigins` in each app's
 * next.config.ts and for the URLs `yarn web:dev:local` prints (STK-19,
 * D-STK-19).
 *
 * Next.js 16 blocks cross-origin requests for `/_next/*` and HMR in dev unless
 * the origin is listed, so a phone on the LAN gets the server-rendered page
 * but its client JavaScript never hydrates. Loopback and link-local
 * (169.254.x.x) addresses are left out; a failure to read the interfaces
 * yields an empty list, never a crash.
 */

import os from "node:os";

export function getLocalDevOrigins(): string[] {
  try {
    const addresses = Object.values(os.networkInterfaces())
      .flat()
      .filter(
        (iface) =>
          iface !== undefined &&
          !iface.internal &&
          iface.family === "IPv4" &&
          !iface.address.startsWith("169.254."),
      )
      .map((iface) => iface!.address);
    return [...new Set(addresses)];
  } catch {
    return [];
  }
}
