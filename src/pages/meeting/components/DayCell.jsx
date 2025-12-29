import React from "react";

export default function DayCell({ day, isCurrentMonth, isToday, events, onDayDetail }) {

  const hasEvents = events && events.length > 0;

  function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return Number.POSITIVE_INFINITY;
    const m = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return Number.POSITIVE_INFINITY;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return Number.POSITIVE_INFINITY;
    return hh * 60 + mm;
  }

  const previewLimit = 3;
  const previewEvents = hasEvents
    ? [...events].sort((a, b) => parseTimeToMinutes(a?.time) - parseTimeToMinutes(b?.time)).slice(0, previewLimit)
    : [];
  const remainingCount = hasEvents ? Math.max(0, events.length - previewEvents.length) : 0;

  // keyboard handler for accessibility
  function handleKey(e) {
    if (!hasEvents) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDayDetail(day);
    }
  }

  return (
    <div
      className={`rounded-lg ${isCurrentMonth ? 'bg-white shadow-sm hover:bg-teal-50' : 'bg-gray-50 text-gray-400'} daycell ${hasEvents ? 'daycell-has-events' : ''} ${!isCurrentMonth ? 'outside-month' : ''}`}
      onClick={() => { if (hasEvents) onDayDetail(day); }}
      role={hasEvents ? "button" : undefined}
      tabIndex={hasEvents ? 0 : -1}
      onKeyDown={handleKey}
      aria-pressed={hasEvents ? false : undefined}
      title={hasEvents ? `${events.length} cuộc họp` : undefined}
    >
      <div className="daycell-header">
        <div className="text-sm font-semibold">
          {isToday ? <span className="today-indicator">{day.getDate()}</span> : <span>{day.getDate()}</span>}
        </div>
        <span className="sr-only">{hasEvents ? `Ngày có ${events.length} cuộc họp` : `Không có cuộc họp`}</span>
      </div>

      <div className="daycell-events" aria-hidden>
        {previewEvents.map((ev) => (
          <div
            key={ev.id}
            className="daycell-event rounded-md border border-gray-100 bg-white/80 px-2 py-1"
            title={`${ev.time || "-"} ${ev.title || ""}${ev.location ? ` • ${ev.location}` : ""}`}
          >
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[11px] text-gray-500 tabular-nums shrink-0">{ev.time || "--:--"}</span>
              <span className="text-xs font-medium text-gray-800 truncate">{ev.title || "(Không tiêu đề)"}</span>
            </div>
            {ev.location ? (
              <div className="text-[11px] text-gray-500 truncate mt-0.5">{ev.location}</div>
            ) : null}
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="daycell-event text-[11px] text-gray-500">+{remainingCount} cuộc họp khác</div>
        )}
      </div>

      {/* small corner badge showing count */}
      {hasEvents && (
        <div className="daycell-badge" aria-hidden>
          {events.length}
        </div>
      )}
    </div>
  );
}
