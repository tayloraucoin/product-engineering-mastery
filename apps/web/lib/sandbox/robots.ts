/**
 * Noindex for the sandbox (S12, D-LAB-42): `next.config.ts`'s `headers()`
 * returns this array, so every response under `/experimental` and `/admin`,
 * the gate included, carries `X-Robots-Tag: noindex, nofollow`. Each layout
 * also sets robots metadata. No robots file disallows the paths: a crawler
 * that may not fetch a page never reads its noindex. `proxy.ts` is untouched.
 */

import type { NextConfig } from "next";

type HeaderRule = Awaited<
  ReturnType<NonNullable<NextConfig["headers"]>>
>[number];

const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

export const SANDBOX_NOINDEX_HEADERS: HeaderRule[] = [
  { source: "/experimental/:path*", headers: NOINDEX },
  { source: "/admin/:path*", headers: NOINDEX },
];
