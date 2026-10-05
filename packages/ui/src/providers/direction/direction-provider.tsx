"use client";

/**
 * shadcn's direction item (base-vega, shadcn 4.21.0, read 2026-10-04): Base
 * UI's provider, re-exported. It sets reading direction for Base UI parts
 * (arrow keys, sliders, menus); the page still sets `dir` on <html>.
 */
export {
  DirectionProvider,
  useDirection,
} from "@base-ui/react/direction-provider";
