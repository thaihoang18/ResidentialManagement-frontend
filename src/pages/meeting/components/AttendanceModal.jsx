import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { XIcon } from "lucide-react";

function formatAddress(row) {
  const parts = [row.house_number, row.street].filter(Boolean);
  return parts.length ? parts.join(" - ") : "-";
}

export default function AttendanceModal({ open, meeting, onClose }) {
  const meetingId = meeting?.id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  async function load() {
    if (!meetingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance/meeting/${meetingId}`);
      if (!res.ok) throw new Error("Không thể tải danh sách điểm danh");
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      setRows(
        list.map((r) => ({
          household_id: r.household_id,
          household_code: r.household_code,
          house_number: r.house_number,
          street: r.street,
          head_name: r.head_name,
          attended: !!r.attended,
          absence_reason: r.absence_reason || "",
          checked_at: r.checked_at,
        }))
      );
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, meetingId]);

  const attendedCount = useMemo(
    () => rows.filter((r) => r.attended).length,
    [rows]
  );

  const totalCount = rows.length;
  const absentCount = Math.max(0, totalCount - attendedCount);
  const attendedPct = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;
  const absentPct = totalCount > 0 ? 100 - attendedPct : 0;
  const chartData = useMemo(
    () => [
      { name: "Tham dự", value: attendedCount },
      { name: "Không tham dự", value: absentCount },
    ],
    [attendedCount, absentCount]
  );

  const CHART_COLORS = ["#00c2a8", "#31b9d8"]; // keep consistent with existing charts

  async function save() {
    if (!meetingId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        items: rows.map((r) => ({
          household_id: r.household_id,
          attended: !!r.attended,
          absence_reason: r.attended ? null : (r.absence_reason || ""),
        })),
      };

      const res = await fetch(`/api/attendance/meeting/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Không thể lưu điểm danh");

      await load();
    } catch (e) {
      setError(e.message || "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="glass-panel rounded-xl border p-4 w-[calc(100%-2rem)] max-w-5xl max-h-[calc(100vh-2rem)] flex flex-col"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold accent-text">Điểm danh</h2>
            <div className="text-sm text-muted-foreground">
              {meeting?.title || meeting?.topic || "Cuộc họp"} (ID: {meetingId}) ·
              Tham dự: {attendedCount}/{rows.length}
            </div>
          </div>
          <Button
            aria-label="Đóng"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="accent-text close-btn"
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {error && <div className="text-sm text-destructive mb-2">{error}</div>}
        {loading ? (
          <div className="text-center text-muted-foreground py-10">Đang tải dữ liệu...</div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="glass-panel rounded-md border p-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">Tỷ lệ tham dự</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tham dự: <span className="font-semibold text-foreground">{attendedCount}</span>/{totalCount} ({attendedPct}%) · Vắng: <span className="font-semibold text-foreground">{absentCount}</span>/{totalCount} ({absentPct}%)
                  </div>
                </div>

                <div className="w-full md:w-[260px] h-[140px]">
                  {totalCount === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      Chưa có dữ liệu
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `${value} hộ`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-md border flex-1 min-h-0 overflow-auto">
              <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Mã hộ</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Chủ hộ</TableHead>
                  <TableHead className="w-28 text-center">Tham dự</TableHead>
                  <TableHead className="min-w-[260px]">Lý do vắng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.household_id} className="table-row-hover">
                    <TableCell className="font-medium">
                      {row.household_code}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[320px]">
                      {formatAddress(row)}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[220px]">
                      {row.head_name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={row.attended}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.household_id === row.household_id
                                ? {
                                    ...r,
                                    attended: checked,
                                    absence_reason: checked ? "" : r.absence_reason,
                                  }
                                : r
                            )
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.attended ? "" : row.absence_reason}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.household_id === row.household_id
                                ? { ...r, absence_reason: v }
                                : r
                            )
                          );
                        }}
                        placeholder={row.attended ? "-" : "Nhập lý do vắng"}
                        disabled={row.attended}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Chưa có hộ khẩu nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            className="accent-outline action-btn"
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            onClick={save}
            className="accent-btn action-btn"
            disabled={saving || loading}
          >
            {saving ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
