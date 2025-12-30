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
      className={`rounded-lg ${isCurrentMonth ? 'bg-background/60 hover:bg-accent/40' : 'bg-muted/30 text-muted-foreground'} daycell ${hasEvents ? 'daycell-has-events' : ''} ${!isCurrentMonth ? 'outside-month' : ''}`}
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
