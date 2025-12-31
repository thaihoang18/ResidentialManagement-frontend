import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Lock, Pencil, Trash2, X } from "lucide-react";
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
  onAddMemberToHousehold,
  onRemoveMemberFromHousehold,
}) {
  const ALLOWED_RELATIONS = [
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

  const [headQuery, setHeadQuery] = useState("");
  const prevOpenRef = useRef(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [relationDraft, setRelationDraft] = useState("");
  const [relationSaving, setRelationSaving] = useState(false);
  const [relationError, setRelationError] = useState(null);

  const [addMemberQuery, setAddMemberQuery] = useState("");
  const [addMemberSelectedId, setAddMemberSelectedId] = useState(null);
  const [addMemberRelation, setAddMemberRelation] = useState("");
  const [addMemberSaving, setAddMemberSaving] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);

  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [removeSaving, setRemoveSaving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  function normalizeVi(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();
  }

  const filteredResidents = useMemo(() => {
    if (!enableHeadSearch) return [];
    const q = normalizeVi(headQuery);
    if (!q) return [];
    return residents
      .filter((r) => {
        const name = normalizeVi(r?.full_name);
        const id = String(r?.id || "");
        const cccd = String(r?.id_number || "");
        return name.includes(q) || id.includes(q) || cccd.includes(q);
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

      setAddMemberQuery("");
      setAddMemberSelectedId(null);
      setAddMemberRelation("");
      setAddMemberSaving(false);
      setAddMemberError(null);

      setRemovingMemberId(null);
      setRemoveSaving(false);
      setRemoveError(null);
    }
  }, [open]);

  const headIdNum = useMemo(() => {
    const n = Number(form?.head_id);
    return Number.isNaN(n) ? null : n;
  }, [form?.head_id]);

  const addMemberCandidates = useMemo(() => {
    const q = normalizeVi(addMemberQuery);
    if (!q) return [];

    const existingIds = new Set((Array.isArray(members) ? members : []).map((m) => Number(m?.id)));
    return (Array.isArray(residents) ? residents : [])
      .filter((r) => {
        const idNum = Number(r?.id);
        if (!Number.isNaN(idNum) && existingIds.has(idNum)) return false;
        const name = normalizeVi(r?.full_name);
        const id = String(r?.id || "");
        const cccd = String(r?.id_number || "");
        return name.includes(q) || id.includes(q) || cccd.includes(q);
      })
      .slice(0, 8);
  }, [addMemberQuery, members, residents]);

  async function removeMember(member) {
    if (typeof onRemoveMemberFromHousehold !== "function") return;
    if (!member?.id) return;
    setRemoveSaving(true);
    setRemoveError(null);
    try {
      await onRemoveMemberFromHousehold(member);
      setRemovingMemberId(null);
    } catch (e) {
      setRemoveError(e?.message || "Xóa thành viên khỏi hộ thất bại");
    } finally {
      setRemoveSaving(false);
    }
  }

  async function addMember() {
    if (typeof onAddMemberToHousehold !== "function") return;
    if (!addMemberSelectedId) {
      setAddMemberError("Vui lòng chọn nhân khẩu để thêm vào hộ");
      return;
    }
    setAddMemberSaving(true);
    setAddMemberError(null);
    try {
      await onAddMemberToHousehold(addMemberSelectedId, addMemberRelation);
      setAddMemberQuery("");
      setAddMemberSelectedId(null);
      setAddMemberRelation("");
    } catch (e) {
      setAddMemberError(e?.message || "Thêm thành viên thất bại");
    } finally {
      setAddMemberSaving(false);
    }
  }

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
      <DialogContent className="sm:max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form className="flex flex-col gap-3 flex-1 min-h-0" onSubmit={onSubmit}>
          <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                />

                {residentsError ? (
                  <div className="text-sm text-destructive">{residentsError}</div>
                ) : null}

                {residentsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Đang tải danh sách nhân khẩu...
                  </div>
                ) : headQuery.trim() ? (
                  <div className="rounded-md border divide-y max-h-56 overflow-y-auto">
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
                              <div className="font-medium truncate">{r.full_name}</div>
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
                ) : null}

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
                {addMemberError ? <div className="text-sm text-destructive">{addMemberError}</div> : null}
                {removeError ? <div className="text-sm text-destructive">{removeError}</div> : null}

                <div className="rounded-md border p-3 space-y-2">
                  <div className="text-sm font-medium">Thêm thành viên</div>
                  <Input
                    value={addMemberQuery}
                    onChange={(e) => {
                      setAddMemberQuery(e.target.value);
                      setAddMemberSelectedId(null);
                      setAddMemberError(null);
                    }}
                    placeholder="Gõ tên / CCCD / ID để tìm nhân khẩu..."
                    disabled={residentsLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                  />

                  {residentsError ? <div className="text-sm text-destructive">{residentsError}</div> : null}

                  {residentsLoading ? (
                    <div className="text-sm text-muted-foreground">Đang tải danh sách nhân khẩu...</div>
                  ) : addMemberQuery.trim() ? (
                    <div className="rounded-md border divide-y max-h-40 overflow-y-auto">
                      {addMemberCandidates.length ? (
                        addMemberCandidates.map((r) => (
                          <Tooltip key={r.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                                onClick={() => {
                                  setAddMemberSelectedId(String(r.id));
                                  setAddMemberQuery(r.full_name || "");
                                  setAddMemberError(null);
                                }}
                              >
                                <div className="font-medium truncate">{r.full_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {r?.id_number ? `CCCD: ${r.id_number}` : "CCCD: -"}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>{renderResidentDetails(r)}</TooltipContent>
                          </Tooltip>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy nhân khẩu.</div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Select
                      value={addMemberRelation || undefined}
                      onValueChange={(value) => setAddMemberRelation(value === "__none__" ? "" : value)}
                      disabled={addMemberSaving}
                    >
                      <SelectTrigger
                        className="border-input dark:bg-input/30 h-9 min-w-0 w-full sm:max-w-[20rem]"
                        aria-label="Chọn quan hệ của thành viên với chủ hộ"
                      >
                        <SelectValue placeholder="Chọn quan hệ (tuỳ chọn)..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Chọn quan hệ (tuỳ chọn)...</SelectItem>
                        {ALLOWED_RELATIONS.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        className="accent-btn action-btn"
                        disabled={addMemberSaving || !addMemberSelectedId}
                        onClick={addMember}
                      >
                        Thêm
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="accent-outline action-btn"
                        disabled={addMemberSaving}
                        onClick={() => {
                          setAddMemberQuery("");
                          setAddMemberSelectedId(null);
                          setAddMemberRelation("");
                          setAddMemberError(null);
                        }}
                        aria-label="Xóa lựa chọn thêm thành viên"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {membersLoading ? (
                  <div className="text-sm text-muted-foreground">Đang tải danh sách thành viên...</div>
                ) : (
                  <div className="rounded-md border divide-y overflow-x-hidden">
                    {Array.isArray(members) && members.length > 0 ? (
                      members.map((m) => {
                        const isHead = headIdNum !== null && Number(m?.id) === headIdNum;
                        const isEditing = Number(m?.id) === Number(editingMemberId);
                        const isRemoving = Number(m?.id) === Number(removingMemberId);
                        const relationText = isHead ? "Chủ hộ" : (m?.relation_to_head || "-");

                        return (
                          <div key={m?.id} className="px-3 py-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{m?.full_name || "-"}</div>
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                                  <span className="whitespace-nowrap">
                                    {m?.id_number ? `CCCD: ${m.id_number}` : "CCCD: -"}
                                  </span>
                                  <span className="hidden sm:inline" aria-hidden>
                                    •
                                  </span>
                                  <span>
                                    Quan hệ: <span className="text-foreground break-words">{relationText}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {isHead ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button type="button" variant="outline" size="icon" disabled aria-label="Không chỉnh sửa chủ hộ">
                                        <Lock className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent sideOffset={6}>Không chỉnh sửa chủ hộ</TooltipContent>
                                  </Tooltip>
                                ) : isRemoving ? (
                                  <div className="flex items-center gap-2 w-full min-w-0 flex-nowrap">
                                    <div className="text-sm text-muted-foreground min-w-0 flex-1 truncate">
                                      Đưa về trạng thái chưa thuộc hộ nào?
                                    </div>
                                    <Button
                                      type="button"
                                      size="icon"
                                      className="accent-btn action-btn shrink-0"
                                      disabled={removeSaving}
                                      onClick={() => removeMember(m)}
                                      aria-label={removeSaving ? "Đang xóa" : "Xác nhận xóa"}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="accent-outline action-btn shrink-0"
                                      disabled={removeSaving}
                                      onClick={() => {
                                        setRemovingMemberId(null);
                                        setRemoveError(null);
                                      }}
                                      aria-label="Hủy xóa"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : isEditing ? (
                                  <div className="flex items-center gap-2 w-full min-w-0 flex-nowrap">
                                    <Select
                                      value={relationDraft || undefined}
                                      onValueChange={(value) => setRelationDraft(value === "__none__" ? "" : value)}
                                    >
                                      <SelectTrigger
                                        className="border-input dark:bg-input/30 h-9 min-w-0 flex-1 sm:flex-[0_1_16rem]"
                                        aria-label="Chọn quan hệ với chủ hộ"
                                      >
                                        <SelectValue placeholder="Chọn quan hệ..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">Chọn quan hệ...</SelectItem>
                                        {!ALLOWED_RELATIONS.includes(relationDraft) && relationDraft ? (
                                          <SelectItem value={relationDraft}>{relationDraft}</SelectItem>
                                        ) : null}
                                        {ALLOWED_RELATIONS.map((rel) => (
                                          <SelectItem key={rel} value={rel}>
                                            {rel}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      size="icon"
                                      className="accent-btn action-btn shrink-0"
                                      disabled={relationSaving}
                                      onClick={() => saveRelation(m)}
                                      aria-label={relationSaving ? "Đang lưu quan hệ" : "Lưu quan hệ"}>
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="accent-outline action-btn shrink-0"
                                      disabled={relationSaving}
                                      onClick={() => {
                                        setEditingMemberId(null);
                                        setRelationDraft("");
                                        setRelationError(null);
                                      }}
                                      aria-label="Hủy chỉnh sửa quan hệ">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
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
                                            setRemoveError(null);
                                            setRemovingMemberId(null);
                                          }}
                                          aria-label="Chỉnh sửa quan hệ với chủ hộ">
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>Chỉnh sửa quan hệ</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="icon"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => {
                                            setRemovingMemberId(m?.id);
                                            setRemoveError(null);
                                            setEditingMemberId(null);
                                            setRelationDraft("");
                                            setRelationError(null);
                                          }}
                                          aria-label="Xóa thành viên khỏi hộ">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent sideOffset={6}>Xóa khỏi hộ (đưa về chưa thuộc hộ)</TooltipContent>
                                    </Tooltip>
                                  </>
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
          </div>

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
