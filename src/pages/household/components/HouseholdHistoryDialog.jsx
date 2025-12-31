import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RESIDENT_FIELD_LABELS = {
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

function badgeVariant(changeType) {
  if (changeType === "DELETE") return "destructive";
  if (changeType === "MOVE_HOUSEHOLD" || changeType === "HOUSEHOLD_SPLIT") return "outline";
  return "secondary";
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

function viResidentStatus(value) {
  if (value === null || value === undefined || value === "") return "-";
  const s = String(value);
  if (s === "Permanent") return "Thường trú";
  if (s === "TemporaryStay") return "Tạm trú";
  if (s === "TemporaryLeave") return "Tạm vắng";
  return s;
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

function householdAddress(h) {
  const houseNumber = (h?.house_number || "").trim();
  const street = (h?.street || "").trim();
  const parts = [houseNumber, street].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
}

function householdAddressFromParts(house_number, street) {
  const houseNumber = (house_number || "").trim();
  const streetName = (street || "").trim();
  const parts = [houseNumber, streetName].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
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

function buildResidentDiffRows(logRow) {
  const oldData = logRow?.change_details?.old;
  const newData = logRow?.change_details?.new;
  const oldObj = oldData && typeof oldData === "object" ? oldData : null;
  const newObj = newData && typeof newData === "object" ? newData : null;

  const preferredKeys = Object.keys(RESIDENT_FIELD_LABELS);
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
      label: RESIDENT_FIELD_LABELS[key] || key,
      before: beforeStr,
      after: afterStr,
    });
  }

  if (diffs.length === 0) {
    // Special-case: HEAD_CHANGED logs currently store details in meta (and may be combined on UI)
    if (logRow?.change_type === "HEAD_CHANGED") {
      const beforeFromDetails = logRow?.change_details?.before_head;
      const afterFromDetails = logRow?.change_details?.after_head;

      const beforeName = beforeFromDetails?.full_name ?? logRow?._head_change?.before_name;
      const afterName = afterFromDetails?.full_name ?? logRow?._head_change?.after_name;
      const beforeId = beforeFromDetails?.id_number ?? logRow?._head_change?.before_id_number;
      const afterId = afterFromDetails?.id_number ?? logRow?._head_change?.after_id_number;
      const meta = logRow?.change_details?.meta;
      const beforeFallback = meta?.head_id_before ?? null;
      const afterFallback = meta?.head_id_after ?? null;

      const beforeNameText = beforeName ? String(beforeName) : "-";
      const afterNameText = afterName ? String(afterName) : "-";
      const beforeIdText = beforeId ? String(beforeId) : "-";
      const afterIdText = afterId ? String(afterId) : "-";
      const beforeIdFallbackText = formatValue(beforeFallback);
      const afterIdFallbackText = formatValue(afterFallback);

      // Prefer showing name + CCCD as two separate labeled rows
      if (beforeNameText !== afterNameText && (beforeNameText !== "-" || afterNameText !== "-")) {
        diffs.push({ key: "head_name", label: "Chủ hộ", before: beforeNameText, after: afterNameText });
      }

      const finalBeforeId = beforeIdText !== "-" ? beforeIdText : beforeIdFallbackText;
      const finalAfterId = afterIdText !== "-" ? afterIdText : afterIdFallbackText;
      if (finalBeforeId !== finalAfterId && (finalBeforeId !== "-" || finalAfterId !== "-")) {
        diffs.push({ key: "head_id_number", label: "CCCD chủ hộ", before: finalBeforeId, after: finalAfterId });
      }

      if (diffs.length > 0) return diffs;
    }
  }

  // Household change: show as separate labeled rows (avoid technical household_id)
  const beforeCode = formatValue(logRow?.household_code_before);
  const afterCode = formatValue(logRow?.household_code_after);
  const beforeAddress = householdAddressFromParts(logRow?.house_number_before, logRow?.street_before);
  const afterAddress = householdAddressFromParts(logRow?.house_number_after, logRow?.street_after);
  const beforeHeadName = formatValue(logRow?.head_name_before);
  const afterHeadName = formatValue(logRow?.head_name_after);

  const householdDiffs = [];
  if (beforeCode !== afterCode && (beforeCode !== "-" || afterCode !== "-")) {
    householdDiffs.push({ key: "household_code", label: "Mã hộ", before: beforeCode, after: afterCode });
  }
  if (beforeAddress !== afterAddress && (beforeAddress !== "-" || afterAddress !== "-")) {
    householdDiffs.push({ key: "household_address", label: "Địa chỉ", before: beforeAddress, after: afterAddress });
  }
  // Avoid duplicating the HEAD_CHANGED "Chủ hộ" row if it's already present
  const alreadyHasHeadRow = diffs.some((d) => d.key === "head_name");
  if (!alreadyHasHeadRow && beforeHeadName !== afterHeadName && (beforeHeadName !== "-" || afterHeadName !== "-")) {
    householdDiffs.push({ key: "household_head_name", label: "Chủ hộ", before: beforeHeadName, after: afterHeadName });
  }

  if (householdDiffs.length > 0) {
    diffs.unshift(...householdDiffs);
  }

  return diffs;
}

function combineHeadChangedEvents(inputRows) {
  const out = [];
  const pending = new Map();

  // inputRows is expected already sorted by time desc
  for (const r of inputRows) {
    if (r?.change_type !== "HEAD_CHANGED") {
      out.push(r);
      continue;
    }

    // If this row already contains before/after in change_details (new backend), keep as-is.
    if (r?.change_details?.before_head || r?.change_details?.after_head) {
      out.push(r);
      continue;
    }

    const meta = r?.change_details?.meta || {};
    const groupKey = [meta?.household_id, meta?.head_id_before, meta?.head_id_after]
      .map((v) => String(v ?? ""))
      .join("|");

    const t = new Date(r?.change_date || 0).getTime();
    const existing = pending.get(groupKey);
    if (existing && Math.abs(existing._t - t) <= 60_000) {
      // merge
      const role = meta?.role;
      if (role === "old_head") {
        existing._head_change.before_name = r?.resident_name || existing._head_change.before_name;
        existing._head_change.before_id_number = r?.id_number || existing._head_change.before_id_number;
      } else if (role === "new_head") {
        existing._head_change.after_name = r?.resident_name || existing._head_change.after_name;
        existing._head_change.after_id_number = r?.id_number || existing._head_change.after_id_number;
      } else {
        if (!existing._head_change.before_name) {
          existing._head_change.before_name = r?.resident_name || null;
          existing._head_change.before_id_number = r?.id_number || null;
        } else if (!existing._head_change.after_name) {
          existing._head_change.after_name = r?.resident_name || null;
          existing._head_change.after_id_number = r?.id_number || null;
        }
      }

      // once we have both sides, flush
      const hasBefore = !!existing._head_change.before_name || (meta?.head_id_before ?? null) !== null;
      const hasAfter = !!existing._head_change.after_name || (meta?.head_id_after ?? null) !== null;
      if (hasBefore && hasAfter) {
        out.push(existing);
        pending.delete(groupKey);
      } else {
        pending.set(groupKey, existing);
      }
      continue;
    }

    // flush old pending (if any)
    if (existing) out.push(existing);

    pending.set(groupKey, {
      change_type: "HEAD_CHANGED",
      change_date: r?.change_date,
      note: r?.note || null,
      change_details: { meta },
      _t: t,
      _head_change: {
        before_name: meta?.role === "old_head" ? r?.resident_name || null : null,
        after_name: meta?.role === "new_head" ? r?.resident_name || null : null,
        before_id_number: meta?.role === "old_head" ? r?.id_number || null : null,
        after_id_number: meta?.role === "new_head" ? r?.id_number || null : null,
      },
    });
  }

  // flush any remaining pending
  for (const v of pending.values()) out.push(v);
  return out;
}

export default function HouseholdHistoryDialog({ open, onOpenChange, household }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!household?.id) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/households/${household.id}/resident-logs?limit=300`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Lỗi tải lịch sử nhân khẩu của hộ");
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
  }, [open, household?.id]);

  const normalizedRows = useMemo(() => {
    const arr = Array.isArray(rows) ? [...rows] : [];
    arr.sort((a, b) => {
      const ta = new Date(a?.change_date || 0).getTime();
      const tb = new Date(b?.change_date || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b?.id || 0) - (a?.id || 0);
    });

    // Combine paired HEAD_CHANGED logs into one event
    const merged = combineHeadChangedEvents(arr);
    merged.sort((a, b) => {
      const ta = new Date(a?.change_date || 0).getTime();
      const tb = new Date(b?.change_date || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b?.id || 0) - (a?.id || 0);
    });
    return merged;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedRows;
    return normalizedRows.filter((r) => {
      const headText = r?.change_type === "HEAD_CHANGED"
        ? [r?._head_change?.before_name, r?._head_change?.after_name, r?._head_change?.before_id_number, r?._head_change?.after_id_number]
            .filter(Boolean)
            .join(" ")
        : "";
      const haystack = [
        viChangeType(r?.change_type),
        r?.change_type,
        summarizeChange(r),
        r?.resident_name,
        r?.id_number,
        r?.note,
        formatDateTime(r?.change_date),
        headText,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, normalizedRows]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-none sm:max-w-6xl max-h-[85vh] overflow-y-auto !bg-[var(--popover)]">
        <DialogHeader>
          <DialogTitle>
            Lịch sử nhân khẩu của hộ: {household?.household_code || household?.id || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-card p-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Mã hộ: </span>
            <span className="font-medium">{household?.household_code || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Chủ hộ: </span>
            <span className="font-medium">{household?.head_name || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Địa chỉ: </span>
            <span className="font-medium">{householdAddress(household)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên nhân khẩu, CCCD, loại thay đổi..."
            />
            <div className="text-sm text-muted-foreground sm:col-span-2 sm:self-center">
              {loading ? "Đang tải..." : `Tổng: ${filteredRows.length} bản ghi`}
            </div>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <div className="relative pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-border" />

            {filteredRows.length === 0 && !loading ? (
              <div className="text-sm text-muted-foreground">Chưa có lịch sử thay đổi.</div>
            ) : null}

            <div className="flex flex-col gap-4">
              {filteredRows.map((r) => {
                const diffs = buildResidentDiffRows(r);
                return (
                  <div key={r?.id || `${r?.change_type}-${r?.change_date}`} className="relative">
                    <div className="absolute -left-[18px] top-6 h-3 w-3 rounded-full border bg-background" />

                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-muted-foreground">{formatDateTime(r?.change_date)}</div>
                          <div className="text-base font-semibold">{summarizeChange(r)}</div>
                          {r?.change_type === "HEAD_CHANGED" ? null : (
                            <div className="text-sm text-muted-foreground">
                              Nhân khẩu: <span className="font-medium text-foreground">{r?.resident_name || "-"}</span>
                              {r?.id_number ? <span className="text-muted-foreground"> — CCCD: {r.id_number}</span> : null}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={badgeVariant(r?.change_type)}>{viChangeType(r?.change_type)}</Badge>
                        </div>
                      </div>

                      {r?.note ? (
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Ghi chú: </span>
                          <span>{r.note}</span>
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
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
