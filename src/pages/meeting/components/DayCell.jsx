import React from "react";
import { Button } from "@/components/ui/button";

export default function DayCell({ day, isCurrentMonth, isToday, events, onDayDetail, onEventClick }) {
  const iso = day.toISOString().slice(0, 10);
  return (
    <div className={`rounded-lg min-h-[110px] p-3 overflow-hidden ${isCurrentMonth ? 'bg-white shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
      <div className="flex justify-between items-start">
        <div className={`text-sm font-semibold ${isToday ? 'bg-indigo-600 text-white px-2 rounded-full' : ''}`}>{day.getDate()}</div>
        <Button variant="ghost" size="icon" onClick={() => onDayDetail(day)} className="text-xs text-indigo-600 hover:underline" style={{ backgroundColor: 'transparent', color: '#4f46e5' }}>
          <span className="sr-only">Chi tiết</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><circle cx="12" cy="16" r="1"/></svg>
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-2 max-h-36 overflow-auto pr-1">
        {events.slice(0,3).map(ev => (
          <div key={ev.id} onClick={() => onEventClick(ev)} className="cursor-pointer w-full text-left px-3 py-2 rounded-md bg-white border border-gray-100 hover:shadow-sm overflow-hidden" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm truncate">{ev.title}</div>
              <div className="text-[12px] text-gray-600 ml-2">{ev.time}</div>
            </div>
            <div className="text-[12px] text-gray-500 truncate">{ev.location}</div>
          </div>
        ))}
        {events.length > 3 && (
          <div className="text-xs text-gray-500">+{events.length - 3} thêm</div>
        )}
      </div>
    </div>
  );
}
