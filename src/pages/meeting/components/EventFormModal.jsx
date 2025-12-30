import React from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

export default function EventFormModal({ show, form, setForm, onClose, onSubmit }) {
  if (!show) return null;
  const tasks = Array.isArray(form.tasks) ? form.tasks : [""];

  function setTasks(next) {
    setForm({ ...form, tasks: next });
  }

  function updateTask(index, value) {
    const next = [...tasks];
    next[index] = value;
    setTasks(next);
  }

  function addTask() {
    setTasks([...tasks, ""]);
  }

  function removeTask(index) {
    const next = tasks.filter((_, i) => i !== index);
    setTasks(next.length > 0 ? next : [""]);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg shadow-lg" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold accent-text">Tạo cuộc họp</h2>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={onClose} className="accent-text close-btn"><XIcon className="w-5 h-5"/></Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Tiêu đề</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-md px-3 py-2 shadow-sm" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Ngày</label>
              <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-md px-3 py-2 shadow-sm" />
            </div>
            <div className="w-36">
              <label className="block text-sm mb-1">Giờ</label>
              <input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full border rounded-md px-3 py-2 shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Địa điểm</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border rounded-md px-3 py-2 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-md px-3 py-2 shadow-sm h-24" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="block text-sm">Công việc</label>
              <Button
                type="button"
                variant="outline"
                className="accent-outline action-btn"
                onClick={addTask}
              >
                Thêm công việc
              </Button>
            </div>

            <div className="space-y-2">
              {tasks.map((t, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={t}
                    onChange={(e) => updateTask(idx, e.target.value)}
                    placeholder={`Công việc ${idx + 1}`}
                    className="flex-1 border rounded-md px-3 py-2 shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="accent-outline action-btn"
                    onClick={() => removeTask(idx)}
                    aria-label={`Xóa công việc ${idx + 1}`}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Để trống sẽ tự bỏ qua khi lưu.</div>
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
