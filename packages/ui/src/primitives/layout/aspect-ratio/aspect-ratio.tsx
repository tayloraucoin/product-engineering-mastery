/**
 * shadcn's Vega aspect ratio (base-vega, shadcn 4.21.0, read 2026-10-04), mapped
 * onto house tokens by docs/design/component-sources.md.
 */
import { cn } from "../../../lib/cn";

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}

export { AspectRatio };
