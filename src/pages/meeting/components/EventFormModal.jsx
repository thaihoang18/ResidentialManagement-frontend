import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash2, XIcon } from "lucide-react";

export default function EventFormModal({ show, form, setForm, onClose, onSubmit }) {
  const CLOSE_MS = 320;
  const [mounted, setMounted] = React.useState(!!show);
  const [uiState, setUiState] = React.useState("closed");

  const pad2 = (n) => String(n).padStart(2, "0");
  const clampInt = (value, min, max) => {
    const n = Number.parseInt(String(value), 10);
    if (Number.isNaN(n)) return undefined;
    return Math.min(max, Math.max(min, n));
  };
  const parseHHmm = (value) => {
    const str = String(value || "");
    const m = str.match(/^\s*(\d{1,2})\s*:\s*(\d{1,2})\s*$/);
    if (!m) return { hour: "", minute: "" };
    const h = clampInt(m[1], 0, 23);
    const mi = clampInt(m[2], 0, 59);
    return {
      hour: h == null ? "" : pad2(h),
      minute: mi == null ? "" : pad2(mi),
    };
  };
  const onlyDigits2 = (next) => String(next || "").replace(/\D+/g, "").slice(0, 2);

  const [hour, setHour] = React.useState("");
  const [minute, setMinute] = React.useState("");

  React.useEffect(() => {
    if (!mounted) return;
    const parsed = parseHHmm(form.time);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, show]);

  React.useEffect(() => {
    if (show) {
      setMounted(true);
      setUiState("closed");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setUiState("open"));
      });
      return;
    }

    if (!mounted) return;
    setUiState("closed");
    const t = window.setTimeout(() => setMounted(false), CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [show, mounted]);

  if (!mounted) return null;
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
    <div
      data-state={uiState}
      className="rm-modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setUiState("closed");
          onClose?.();
        }
      }}
    >
      <div data-state={uiState} className="rm-modal-panel rm-popup-panel rounded-xl border p-4 w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold accent-text">Tạo cuộc họp</h2>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={() => { setUiState("closed"); onClose?.(); }} className="accent-text close-btn"><XIcon className="w-5 h-5"/></Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề</label>
            <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Ngày</label>
              <DatePicker
                name="date"
                required
                placeholder="Chọn ngày"
                value={form.date}
                onChange={(next) => setForm({ ...form, date: next })}
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Giờ</label>
              <div className="flex items-center gap-2">
                <Input
                  required
                  inputMode="numeric"
                  placeholder="HH"
                  value={hour}
                  onChange={(e) => {
                    const nextHour = onlyDigits2(e.target.value);
                    setHour(nextHour);
                    const h = clampInt(nextHour, 0, 23);
                    const m = clampInt(minute, 0, 59);
                    if (h != null && m != null) setForm({ ...form, time: `${pad2(h)}:${pad2(m)}` });
                  }}
                  onBlur={() => {
                    const h = clampInt(hour, 0, 23);
                    const m = clampInt(minute, 0, 59);
                    const hh = h == null ? "" : pad2(h);
                    setHour(hh);
                    if (h != null && m != null) setForm({ ...form, time: `${pad2(h)}:${pad2(m)}` });
                  }}
                  className="text-center"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  required
                  inputMode="numeric"
                  placeholder="mm"
                  value={minute}
                  onChange={(e) => {
                    const nextMinute = onlyDigits2(e.target.value);
                    setMinute(nextMinute);
                    const h = clampInt(hour, 0, 23);
                    const m = clampInt(nextMinute, 0, 59);
                    if (h != null && m != null) setForm({ ...form, time: `${pad2(h)}:${pad2(m)}` });
                  }}
                  onBlur={() => {
                    const h = clampInt(hour, 0, 23);
                    const m = clampInt(minute, 0, 59);
                    const mm = m == null ? "" : pad2(m);
                    setMinute(mm);
                    if (h != null && m != null) setForm({ ...form, time: `${pad2(h)}:${pad2(m)}` });
                  }}
                  className="text-center"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Địa điểm</label>
            <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Màu hiển thị</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color || "#32f1cd"}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-14 border rounded-md px-1 py-1 shadow-sm"
                aria-label="Chọn màu hiển thị cuộc họp"
              />
              <input
                value={form.color || "#32f1cd"}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="flex-1 border rounded-md px-3 py-2 shadow-sm"
                placeholder="#32f1cd"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="border-input placeholder:text-muted-foreground dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[2px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label className="block text-sm font-medium">Công việc</label>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="accent-outline action-btn"
                onClick={addTask}
                aria-label="Thêm công việc"
                title="Thêm công việc"
              >
                <Plus className="h-4 w-4" />
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
                    size="icon"
                    className="accent-outline action-btn"
                    onClick={() => removeTask(idx)}
                    aria-label={`Xóa công việc ${idx + 1}`}
                    title={`Xóa công việc ${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
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
