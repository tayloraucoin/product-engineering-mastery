"use client";

/**
 * shadcn's Vega label (base-vega, shadcn 4.21.0, read 2026-10-04), mapped
 * onto house tokens by docs/design/component-sources.md: as upstream, but for cn.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
