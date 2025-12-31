import React from "react";

export default function DayCell({ day, isCurrentMonth, isToday, events, onDayDetail }) {
  const hasEvents = Array.isArray(events) && events.length > 0;

  function timeToMinutes(value) {
    if (!value || typeof value !== "string") return Number.POSITIVE_INFINITY;
    const [hhStr, mmStr] = value.split(":");
    const hh = Number.parseInt(hhStr, 10);
    const mm = Number.parseInt(mmStr, 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return Number.POSITIVE_INFINITY;
    return hh * 60 + mm;
  }

  const sortedEvents = hasEvents
    ? [...events].sort((a, b) => timeToMinutes(a?.time) - timeToMinutes(b?.time))
    : [];

  const maxVisibleChips = 3;
  const visibleChips = sortedEvents.slice(0, maxVisibleChips);
  const remainingCount = Math.max(0, sortedEvents.length - visibleChips.length);

  function hexToRgbTriplet(hex) {
    if (!hex || typeof hex !== "string") return null;
    let value = hex.trim();
    if (!value.startsWith("#")) return null;
    value = value.slice(1);
    if (value.length === 3) {
      const r = Number.parseInt(value[0] + value[0], 16);
      const g = Number.parseInt(value[1] + value[1], 16);
      const b = Number.parseInt(value[2] + value[2], 16);
      if ([r, g, b].some((n) => !Number.isFinite(n))) return null;
      return `${r}, ${g}, ${b}`;
    }
    if (value.length === 6) {
      const r = Number.parseInt(value.slice(0, 2), 16);
      const g = Number.parseInt(value.slice(2, 4), 16);
      const b = Number.parseInt(value.slice(4, 6), 16);
      if ([r, g, b].some((n) => !Number.isFinite(n))) return null;
      return `${r}, ${g}, ${b}`;
    }
    return null;
  }

  const primaryEventColor = sortedEvents[0]?.color || "#32f1cd";
  const meetingColorRgb = hexToRgbTriplet(primaryEventColor) || "50, 241, 205";

  const distinctColors = [];
  const seen = new Set();
  for (const ev of sortedEvents) {
    const raw = String(ev?.color || "").trim().toLowerCase();
    const rgb = hexToRgbTriplet(raw);
    if (!rgb) continue;
    if (seen.has(rgb)) continue;
    seen.add(rgb);
    distinctColors.push(rgb);
    if (distinctColors.length >= 3) break;
  }

  const meetingColor2Rgb = distinctColors[1] || meetingColorRgb;
  const meetingColor3Rgb = distinctColors[2] || meetingColor2Rgb;

  function openDetail() {
    onDayDetail?.(day);
  }

  function handleKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail();
    }
  }

  return (
    <div
      className={`rounded-lg daycell ${isCurrentMonth ? 'bg-white/90 border border-border/60 shadow-md hover:bg-white hover:shadow-lg' : 'bg-white/60 border border-border/40 text-muted-foreground'} ${hasEvents ? 'daycell-has-events' : ''} ${!isCurrentMonth ? 'outside-month' : ''}`}
      style={
        hasEvents && isCurrentMonth
          ? {
              "--meeting-color-rgb": meetingColorRgb,
              "--meeting-color2-rgb": meetingColor2Rgb,
              "--meeting-color3-rgb": meetingColor3Rgb,
            }
          : undefined
      }
      onClick={openDetail}
      role="button"
      tabIndex={0}
      onKeyDown={handleKey}
      aria-pressed={false}
      title={hasEvents ? `${events.length} cuộc họp` : "Xem chi tiết"}
    >
      <div className="daycell-header">
        <div className="text-sm font-semibold">
          {isToday ? <span className="today-indicator">{day.getDate()}</span> : <span>{day.getDate()}</span>}
        </div>
        <span className="sr-only">{hasEvents ? `Ngày có ${events.length} cuộc họp` : `Ngày không có cuộc họp`}</span>
      </div>

      {hasEvents ? (
        <div className="mt-2 flex-1 min-h-0 overflow-hidden flex flex-col gap-1.5 pr-10 pb-8">
          {visibleChips.map((ev, idx) => {
            const topic = String(ev?.topic || ev?.title || ev?.name || "Cuộc họp");
            const time = ev?.time ? String(ev.time) : "";
            const display = time ? `${time} • ${topic}` : topic;
            const accent = ev?.color || primaryEventColor;

            return (
              <div
                key={`${ev?.id ?? ev?.meetingId ?? idx}`}
                className="daycell-task-chip"
                title={display}
                style={{ borderLeftColor: accent }}
              >
                <span className="truncate">{display}</span>
              </div>
            );
          })}

          {remainingCount > 0 ? (
            <div className="daycell-task-chip daycell-task-chip-more" title={`${remainingCount} cuộc họp khác`}>
              <span className="truncate">+{remainingCount}…</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 min-h-0" />
      )}

      {/* bottom-right badge showing number of meetings */}
      {hasEvents && (
        <div className="daycell-badge" aria-hidden>
          {events.length}
        </div>
      )}
    </div>
  );
}
