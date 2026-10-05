/**
 * shadcn's Vega spinner (base-vega, shadcn 4.21.0, read 2026-10-04), mapped
 * onto house tokens by docs/design/component-sources.md: as upstream, but for cn.
 *
 * Inline only: a page waits on a skeleton of its final layout (canon A-18).
 * Inside a control that has its own name, pass aria-hidden so the name stays
 * the control's.
 */
import { Loader2Icon } from "lucide-react";

import { cn } from "../../../lib/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
