import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/cn";
import { buttonVariants } from "./button.variants";

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>;

/**
 * shadcn's Vega button on Base UI's Button (CS-02, CS-03). Base UI's `render`
 * prop renders it as another element, such as a link, while keeping the
 * button's keyboard and disabled behaviour; for a plain styled link, use
 * `buttonVariants` on the link instead.
 */
export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
