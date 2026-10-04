import { ImageResponse } from "next/og";

import { brand } from "@pem/brand/brand";
import { oklchToHex } from "@pem/brand/color";

export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The image renderer reads inline styles only: no stylesheet, so no preset
 * tokens. Colours come from @pem/brand as hex; these are the image's layout.
 * Its font is next/og's built-in Geist Regular, the placeholder brand font's
 * family; a product with another font passes its file in `fonts`.
 */
const frame = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  width: "100%",
  height: "100%",
  padding: 80,
  gap: 24,
  backgroundColor: oklchToHex(brand.theme.primary.light),
  color: oklchToHex(brand.theme.primaryForeground.light),
} as const;

const title = { fontSize: 88, lineHeight: 1.05 } as const;
const tagline = { fontSize: 32, opacity: 0.8 } as const;

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={frame}>
      <div style={title}>{brand.name}</div>
      <div style={tagline}>{brand.description}</div>
    </div>,
    size,
  );
}
