import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckSquare, Pencil, Printer, QrCode, Trash2, XIcon } from "lucide-react";

export default function DayDetailModal({
  day,
  events,
  onClose,
  onEdit,
  onDelete,
  onAttendance,
  onQr,
  onPrintInvite,
}) {
  if (!day) return null;
  // Helper to get local date string YYYY-MM-DD
  function getLocalDateString(day) {
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
  }
  const iso = getLocalDateString(day);
  function timeToMinutes(value) {
    if (!value || typeof value !== "string") return Number.POSITIVE_INFINITY;
    const [hhStr, mmStr] = value.split(":");
    const hh = Number.parseInt(hhStr, 10);
    const mm = Number.parseInt(mmStr, 10);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return Number.POSITIVE_INFINITY;
    return hh * 60 + mm;
  }

  const dayEvents = events
    .filter((ev) => ev.date === iso)
    .sort((a, b) => {
      const ta = timeToMinutes(a?.time);
      const tb = timeToMinutes(b?.time);
      if (ta !== tb) return ta - tb;
      return String(a?.title ?? "").localeCompare(String(b?.title ?? ""));
    });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="glass-panel rounded-xl border p-5 w-[calc(100%-2rem)] max-w-5xl max-h-[calc(100vh-2rem)] flex flex-col"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold accent-text">Chi tiết ngày {day.getDate()}/{day.getMonth()+1}/{day.getFullYear()}</h2>
          <Button aria-label="Đóng" variant="ghost" size="icon" onClick={onClose} className="accent-text close-btn"><XIcon className="w-5 h-5"/></Button>
        </div>
        <div className="mb-3 text-sm text-muted-foreground">Tổng số cuộc họp: {dayEvents.length}</div>

        <div className="flex-1 min-h-0 overflow-auto">
          {dayEvents.length === 0 && (
            <div className="text-muted-foreground text-sm">Không có cuộc họp nào.</div>
          )}

          <div className="flex flex-col gap-3">
            {dayEvents.map((ev) => (
              <div key={ev.id} className="glass-panel border rounded-md p-4 event-accent">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="font-semibold text-base break-words">{ev.title}</div>
                    </div>
                    <div className="text-sm text-foreground mt-2">
                      <span className="font-medium">Thời gian:</span>{" "}
                      <span className="text-muted-foreground">{ev.time || "-"}</span>
                    </div>
                    <div className="text-sm text-foreground mt-1">
                      <span className="font-medium">Địa điểm:</span>{" "}
                      <span className="text-muted-foreground">{ev.location || "-"}</span>
                    </div>
                    <div className="text-sm text-foreground mt-2">
                      <span className="font-medium">Mô tả:</span>
                      {ev.description ? (
                        <div className="text-foreground mt-1 whitespace-pre-wrap break-words">
                          {ev.description}
                        </div>
                      ) : (
                        <div className="text-muted-foreground mt-1">(Không có mô tả)</div>
                      )}
                    </div>

                    {Array.isArray(ev.tasks) && ev.tasks.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-foreground mb-1">Công việc:</div>
                        <ul className="list-disc pl-5 text-sm text-foreground space-y-0.5">
                          {ev.tasks.map((t, i) => (
                            <li key={i} className="break-words">{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="QR điểm danh"
                          title="QR điểm danh"
                          variant="outline"
                          size="icon"
                          className="accent-outline action-btn"
                          onClick={() => onQr?.(ev)}
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>QR điểm danh</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="In giấy mời"
                          title="In giấy mời"
                          variant="outline"
                          size="icon"
                          className="accent-outline action-btn"
                          onClick={() => onPrintInvite?.(ev)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>In giấy mời</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Điểm danh"
                          title="Điểm danh"
                          variant="outline"
                          size="icon"
                          className="accent-outline action-btn"
                          onClick={() => onAttendance?.(ev)}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>Điểm danh</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Sửa"
                          title="Sửa"
                          variant="outline"
                          size="icon"
                          className="accent-outline action-btn"
                          onClick={() => onEdit?.(ev)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>Sửa</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Xóa"
                          title="Xóa"
                          size="icon"
                          className="accent-btn action-btn"
                          onClick={() => onDelete?.(ev)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>Xóa</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
