import React from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export default function DayDetailModal({ day, events, onClose, onEventClick }) {
  if (!day) return null;
  const iso = day.toISOString().slice(0, 10);
  const dayEvents = events.filter(ev => ev.date === iso);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Chi tiết ngày {day.getDate()}/{day.getMonth()+1}/{day.getFullYear()}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><XIcon className="w-5 h-5"/></Button>
        </div>
        <div className="mb-3 text-sm text-gray-600">Tổng số cuộc họp: {dayEvents.length}</div>
        <div className="flex flex-col gap-2 max-h-60 overflow-auto">
          {dayEvents.length === 0 && (
            <div className="text-gray-400 text-sm">Không có cuộc họp nào.</div>
          )}
          {dayEvents.map(ev => (
            <div key={ev.id} className="border rounded-md p-2 bg-gray-50 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{ev.title}</div>
                <Button variant="ghost" size="icon" onClick={() => { onEventClick(ev); onClose(); }}><span className="sr-only">Xem</span><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><circle cx="12" cy="16" r="1"/></svg></Button>
              </div>
              <div className="text-xs text-gray-500">{ev.time} · {ev.location}</div>
              <div className="text-xs text-gray-600 truncate">{ev.description}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
