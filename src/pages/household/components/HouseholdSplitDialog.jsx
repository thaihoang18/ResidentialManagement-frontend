import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDob(value) {
  if (!value) return "-";
  if (typeof value === "string") return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
}

export default function HouseholdSplitDialog({
  open,
  onOpenChange,
  household,
  residents,
  loadingResidents,
  residentsError,
  selectedIds,
  onSelectedIdsChange,
  form,
  onFormChange,
  saving,
  error,
  onSubmit,
}) {
  const RELATION_OPTIONS = [
    "Vợ",
    "Chồng",
    "Cha đẻ",
    "Mẹ đẻ",
    "Cha vợ",
    "Mẹ vợ",
    "Cha chồng",
    "Mẹ chồng",
    "Cha nuôi",
    "Mẹ nuôi",
    "Cha dượng",
    "Mẹ kế",
    "Con đẻ",
    "Con dâu",
    "Con rể",
    "Con nuôi",
    "Con riêng của vợ hoặc chồng",
    "Ông nội",
    "Bà nội",
    "Ông ngoại",
    "Bà ngoại",
    "Anh ruột",
    "Chị ruột",
    "Em ruột",
    "Cháu ruột",
    "Anh, chị, em cùng cha khác mẹ",
    "Anh, chị, em cùng mẹ khác cha",
    "Anh rể",
    "Em rể",
    "Chị dâu",
    "Em dâu",
    "Cụ nội",
    "Cụ ngoại",
    "Cháu nội",
    "Cháu ngoại",
    "Bác ruột",
    "Chú ruột",
    "Cậu ruột",
    "Cô ruột",
    "Dì ruột",
    "Chắt ruột",
    "Người giám hộ",
    "Người được giám hộ",
    "Ở nhờ",
    "Ở mượn",
    "Ở thuê",
    "Cùng ở nhờ",
    "Cùng ở thuê",
    "Cùng ở mượn",
  ];

  const [headId, setHeadId] = useState("");
  const [relationsById, setRelationsById] = useState({});

  const selectedResidents = useMemo(() => {
    const set = new Set(selectedIds);
    return residents.filter((r) => set.has(r.id));
  }, [residents, selectedIds]);

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((x) => x !== id));
      if (String(id) === String(headId)) setHeadId("");
      setRelationsById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      onSelectedIdsChange([...selectedIds, id]);
      setRelationsById((prev) => ({
        ...prev,
        [id]:
          prev[id] ??
          (RELATION_OPTIONS.includes(residents.find((r) => r.id === id)?.relation_to_head)
            ? residents.find((r) => r.id === id)?.relation_to_head
            : ""),
      }));
    }
  };

  const allChecked = residents.length > 0 && selectedIds.length === residents.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setHeadId("");
          setRelationsById({});
        }
      }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tách hộ khẩu</DialogTitle>
          <DialogDescription>
            Tạo sổ hộ khẩu mới từ hộ {household?.household_code || ""} bằng cách chọn nhân khẩu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Mã hộ mới</label>
            <Input
              value={form.new_household_code}
              onChange={(e) =>
                onFormChange({ ...form, new_household_code: e.target.value })
              }
              placeholder="HK999"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Số nhà</label>
            <Input
              value={form.house_number}
              onChange={(e) => onFormChange({ ...form, house_number: e.target.value })}
              placeholder="12A"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Tên đường</label>
            <Input
              value={form.street}
              onChange={(e) => onFormChange({ ...form, street: e.target.value })}
              placeholder="Nguyễn Trãi"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Chọn nhân khẩu</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="accent-outline action-btn"
              onClick={() => {
                if (allChecked) {
                  onSelectedIdsChange([]);
                  setHeadId("");
                  setRelationsById({});
                } else {
                  onSelectedIdsChange(residents.map((r) => r.id));
                  setRelationsById(() => {
                    const next = {};
                    for (const r of residents) {
                      next[r.id] = RELATION_OPTIONS.includes(r?.relation_to_head)
                        ? r.relation_to_head
                        : "";
                    }
                    return next;
                  });
                }
              }}>
              {allChecked ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>
          </div>

          {residentsError ? <div className="text-sm text-destructive">{residentsError}</div> : null}
          {loadingResidents ? (
            <div className="text-sm text-muted-foreground">Đang tải danh sách nhân khẩu...</div>
          ) : (
            <div className="glass-panel rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Chọn</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead className="w-56">Quan hệ với chủ hộ</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Quê quán</TableHead>
                    <TableHead>CCCD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.length ? (
                    residents.map((r) => (
                      <TableRow key={r.id} className="table-row-hover">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.id)}
                            onChange={() => toggle(r.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{r.full_name}</TableCell>
                        <TableCell>
                          {selectedIds.includes(r.id) ? (
                            String(r.id) === String(headId) ? (
                              <span className="text-sm">Chủ hộ</span>
                            ) : (
                              <select
                                value={relationsById[r.id] ?? ""}
                                onChange={(e) =>
                                  setRelationsById((prev) => ({
                                    ...prev,
                                    [r.id]: e.target.value,
                                  }))
                                }
                                className="border-input bg-background text-foreground h-9 w-full rounded-md border px-3 text-sm shadow-xs"
                              >
                                <option value="">Chọn quan hệ</option>
                                {RELATION_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDob(r.date_of_birth)}</TableCell>
                        <TableCell>{r.native_place || "-"}</TableCell>
                        <TableCell>{r.id_number || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Không có nhân khẩu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Chủ hộ mới (tuỳ chọn)</label>
              <select
                value={headId}
                onChange={(e) => {
                  const v = e.target.value;
                  setHeadId(v);
                  if (v) {
                    setRelationsById((prev) => {
                      const next = { ...prev };
                      delete next[Number(v)];
                      return next;
                    });
                  }
                }}
                className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm shadow-xs"
                disabled={selectedResidents.length === 0}>
                <option value="">Không chọn</option>
                {selectedResidents.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.full_name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">
                Nếu chọn, chủ hộ phải nằm trong danh sách nhân khẩu đã chọn.
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" className="accent-outline action-btn" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            className="accent-btn action-btn"
            disabled={saving}
            onClick={() => {
              const nonHeadSelectedIds = selectedIds.filter(
                (rid) => String(rid) !== String(headId)
              );

              const missing = nonHeadSelectedIds.some(
                (rid) => !String(relationsById[rid] ?? "").trim()
              );
              if (missing) {
                onSubmit({
                  head_id: headId || null,
                  relations: [],
                  __clientError: "Vui lòng chọn quan hệ với chủ hộ cho tất cả nhân khẩu được tách",
                });
                return;
              }

              const relations = nonHeadSelectedIds.map((rid) => ({
                resident_id: rid,
                relation_to_head: String(relationsById[rid] ?? "").trim(),
              }));

              onSubmit({ head_id: headId || null, relations });
            }}>
            {saving ? "Đang tách..." : "Tách hộ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
