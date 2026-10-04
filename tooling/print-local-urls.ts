/**
 * Prints the URLs a phone on the same network opens while `yarn web:dev:local`
 * runs (STK-19, D-STK-19).
 *
 *   node tooling/print-local-urls.ts [port]
 */

import { getLocalDevOrigins } from "./local-dev-origins.ts";

const port = Number(process.argv[2] ?? 3000);
if (!Number.isInteger(port) || port <= 0) {
  console.error(`print-local-urls: "${process.argv[2]}" is not a port`);
  process.exit(1);
}

const origins = getLocalDevOrigins();
console.log(`\n  This machine: http://localhost:${port}`);
if (origins.length === 0) {
  console.log(
    "  No LAN address found: connect to a network to test from a phone.\n",
  );
} else {
  for (const origin of origins)
    console.log(`  On the LAN:   http://${origin}:${port}`);
  console.log("  Open a LAN URL on a phone on the same Wi-Fi.\n");
}
