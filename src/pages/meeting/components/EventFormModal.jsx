import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

export default function EventFormModal({ show, form, setForm, onClose, onSubmit }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="glass-panel rounded-xl border p-4 w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold accent-text">Tạo cuộc họp</h2>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={onClose} className="accent-text close-btn"><XIcon className="w-5 h-5"/></Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Ngày</label>
              <Input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium mb-1">Giờ</label>
              <Input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="border-input placeholder:text-muted-foreground dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[2px]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} type="button" className="accent-outline action-btn">Hủy</Button>
            <Button type="submit" className="accent-btn action-btn">Lưu</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
