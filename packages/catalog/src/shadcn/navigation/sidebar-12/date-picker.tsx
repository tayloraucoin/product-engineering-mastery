/**
 * shadcn's sidebar-12 block, date picker (base-vega, shadcn 4.21.0, read 2026-10-04),
 * mapped onto house tokens by docs/design/component-sources.md. MIT, see ../../LICENSE.
 */
import * as React from "react";

import { Calendar } from "@pem/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@pem/ui/sidebar";

export function DatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 12),
  );
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="bg-transparent [--cell-size:--spacing(8.5)]"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
