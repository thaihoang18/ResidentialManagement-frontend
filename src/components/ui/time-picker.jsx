import * as React from "react";
import { Clock as ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function clampInt(value, min, max) {
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) return undefined;
  return Math.min(max, Math.max(min, n));
}

function parseHHmm(value) {
  if (!value) return { hour: undefined, minute: undefined };
  const str = String(value);
  const m = str.match(/^\s*(\d{1,2})\s*:\s*(\d{1,2})\s*$/);
  if (!m) return { hour: undefined, minute: undefined };
  return {
    hour: clampInt(m[1], 0, 23),
    minute: clampInt(m[2], 0, 59),
  };
}

/**
 * Controlled time picker.
 * - Displays and stores value as `HH:mm`
 * - Uses shadcn primitives (Button + Popover)
 */
function TimePicker({
  name,
  value,
  onChange,
  placeholder = "Chọn giờ",
  disabled,
  required,
  className,
  align = "start",
  minuteStep = 5,
}) {
  const [open, setOpen] = React.useState(false);
  const parsed = React.useMemo(() => parseHHmm(value), [value]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const step = clampInt(minuteStep, 1, 30) ?? 5;
  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = React.useMemo(() => {
    const list = [];
    for (let m = 0; m < 60; m += step) list.push(m);
    return list;
  }, [step]);

  const [selectedHour, setSelectedHour] = React.useState(0);
  const [selectedMinute, setSelectedMinute] = React.useState(0);

  const hourListRef = React.useRef(null);
  const minuteListRef = React.useRef(null);
  const rafRef = React.useRef(0);

  const ITEM_HEIGHT = 32; // matches h-8
  const PAD_Y = 80; // creates center lane space

  const displayValue =
    parsed.hour != null && parsed.minute != null ? `${pad2(parsed.hour)}:${pad2(parsed.minute)}` : "";

  React.useEffect(() => {
    if (!open) return;

    const initHour = parsed.hour != null ? parsed.hour : 0;
    const initMinute = parsed.minute != null ? parsed.minute : 0;
    const nearestMinuteIndex = minutes.length
      ? Math.max(0, Math.min(minutes.length - 1, Math.round(initMinute / step)))
      : 0;
    const snappedMinute = minutes[nearestMinuteIndex] ?? 0;

    setSelectedHour(initHour);
    setSelectedMinute(snappedMinute);

    // Scroll selected into center lane.
    requestAnimationFrame(() => {
      const hourEl = hourListRef.current?.querySelector(`[data-value=\"${initHour}\"]`);
      hourEl?.scrollIntoView({ block: "center" });
      const minEl = minuteListRef.current?.querySelector(`[data-value=\"${snappedMinute}\"]`);
      minEl?.scrollIntoView({ block: "center" });
    });
  }, [open, parsed.hour, parsed.minute, minutes, step]);

  React.useEffect(() => {
    if (!open) return;
    onChangeRef.current?.(`${pad2(selectedHour)}:${pad2(selectedMinute)}`);
  }, [open, selectedHour, selectedMinute]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function readIndexFromScroll(container, itemCount) {
    if (!container) return 0;
    const centerY = container.scrollTop + container.clientHeight / 2;
    const raw = (centerY - PAD_Y - ITEM_HEIGHT / 2) / ITEM_HEIGHT;
    const idx = Math.round(raw);
    return Math.max(0, Math.min(itemCount - 1, idx));
  }

  function onHourScroll() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const idx = readIndexFromScroll(hourListRef.current, hours.length);
      setSelectedHour(hours[idx] ?? 0);
    });
  }

  function onMinuteScroll() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const idx = readIndexFromScroll(minuteListRef.current, minutes.length);
      setSelectedMinute(minutes[idx] ?? 0);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-60 p-3">
        <div className="relative flex items-stretch gap-3">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 rounded-md bg-accent pointer-events-none" />

          <div className="flex-1">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Giờ</div>
            <div
              ref={hourListRef}
              onScroll={onHourScroll}
              className="h-52 overflow-y-auto snap-y snap-mandatory rounded-md border bg-background"
            >
              <div className="py-20">
                {hours.map((h) => {
                  const selected = selectedHour === h;
                  return (
                    <button
                      key={h}
                      data-value={h}
                      type="button"
                      className={cn(
                        "h-8 w-full snap-center text-center text-sm",
                        selected ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setSelectedHour(h);
                        hourListRef.current?.querySelector(`[data-value=\"${h}\"]`)?.scrollIntoView({ block: "center" });
                      }}
                    >
                      {pad2(h)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Phút</div>
            <div
              ref={minuteListRef}
              onScroll={onMinuteScroll}
              className="h-52 overflow-y-auto snap-y snap-mandatory rounded-md border bg-background"
            >
              <div className="py-20">
                {minutes.map((m) => {
                  const selected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      data-value={m}
                      type="button"
                      className={cn(
                        "h-8 w-full snap-center text-center text-sm",
                        selected ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}
                      onClick={() => {
                        setSelectedMinute(m);
                        minuteListRef.current?.querySelector(`[data-value=\"${m}\"]`)?.scrollIntoView({ block: "center" });
                      }}
                    >
                      {pad2(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>

      {name ? (
        <input
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={typeof value === "string" ? value : ""}
          readOnly
          required={required}
        />
      ) : null}
    </Popover>
  );
}

export { TimePicker };
