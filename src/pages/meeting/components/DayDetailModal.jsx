import React from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export default function DayDetailModal({ day, events, onClose, onEventClick }) {
  if (!day) return null;
  // Helper to get local date string YYYY-MM-DD
  function getLocalDateString(day) {
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  }
  const iso = getLocalDateString(day);
  const dayEvents = events.filter(ev => ev.date === iso);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold accent-text">Chi tiết ngày {day.getDate()}/{day.getMonth()+1}/{day.getFullYear()}</h2>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={onClose} className="accent-text close-btn"><XIcon className="w-5 h-5"/></Button>
        </div>
        <div className="mb-3 text-sm text-gray-600">Tổng số cuộc họp: {dayEvents.length}</div>
        <div className="flex flex-col gap-2 max-h-60 overflow-auto">
          {dayEvents.length === 0 && (
            <div className="text-gray-400 text-sm">Không có cuộc họp nào.</div>
          )}
          {dayEvents.map(ev => (
            <div
              key={ev.id}
              className="border rounded-md p-2 bg-gray-50 flex flex-col gap-1 event-accent cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => { onEventClick(ev); onClose(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventClick(ev); onClose(); } }}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{ev.title}</div>
                {/* optional: show time on the right */}
                <div className="text-xs text-gray-500">{ev.time}</div>
              </div>
              <div className="text-xs text-gray-500">{ev.location}</div>
              <div className="text-xs text-gray-600 truncate">{ev.description}</div>
            </div>
          ))}
        </div>
        {/* Only X in header to close (no extra Đóng button) */}
      </div>
    </div>
  );
}
