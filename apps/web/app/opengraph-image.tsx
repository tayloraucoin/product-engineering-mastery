/* eslint-disable pem-tokens/no-raw-values -- next/og renders inline styles only, with no stylesheet, so no preset token can reach the image; its colours and font come from @pem/brand. */
import { ImageResponse } from "next/og";

import { brand } from "@pem/brand/brand";
import { oklchToHex } from "@pem/brand/color";
import { loadImageFont } from "@pem/brand/image-font";

export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const font = await loadImageFont();
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        width: "100%",
        height: "100%",
        padding: 80,
        gap: 24,
        fontFamily: font.name,
        backgroundColor: oklchToHex(brand.theme.primary.light),
        color: oklchToHex(brand.theme.primaryForeground.light),
      }}
    >
      <div style={{ fontSize: 88, lineHeight: 1.05 }}>{brand.name}</div>
      <div style={{ fontSize: 32, opacity: 0.8 }}>{brand.description}</div>
    </div>,
    { ...size, fonts: [{ ...font, weight: 400, style: "normal" }] },
  );
}
