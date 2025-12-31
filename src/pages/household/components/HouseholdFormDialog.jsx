import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Lock, Pencil, X } from "lucide-react";
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
  members = [],
  membersLoading = false,
  membersError = null,
  onUpdateMemberRelation,
}) {
  const [headQuery, setHeadQuery] = useState("");
  const prevOpenRef = useRef(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [relationDraft, setRelationDraft] = useState("");
  const [relationSaving, setRelationSaving] = useState(false);
  const [relationError, setRelationError] = useState(null);

  const filteredResidents = useMemo(() => {
    if (!enableHeadSearch) return [];
    const q = headQuery.trim().toLowerCase();
    if (!q) return [];
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

  useEffect(() => {
    if (!open) {
      setEditingMemberId(null);
      setRelationDraft("");
      setRelationSaving(false);
      setRelationError(null);
    }
  }, [open]);

  const headIdNum = useMemo(() => {
    const n = Number(form?.head_id);
    return Number.isNaN(n) ? null : n;
  }, [form?.head_id]);

  async function saveRelation(member) {
    if (!member?.id) return;
    if (typeof onUpdateMemberRelation !== "function") return;
    setRelationSaving(true);
    setRelationError(null);
    try {
      const next = relationDraft.trim();
      await onUpdateMemberRelation(member, next);
      setEditingMemberId(null);
      setRelationDraft("");
    } catch (e) {
      setRelationError(e?.message || "Cập nhật quan hệ thất bại");
    } finally {
      setRelationSaving(false);
    }
  }

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
                headQuery.trim() ? (
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
                ) : null
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">{selectedResident ? "" : "Chưa chọn chủ hộ"}</div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="accent-outline action-btn"
                  onClick={() => {
                    onChange({ ...form, head_id: "" });
                    setHeadQuery("");
                  }}
                  aria-label="Bỏ chọn chủ hộ">
                  <X className="h-4 w-4" />
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

          {form?.id ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Thành viên trong hộ</label>

              {membersError ? <div className="text-sm text-destructive">{membersError}</div> : null}
              {relationError ? <div className="text-sm text-destructive">{relationError}</div> : null}

              {membersLoading ? (
                <div className="text-sm text-muted-foreground">Đang tải danh sách thành viên...</div>
              ) : (
                <div className="rounded-md border divide-y">
                  {Array.isArray(members) && members.length > 0 ? (
                    members.map((m) => {
                      const isHead = headIdNum !== null && Number(m?.id) === headIdNum;
                      const isEditing = Number(m?.id) === Number(editingMemberId);
                      const relationText = isHead ? "Chủ hộ" : (m?.relation_to_head || "-");

                      return (
                        <div key={m?.id} className="px-3 py-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{m?.full_name || "-"}</div>
                              <div className="text-sm text-muted-foreground">
                                {m?.id_number ? `CCCD: ${m.id_number}` : "CCCD: -"}
                                <span className="mx-2">•</span>
                                Quan hệ: <span className="text-foreground">{relationText}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isHead ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" disabled aria-label="Không chỉnh sửa chủ hộ">
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>Không chỉnh sửa chủ hộ</TooltipContent>
                                </Tooltip>
                              ) : isEditing ? (
                                <>
                                  <Input
                                    value={relationDraft}
                                    onChange={(e) => setRelationDraft(e.target.value)}
                                    placeholder="Nhập quan hệ (VD: Con đẻ, Vợ, Chồng...)"
                                    className="w-[16rem]"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    className="accent-btn action-btn"
                                    disabled={relationSaving}
                                    onClick={() => saveRelation(m)}
                                    aria-label={relationSaving ? "Đang lưu quan hệ" : "Lưu quan hệ"}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="accent-outline action-btn"
                                    disabled={relationSaving}
                                    onClick={() => {
                                      setEditingMemberId(null);
                                      setRelationDraft("");
                                      setRelationError(null);
                                    }}
                                    aria-label="Hủy chỉnh sửa quan hệ">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="accent-outline action-btn"
                                      onClick={() => {
                                        setEditingMemberId(m?.id);
                                        setRelationDraft(String(m?.relation_to_head || ""));
                                        setRelationError(null);
                                      }}
                                      aria-label="Chỉnh sửa quan hệ với chủ hộ">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={6}>Chỉnh sửa quan hệ</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Chưa có thành viên trong hộ.</div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <DialogFooter>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="accent-outline action-btn"
                  onClick={() => onOpenChange(false)}
                  aria-label="Hủy">
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Hủy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" className="accent-btn action-btn" disabled={saving} aria-label={saving ? "Đang lưu" : submitLabel}>
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>{saving ? "Đang lưu..." : submitLabel}</TooltipContent>
            </Tooltip>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
