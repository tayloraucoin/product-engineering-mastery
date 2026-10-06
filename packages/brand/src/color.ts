/**
 * OKLCH to sRGB hex, for the consumers that cannot read the preset's OKLCH
 * values: the web app manifest and the Open Graph image renderer.
 * brand.ts keeps OKLCH, so it compares to preset.css as written.
 */

const OKLCH =
  /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.%]+\s*)?\)$/;

/** sRGB transfer function, clamped to the gamut. */
function encode(linear: number): number {
  const clamped = Math.min(1, Math.max(0, linear));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

function toByte(channel: number): string {
  return Math.round(encode(channel) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** `oklch(L C H)` (L as a number or a percentage; alpha ignored) to `#rrggbb`. */
export function oklchToHex(value: string): string {
  const match = OKLCH.exec(value.trim());
  if (!match) throw new Error(`Not an oklch() colour: ${value}`);
  const [, lightness, percent, chroma, hue] = match;
  const l = Number(lightness) / (percent ? 100 : 1);
  const c = Number(chroma);
  const h = (Number(hue) * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lCone = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCone = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const red =
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone;
  const green =
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone;
  const blue =
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone;

  return `#${toByte(red)}${toByte(green)}${toByte(blue)}`;
}
