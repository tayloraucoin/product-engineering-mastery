import type { MetadataRoute } from "next";

import { brand } from "@pem/brand/brand";
import { oklchToHex } from "@pem/brand/color";
import { appIcon } from "@pem/brand/icon";

/** The web app manifest: every value from @pem/brand (D-STK-9). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    theme_color: oklchToHex(brand.theme.primary.light),
    // The brand has two colours (D-STK-9); the splash takes the lighter one,
    // close to the page background but not the --background token itself.
    background_color: oklchToHex(brand.theme.primaryForeground.light),
    icons: [{ src: appIcon.src, type: appIcon.type, sizes: "any" }],
  };
}
