import { readFile } from "node:fs/promises";

/**
 * The brand font for generated images (the Open Graph image). next/og reads
 * TTF, OTF or WOFF, not the woff2 that `@pem/brand/font` serves, so the same
 * typeface ships a second time as `assets/fonts/brand-sans-image.ttf`.
 * Server-only: it reads the file at build or request time.
 */
export async function loadImageFont(): Promise<{
  name: string;
  data: ArrayBuffer;
}> {
  const file = await readFile(
    new URL("../assets/fonts/brand-sans-image.ttf", import.meta.url),
  );
  const data = file.buffer.slice(
    file.byteOffset,
    file.byteOffset + file.byteLength,
  ) as ArrayBuffer;
  return { name: "Brand Sans", data };
}
