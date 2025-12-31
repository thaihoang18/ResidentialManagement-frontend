import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FIELD_LABELS = {
  full_name: "Họ và tên",
  date_of_birth: "Ngày sinh",
  place_of_birth: "Nơi sinh",
  native_place: "Quê quán",
  ethnicity: "Dân tộc",
  occupation: "Nghề nghiệp",
  id_number: "Số CMND/CCCD",
  id_issue_date: "Ngày cấp CCCD",
  id_issue_place: "Nơi cấp CCCD",
  registration_date: "Ngày đăng ký thường trú",
  relation_to_head: "Quan hệ với chủ hộ",
  gender: "Giới tính",
  status: "Trạng thái cư trú",
};

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function viChangeType(type) {
  switch (type) {
    case "CREATE":
      return "Thêm mới";
    case "UPDATE":
      return "Cập nhật";
    case "DELETE":
      return "Xóa";
    case "MOVE_HOUSEHOLD":
      return "Chuyển hộ";
    case "HOUSEHOLD_SPLIT":
      return "Tách hộ";
    case "HEAD_CHANGED":
      return "Đổi chủ hộ";
    case "TEMPORARY_STAY":
    case "TemporaryStay":
    case "temporarystay":
      return "Tạm trú";
    case "TEMPORARY_LEAVE":
    case "TemporaryLeave":
    case "temporaryleave":
      return "Tạm vắng";
    default:
      return type || "-";
  }
}

function summarizeChange(row) {
  const type = row?.change_type || "-";
  if (type === "CREATE") return "Thêm mới nhân khẩu";
  if (type === "UPDATE") return "Cập nhật thông tin";
  if (type === "DELETE") return "Xóa nhân khẩu";
  if (type === "MOVE_HOUSEHOLD") return "Chuyển hộ";
  if (type === "HOUSEHOLD_SPLIT") return "Tách hộ";
  if (type === "HEAD_CHANGED") return "Đổi chủ hộ";
  if (type === "TEMPORARY_STAY" || type === "TemporaryStay" || type === "temporarystay") {
    return "Đăng ký tạm trú";
  }
  if (type === "TEMPORARY_LEAVE" || type === "TemporaryLeave" || type === "temporaryleave") {
    return "Đăng ký tạm vắng";
  }
  return type;
}

function badgeVariant(changeType) {
  if (changeType === "DELETE") return "destructive";
  if (changeType === "MOVE_HOUSEHOLD" || changeType === "HOUSEHOLD_SPLIT") return "outline";
  return "secondary";
}

function viResidentStatus(value) {
  if (value === null || value === undefined || value === "") return "-";
  const s = String(value);
  if (s === "Permanent") return "Thường trú";
  if (s === "TemporaryStay") return "Tạm trú";
  if (s === "TemporaryLeave") return "Tạm vắng";
  return s;
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime()) && value.length >= 8) {
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }
    return value;
  }
  return String(value);
}

function formatFieldValue(key, value) {
  if (key === "status") return viResidentStatus(value);
  return formatValue(value);
}

