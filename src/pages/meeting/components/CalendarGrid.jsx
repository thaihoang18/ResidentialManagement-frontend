import React from "react";
import DayCell from "./DayCell";

export default function CalendarGrid({ weeks, month, events, onDayDetail, onEventClick }) {
  return (
    <div className="grid grid-cols-7 gap-3 mt-3">
      {weeks.map((week, wi) =>
        week.map((day, di) => {
          const iso = day.toISOString().slice(0, 10);
          const dayEvents = events.filter(ev => ev.date === iso);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = iso === new Date().toISOString().slice(0, 10);
          return (
            <DayCell
              key={`${wi}-${di}`}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              events={dayEvents}
              onDayDetail={onDayDetail}
              onEventClick={onEventClick}
            />
          );
        })
      )}
    </div>
  );
}
