import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HouseholdFormDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  onChange,
  onSubmit,
  saving,
  error,
  submitLabel,
  enableHeadSearch = false,
  residents = [],
  residentsLoading = false,
  residentsError = null,
}) {
  const [headQuery, setHeadQuery] = useState("");
  const prevOpenRef = useRef(false);

  const filteredResidents = useMemo(() => {
    if (!enableHeadSearch) return [];
    const q = headQuery.trim().toLowerCase();
    if (!q) return residents.slice(0, 8);
    return residents
      .filter((r) => {
        const name = String(r?.full_name || "").toLowerCase();
        const id = String(r?.id || "");
        return name.includes(q) || id.includes(q);
      })
      .slice(0, 8);
  }, [enableHeadSearch, headQuery, residents]);

  const selectedResident = useMemo(() => {
    if (!enableHeadSearch) return null;
    if (form.head_id === "" || form.head_id === null || form.head_id === undefined) return null;
    const id = Number(form.head_id);
    if (Number.isNaN(id)) return null;
    return residents.find((r) => Number(r?.id) === id) || null;
  }, [enableHeadSearch, form.head_id, residents]);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (!enableHeadSearch) return;
    if (!open || wasOpen) return;

    // When dialog is opened, prefill query with selected resident name (if any)
    setHeadQuery(selectedResident?.full_name || "");
  }, [enableHeadSearch, open, selectedResident?.full_name]);

  function formatDob(value) {
    if (!value) return "";
    // backend usually returns YYYY-MM-DD for DATE
    if (typeof value === "string") return value.slice(0, 10);
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return String(value);
    }
  }

  function renderResidentDetails(r) {
    if (!r) return null;
    const dob = r.date_of_birth ? formatDob(r.date_of_birth) : "";
    return (
      <div className="space-y-1">
        <div className="font-medium">{r.full_name}</div>
        <div>Quê quán: {r.native_place || "-"}</div>
        {dob ? <div>Ngày sinh: {dob}</div> : null}
        {r.id_number ? <div>CCCD: {r.id_number}</div> : null}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mã hộ</label>
            <Input
              value={form.household_code}
              onChange={(e) => onChange({ ...form, household_code: e.target.value })}
              placeholder="HK001"
              required
            />
          </div>

          {enableHeadSearch ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chủ hộ</label>

              <Input
                value={headQuery}
                onChange={(e) => setHeadQuery(e.target.value)}
                placeholder="Gõ tên hoặc ID để tìm..."
              />

              {residentsError ? (
                <div className="text-sm text-destructive">{residentsError}</div>
              ) : null}

              {residentsLoading ? (
                <div className="text-sm text-muted-foreground">
                  Đang tải danh sách nhân khẩu...
                </div>
              ) : (
                <div className="rounded-md border divide-y">
                  {filteredResidents.length ? (
                    filteredResidents.map((r) => (
                      <Tooltip key={r.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                            onClick={() => {
                              onChange({ ...form, head_id: String(r.id) });
                              setHeadQuery(r.full_name || "");
                            }}>
                            <div className="font-medium">{r.full_name}</div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {renderResidentDetails(r)}
                        </TooltipContent>
                      </Tooltip>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Không tìm thấy nhân khẩu.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  {selectedResident ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Đã chọn: {selectedResident.full_name}</span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6}>
                        {renderResidentDetails(selectedResident)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    "Chưa chọn chủ hộ"
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="accent-outline action-btn"
                  onClick={() => {
                    onChange({ ...form, head_id: "" });
                    setHeadQuery("");
                  }}>
                  Bỏ chọn
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-sm font-medium">Head ID</label>
              <Input
                type="number"
                value={form.head_id}
                onChange={(e) => onChange({ ...form, head_id: e.target.value })}
                placeholder="1"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">Số nhà</label>
            <Input
              value={form.house_number}
              onChange={(e) => onChange({ ...form, house_number: e.target.value })}
              placeholder="12A"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tên đường</label>
            <Input
              value={form.street}
              onChange={(e) => onChange({ ...form, street: e.target.value })}
              placeholder="Nguyễn Trãi"
            />
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="accent-outline action-btn" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="accent-btn action-btn" disabled={saving}>
              {saving ? "Đang lưu..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
