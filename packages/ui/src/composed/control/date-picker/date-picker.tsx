"use client";

/**
 * shadcn's date picker recipe (ui.shadcn.com/docs/components/date-picker,
 * read 2026-10-04): a button that opens a calendar in a popover and shows the
 * chosen day. Controlled or not, like Base UI's own parts.
 */
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button/button";
import { Calendar } from "../../../primitives/control/calendar/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../primitives/feedback/popover/popover";
import { DATE_PICKER_COPY } from "./copy";

type DatePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  /** How the chosen day reads on the trigger; date-fns "PPP" by default. */
  formatValue?: (date: Date) => string;
  disabled?: boolean;
  /** Days that cannot be chosen, in react-day-picker's matcher form. */
  disabledDays?: React.ComponentProps<typeof Calendar>["disabled"];
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = DATE_PICKER_COPY.placeholder,
  formatValue = (day) => format(day, "PPP"),
  disabled,
  disabledDays,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const date = value ?? uncontrolled;
  const shown = date ? formatValue(date) : placeholder;
  const valueId = React.useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            data-empty={!date}
            className={cn(
              "w-56 justify-start text-left font-normal",
              className,
            )}
            // The name carries the value, so it is heard without opening:
            // "Start date, October 14th, 2026".
            aria-label={ariaLabel ? `${ariaLabel}, ${shown}` : undefined}
            aria-labelledby={
              ariaLabelledby ? `${ariaLabelledby} ${valueId}` : undefined
            }
            aria-describedby={ariaDescribedby}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        <span id={valueId}>{shown}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          disabled={disabledDays}
          onSelect={(next) => {
            if (value === undefined) setUncontrolled(next);
            onValueChange?.(next);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, type DatePickerProps };
