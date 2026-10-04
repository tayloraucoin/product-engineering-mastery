import type { StaticImageData } from "next/image";

import mark from "../assets/mark.svg";

/**
 * The mark as the app icon. The importing app's bundler copies
 * `assets/mark.svg` into its build and returns the file's hashed URL, so the
 * icon is served from this package's own file, never a copy in the app.
 */
const markImage: StaticImageData = mark;

export const appIcon = {
  src: markImage.src,
  type: "image/svg+xml",
} as const;
