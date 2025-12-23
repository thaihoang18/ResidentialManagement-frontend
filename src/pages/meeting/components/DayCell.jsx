import React from "react";
import { Button } from "@/components/ui/button";
import { CgMoreO } from "react-icons/cg";

export default function DayCell({ day, isCurrentMonth, isToday, events, onDayDetail, onEventClick }) {

  const hasEvents = events && events.length > 0;

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
      className={`rounded-lg ${isCurrentMonth ? 'bg-white shadow-sm hover:bg-purple-50' : 'bg-gray-50 text-gray-400'} daycell ${hasEvents ? 'daycell-has-events' : ''} ${!isCurrentMonth ? 'outside-month' : ''}`}
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
        {/* intentionally empty to preserve spacing and scroll behavior */}
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
