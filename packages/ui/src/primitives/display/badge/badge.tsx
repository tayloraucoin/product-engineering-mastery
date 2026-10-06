/**
 * shadcn's Vega badge (base-vega, shadcn 4.21.0, read 2026-10-04), mapped
 * onto house tokens by docs/design/component-sources.md: cva in badge.variants.ts; ring-3; the focus ring appears at once.
 */
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/cn";
import { badgeVariants } from "./badge.variants";

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
