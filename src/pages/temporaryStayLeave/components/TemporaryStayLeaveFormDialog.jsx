import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/ui/date-field";
import { toLocalYmd } from "@/lib/date";

const toDateInputValue = (value) => toLocalYmd(value);

export default function TemporaryStayLeaveFormDialog({
  open,
  onClose,
  onSaved,
  initialData,
  residents = [],
  households = [],
}) {
  const [residentQuery, setResidentQuery] = useState("");
  const [residentPickerOpen, setResidentPickerOpen] = useState(false);
  const [householdQuery, setHouseholdQuery] = useState("");
  const [householdPickerOpen, setHouseholdPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    resident_id: "",
    declarant_name: "",
    paper_type: "TemporaryLeave",
    temporary_address: "",
    temporary_household_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        resident_id: initialData.resident_id ?? "",
        declarant_name: initialData.declarant_name ?? "",
        paper_type: initialData.paper_type ?? "TemporaryLeave",
        temporary_address: initialData.temporary_address ?? "",
        temporary_household_id: initialData.temporary_household_id ?? "",
        start_date: toDateInputValue(initialData.start_date),
        end_date: toDateInputValue(initialData.end_date),
        reason: initialData.reason ?? "",
      });
    } else {
      setForm({
        resident_id: "",
        declarant_name: "",
        paper_type: "TemporaryLeave",
        temporary_address: "",
        temporary_household_id: "",
        start_date: "",
        end_date: "",
        reason: "",
      });
    }
  }, [initialData, open]);

  useEffect(() => {
    if (open) {
      setSubmitError("");
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setResidentPickerOpen(false);
      setHouseholdPickerOpen(false);

      if (initialData?.resident_id != null) {
        const list = Array.isArray(residents) ? residents : [];
        const found = list.find((r) => String(r.id) === String(initialData.resident_id));
        if (found) {
          const label = `${found.full_name || "(Không tên)"} (ID ${found.id}${found.id_number ? ` - ${found.id_number}` : ""})`;
          setResidentQuery(label);
          return;
        }
      }

      setResidentQuery("");

      if (initialData?.temporary_household_id != null) {
        const list = Array.isArray(households) ? households : [];
        const found = list.find(
          (h) => String(h.id) === String(initialData.temporary_household_id)
        );
        if (found) {
          const addr = `${found.house_number || ""} ${found.street || ""}`.trim();
          const label = `${found.household_code || `Hộ #${found.id}`}${addr ? ` - ${addr}` : ""}${
            found.head_name ? ` (Chủ hộ: ${found.head_name})` : ""
          }`;
          setHouseholdQuery(label);
          return;
        }
      }

      setHouseholdQuery("");
    }
  }, [open]);

  const residentOptions = useMemo(() => {
    const list = Array.isArray(residents) ? residents : [];
    return list
      .map((r) => ({
        id: r.id,
        label: `${r.full_name || "(Không tên)"} (ID ${r.id}${r.id_number ? ` - ${r.id_number}` : ""})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [residents]);

  const filteredResidentOptions = useMemo(() => {
    const q = residentQuery.trim().toLowerCase();
    if (!q) return residentOptions;
    return residentOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [residentOptions, residentQuery]);

  const handlePickResident = (opt) => {
    setSubmitError("");
    setForm((prev) => ({ ...prev, resident_id: String(opt.id) }));
    setResidentQuery(opt.label);
    setResidentPickerOpen(false);
  };

  const householdOptions = useMemo(() => {
    const list = Array.isArray(households) ? households : [];
    return list
      .map((h) => {
        const addr = `${h.house_number || ""} ${h.street || ""}`.trim();
        const label = `${h.household_code || `Hộ #${h.id}`}${addr ? ` - ${addr}` : ""}${
          h.head_name ? ` (Chủ hộ: ${h.head_name})` : ""
        }`;
        return {
          id: h.id,
          household_code: h.household_code,
          label,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
  }, [households]);

  const filteredHouseholdOptions = useMemo(() => {
    const q = householdQuery.trim().toLowerCase();
    if (!q) return householdOptions;
    return householdOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [householdOptions, householdQuery]);

  const handlePickHousehold = (opt) => {
    setSubmitError("");
    setForm((prev) => ({ ...prev, temporary_household_id: String(opt.id) }));
    setHouseholdQuery(opt.label);
    setHouseholdPickerOpen(false);
  };

  const handleChange = (e) => {
    setSubmitError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!String(form.resident_id || "").trim()) {
      setSubmitError("Vui lòng chọn nhân khẩu.");
      return;
    }
    if (!String(form.start_date || "").trim()) {
      setSubmitError("Vui lòng chọn ngày bắt đầu.");
      return;
    }
    if (
      form.paper_type === "TemporaryStay" &&
      !String(form.temporary_address || "").trim() &&
      !String(form.temporary_household_id || "").trim()
    ) {
      setSubmitError("Vui lòng nhập nơi tạm trú hoặc chọn hộ tạm trú.");
      return;
    }

    const payload = {
      resident_id: form.resident_id,
      declarant_name: form.declarant_name,
      paper_type: form.paper_type,
      start_date: form.start_date,
      end_date: form.end_date || null,
      reason: form.reason,
      temporary_address: form.paper_type === "TemporaryStay" ? form.temporary_address : null,
      temporary_household_id:
        form.paper_type === "TemporaryStay" ? form.temporary_household_id || null : null,
    };

    setIsSubmitting(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/temporary-stay-leave/${initialData.id}`
        : "/api/temporary-stay-leave";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onSaved();
      } else {
        setSubmitError(json?.message || "Lưu thất bại. Vui lòng thử lại.");
        console.error(json);
      }
    } catch (err) {
      setSubmitError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa giấy" : "Thêm giấy"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại giấy</label>
                <select
                  name="paper_type"
                  value={form.paper_type}
                  onChange={handleChange}
                  className={selectClassName}
                >
                  <option value="TemporaryLeave">Tạm vắng</option>
                  <option value="TemporaryStay">Tạm trú</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Người khai báo</label>
                <Input
                  name="declarant_name"
                  placeholder="Họ và tên người khai báo"
                  value={form.declarant_name || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  Nhân khẩu <span className="text-destructive">*</span>
                </label>
                {residentOptions.length > 0 ? (
                  <>
                    <Input
                      placeholder="Tìm theo tên / CCCD / ID..."
                      value={residentQuery}
                      onChange={(e) => {
                        setSubmitError("");
                        setResidentQuery(e.target.value);
                      }}
                      onFocus={() => setResidentPickerOpen(true)}
                      onBlur={() => {
                        // allow click on suggestion before closing
                        setTimeout(() => setResidentPickerOpen(false), 120);
                      }}
                    />

                    {residentPickerOpen && (
                      <div className="rounded-md border bg-popover">
                        <div className="max-h-48 overflow-y-auto">
                          {filteredResidentOptions.length > 0 ? (
                            filteredResidentOptions.slice(0, 30).map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                className={`w-full text-left px-3 py-2 hover:bg-accent ${
                                  String(form.resident_id || "") === String(opt.id)
                                    ? "bg-accent"
                                    : ""
                                }`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handlePickResident(opt)}
                              >
                                {opt.label}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Không tìm thấy nhân khẩu phù hợp
                            </div>
                          )}
                        </div>

                        {filteredResidentOptions.length > 30 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                            Đang hiển thị 30 kết quả đầu tiên
                          </div>
                        )}
                      </div>
                    )}

                    <input
                      type="hidden"
                      name="resident_id"
                      value={String(form.resident_id || "")}
                    />
                  </>
                ) : (
                  <Input
                    name="resident_id"
                    placeholder="resident_id"
                    value={form.resident_id || ""}
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Từ ngày <span className="text-destructive">*</span>
                </label>
                <DateField
                  name="start_date"
                  required
                  placeholder="Chọn ngày bắt đầu"
                  value={toDateInputValue(form.start_date)}
                  onChange={(next) => {
                    setSubmitError("");
                    setForm((prev) => ({ ...prev, start_date: next }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Đến ngày (nếu có)</label>
                <DateField
                  name="end_date"
                  placeholder="Chọn ngày kết thúc"
                  value={toDateInputValue(form.end_date)}
                  onChange={(next) => {
                    setSubmitError("");
                    setForm((prev) => ({ ...prev, end_date: next }));
                  }}
                />
              </div>

              {form.paper_type === "TemporaryStay" && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Nơi tạm trú</label>
                    <Input
                      name="temporary_address"
                      placeholder="Địa chỉ tạm trú"
                      value={form.temporary_address || ""}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Có thể để trống nếu đã chọn hộ tạm trú.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Hộ tạm trú (nếu có)</label>
                    {householdOptions.length > 0 ? (
                      <>
                        <Input
                          placeholder="Gõ mã hộ / địa chỉ / chủ hộ để tìm..."
                          value={householdQuery}
                          onChange={(e) => {
                            setSubmitError("");
                            setHouseholdQuery(e.target.value);
                            setForm((prev) => ({ ...prev, temporary_household_id: "" }));
                          }}
                          onFocus={() => setHouseholdPickerOpen(true)}
                          onBlur={() => {
                            setTimeout(() => setHouseholdPickerOpen(false), 120);
                          }}
                        />

                        {householdPickerOpen && (
                          <div className="rounded-md border bg-popover">
                            <div className="max-h-48 overflow-y-auto">
                              {filteredHouseholdOptions.length > 0 ? (
                                filteredHouseholdOptions.slice(0, 30).map((opt) => (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    className={`w-full text-left px-3 py-2 hover:bg-accent ${
                                      String(form.temporary_household_id || "") ===
                                      String(opt.id)
                                        ? "bg-accent"
                                        : ""
                                    }`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handlePickHousehold(opt)}
                                  >
                                    {opt.label}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Không tìm thấy hộ phù hợp
                                </div>
                              )}
                            </div>

                            {filteredHouseholdOptions.length > 30 && (
                              <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                                Đang hiển thị 30 kết quả đầu tiên
                              </div>
                            )}
                          </div>
                        )}

                        <input
                          type="hidden"
                          name="temporary_household_id"
                          value={String(form.temporary_household_id || "")}
                        />
                      </>
                    ) : (
                      <Input
                        name="temporary_household_id"
                        placeholder="temporary_household_id"
                        value={form.temporary_household_id || ""}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Lý do</label>
                <Input
                  name="reason"
                  placeholder="Lý do"
                  value={form.reason || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {submitError ? <p className="mt-3 text-sm text-destructive">{submitError}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white accent-outline transition-transform hover:-translate-y-0.5"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="accent-btn transition-transform hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
