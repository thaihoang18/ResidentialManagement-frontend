import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isValid, parse } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseYyyyMmDd(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  const str = String(value);
  if (!str) return undefined;

  const trimmed = str.length >= 10 ? str.slice(0, 10) : str;
  const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

/**
 * Controlled date picker that stores value as `yyyy-MM-dd`.
 *
 * - `value`: string (yyyy-MM-dd) | Date | ""
 * - `onChange`: receives next string value (yyyy-MM-dd) or ""
 */
function DatePicker({
  name,
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  required,
  className,
  align = "start",
}) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => parseYyyyMmDd(value), [value]);
  const displayValue = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal table-row-hover hover:bg-transparent hover:text-foreground",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            const next = date ? format(date, "yyyy-MM-dd") : "";
            onChange?.(next);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>

      {name ? (
        <input
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={typeof value === "string" ? value : value ? format(value, "yyyy-MM-dd") : ""}
          readOnly
          required={required}
        />
      ) : null}
    </Popover>
  );
}

export { DatePicker };
