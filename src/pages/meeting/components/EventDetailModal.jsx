import React from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export default function EventDetailModal({ event, onClose, onDelete, onEdit }) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><XIcon className="w-5 h-5"/></Button>
        </div>
        <div className="text-sm text-gray-600 mb-3">{event.date} · {event.time} · {event.location}</div>
        <p className="mb-4 text-sm text-gray-700">{event.description}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onEdit}>Sửa</Button>
          <Button variant="destructive" onClick={() => onDelete(event.id)}>Xóa</Button>
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
