"use client";

/**
 * shadcn's Vega toggle (base-vega, shadcn 4.21.0, read 2026-10-04), mapped
 * onto house tokens by docs/design/component-sources.md: cva in toggle.variants.ts; shadow-resting; ring-3.
 */
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/cn";
import { toggleVariants } from "./toggle.variants";

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
