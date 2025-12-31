import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RESIDENT_FIELD_LABELS = {
  full_name: "Họ và tên",
  date_of_birth: "Ngày sinh",
  gender: "Giới tính",
  relation_to_head: "Quan hệ với chủ hộ",
  id_number: "Số CMND/CCCD",
  occupation: "Nghề nghiệp",
  ethnicity: "Dân tộc",
  place_of_birth: "Nơi sinh",
  native_place: "Quê quán",
  id_issue_date: "Ngày cấp CCCD",
  id_issue_place: "Nơi cấp CCCD",
  registration_date: "Ngày đăng ký thường trú",
  status: "Trạng thái cư trú",
};

function householdAddress(h) {
  const houseNumber = (h?.house_number || "").trim();
  const street = (h?.street || "").trim();
  const parts = [houseNumber, street].filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
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

function viGender(value) {
  if (value === null || value === undefined || value === "") return "-";
  const s = String(value);
  if (s === "Male") return "Nam";
  if (s === "Female") return "Nữ";
  return s;
}

function formatFieldValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "date_of_birth" || key === "id_issue_date" || key === "registration_date") return formatDate(value);
  if (key === "status") return viResidentStatus(value);
  if (key === "gender") return viGender(value);
  return String(value);
}

export default function HouseholdDetailDialog({ open, onOpenChange, household }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headId = household?.head_id ?? null;

  const householdSummaryRows = useMemo(() => {
    return [
      { label: "Mã hộ", value: household?.household_code || "-" },
      { label: "Địa chỉ", value: householdAddress(household) },
      { label: "Chủ hộ", value: household?.head_name || "-" },
    ];
  }, [household]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!open) return;
      const code = household?.household_code;
      if (!code) {
        setMembers([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/households/${code}/residents`);
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Lỗi tải danh sách thành viên");
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (alive) setMembers(rows);
      } catch (e) {
        if (alive) {
          setError(e?.message || "Có lỗi xảy ra");
          setMembers([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [open, household?.household_code]);

  const memberCount = Array.isArray(members) ? members.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col shadow-none">
        <DialogHeader>
          <DialogTitle>
            Chi tiết hộ {household?.household_code ? `(${household.household_code})` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Thông tin hộ gia đình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {householdSummaryRows.map((r) => (
                  <div
                    key={r.label}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3"
                  >
                    <div className="text-sm text-muted-foreground whitespace-nowrap">{r.label}</div>
                    <div className="text-sm font-medium min-w-0">{r.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Thành viên</div>
            <Badge variant="secondary">{loading ? "Đang tải..." : `${memberCount} người`}</Badge>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          {loading ? (
            <div className="text-sm text-muted-foreground">Đang tải danh sách thành viên...</div>
          ) : memberCount === 0 ? (
            <div className="text-sm text-muted-foreground">Chưa có thành viên trong hộ.</div>
          ) : (
            <div className="space-y-3">
              {members.map((m) => {
                const isHead = headId !== null && Number(m?.id) === Number(headId);
                const memberKey = m?.id != null ? String(m.id) : `${m?.id_number || "noid"}-${m?.full_name || "noname"}`;

                const fieldsToShow = Object.keys(RESIDENT_FIELD_LABELS)
                  .map((key) => {
                    const raw = m?.[key];
                    const formatted = formatFieldValue(key, raw);
                    return {
                      key,
                      label: RESIDENT_FIELD_LABELS[key],
                      value: formatted,
                      raw,
                    };
                  })
                  .filter((f) => {
                    if (f.key === "full_name") return false; // shown in title
                    if (f.key === "gender") return f.value !== "-";
                    if (f.key === "relation_to_head") return f.value !== "-" || isHead;
                    return f.value !== "-";
                  });

                return (
                  <Card key={memberKey} className="shadow-none">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">
                          {m?.full_name || "(Chưa có tên)"}
                        </CardTitle>
                        {isHead ? <Badge>Chủ hộ</Badge> : null}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {fieldsToShow.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Không có thông tin hiển thị.</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {fieldsToShow.map((f) => (
                            <div
                              key={f.key}
                              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3"
                            >
                              <div className="text-sm text-muted-foreground whitespace-nowrap">{f.label}</div>
                              <div className="text-sm font-medium min-w-0">
                                {f.key === "relation_to_head" && isHead ? "Chủ hộ" : f.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
