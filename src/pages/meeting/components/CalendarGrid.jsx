import React from "react";
import DayCell from "./DayCell";

export default function CalendarGrid({ weeks, month, events, onDayDetail }) {
  // Helper to get local date string YYYY-MM-DD
  function getLocalDateString(day) {
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  }
  return (
    <div className="calendar-grid mt-3">
      {weeks.map((week, wi) =>
        week.map((day, di) => {
          const iso = getLocalDateString(day);
          const dayEvents = events.filter(ev => ev.date === iso);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = iso === getLocalDateString(new Date());
          return (
            <DayCell
              key={`${wi}-${di}`}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              events={dayEvents}
              onDayDetail={onDayDetail}
            />
          );
        })
      )}
    </div>
  );
}