function buildDiffRows(item) {
  const oldData = item?.change_details?.old;
  const newData = item?.change_details?.new;
  const oldObj = oldData && typeof oldData === "object" ? oldData : null;
  const newObj = newData && typeof newData === "object" ? newData : null;

  const preferredKeys = Object.keys(FIELD_LABELS);
  const keySet = new Set(preferredKeys);
  for (const k of Object.keys(oldObj || {})) keySet.add(k);
  for (const k of Object.keys(newObj || {})) keySet.add(k);

  const keys = Array.from(keySet);
  keys.sort((a, b) => {
    const ai = preferredKeys.indexOf(a);
    const bi = preferredKeys.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, "vi");
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const diffs = [];
  for (const key of keys) {
    if (key === "id" || key === "household_id" || key === "resident_id") continue;
    const before = oldObj ? oldObj[key] : null;
    const after = newObj ? newObj[key] : null;
    const beforeStr = formatFieldValue(key, before);
    const afterStr = formatFieldValue(key, after);
    if (beforeStr === afterStr) continue;
    diffs.push({
      key,
      label: FIELD_LABELS[key] || key,
      before: beforeStr,
      after: afterStr,
    });
  }

  return diffs;
}

function TimelineItem({ item }) {
  const diffs = useMemo(() => buildDiffRows(item), [item]);

  return (
    <div className="relative">
      <div className="absolute -left-[18px] top-5 h-3 w-3 rounded-full border bg-background" />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-muted-foreground">{formatDateTime(item?.change_date)}</div>
            <div className="text-base font-semibold">{summarizeChange(item)}</div>
            <div className="text-sm text-muted-foreground">
              Nhân khẩu: <span className="font-medium text-foreground">{item?.resident_name || "-"}</span>
              {item?.id_number ? <span className="text-muted-foreground"> — CCCD: {item.id_number}</span> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant(item?.change_type)}>{viChangeType(item?.change_type)}</Badge>
          </div>
        </div>

        {item?.note ? (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Ghi chú: </span>
            <span>{item.note}</span>
          </div>
        ) : null}

        {diffs.length > 0 ? (
          <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3">
            <div className="text-sm font-medium">Chi tiết thay đổi</div>

            <div className="mt-3 grid grid-cols-2 gap-3 overflow-x-auto pb-1">
              <div className="min-w-[22rem] rounded-md border border-border bg-background p-3">
                <div className="text-sm font-semibold">Trước</div>
                <div className="mt-2 space-y-2">
                  {diffs.map((d) => (
                    <div key={d.key} className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-5 text-muted-foreground">{d.label}</div>
                      <div className="col-span-7 break-words">{d.before}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-[22rem] rounded-md border border-border bg-background p-3">
                <div className="text-sm font-semibold">Sau</div>
                <div className="mt-2 space-y-2">
                  {diffs.map((d) => (
                    <div key={d.key} className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-5 text-muted-foreground">{d.label}</div>
                      <div className="col-span-7 break-words">{d.after}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ResidentHistoryDialog({ open, onOpenChange, resident }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!resident?.id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/residents/${resident.id}/logs?limit=200`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Lỗi tải lịch sử nhân khẩu");
        if (cancelled) return;
        setRows(Array.isArray(json?.data) ? json.data : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Có lỗi xảy ra");
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, resident?.id]);

  const sortedRows = useMemo(() => {
    const arr = Array.isArray(rows) ? [...rows] : [];
    arr.sort((a, b) => {
      const ta = new Date(a?.change_date || 0).getTime();
      const tb = new Date(b?.change_date || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b?.id || 0) - (a?.id || 0);
    });
    return arr;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedRows;
    return sortedRows.filter((r) => {
      const haystack = [
        viChangeType(r?.change_type),
        r?.change_type,
        summarizeChange(r),
        r?.note,
        r?.resident_name,
        r?.id_number,
        formatDateTime(r?.change_date),
      ]
        .filter((v) => v !== null && v !== undefined)
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, sortedRows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-none sm:max-w-6xl max-h-[85vh] overflow-y-auto !bg-[var(--popover)]">
        <DialogHeader>
          <DialogTitle>
            Lịch sử thay đổi nhân khẩu: {resident?.full_name || resident?.id || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo loại thay đổi, ghi chú, CCCD..."
            />
            <div className="text-sm text-muted-foreground sm:col-span-2 sm:self-center">
              {loading ? "Đang tải..." : `Tổng: ${filteredRows.length} bản ghi`}
            </div>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}
          {!loading && !error && filteredRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có lịch sử thay đổi.</div>
          ) : null}

          <div className="relative pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-border" />
            <div className="flex flex-col gap-4">
              {filteredRows.map((item) => (
                <TimelineItem key={item?.id || `${item?.change_date}-${item?.change_type}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
