import React from "react";

export default function DayCell({ day, isCurrentMonth, isToday, events, onDayDetail }) {
  const hasEvents = Array.isArray(events) && events.length > 0;

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
      className={`rounded-lg daycell ${
        hasEvents
          ? "daycell-has-events"
          : isCurrentMonth
            ? "bg-background/60 table-row-hover hover:bg-transparent border border-border/40 shadow-xs hover:shadow-sm transition-shadow"
            : "bg-muted/30 text-muted-foreground table-row-hover hover:bg-transparent border border-border/20 shadow-xs"
      } ${!isCurrentMonth ? 'outside-month' : ''}`}
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

      {/* bottom-right badge showing number of meetings */}
      {hasEvents && (
        <div className="daycell-badge" aria-hidden>
          {events.length}
        </div>
      )}
    </div>
  );
}
