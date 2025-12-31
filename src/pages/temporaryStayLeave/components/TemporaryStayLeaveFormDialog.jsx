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
    setForm((prev) => ({ ...prev, temporary_household_id: String(opt.id) }));
    setHouseholdQuery(opt.label);
    setHouseholdPickerOpen(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        console.error(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa giấy" : "Thêm giấy"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-2"
        >
          <label>Loại giấy:</label>
          <select name="paper_type" value={form.paper_type} onChange={handleChange}>
            <option value="TemporaryLeave">Tạm vắng</option>
            <option value="TemporaryStay">Tạm trú</option>
          </select>

          <label>Nhân khẩu:</label>
          {residentOptions.length > 0 ? (
            <>
              <Input
                placeholder="Tìm theo tên / CCCD / ID..."
                value={residentQuery}
                onChange={(e) => setResidentQuery(e.target.value)}
                onFocus={() => setResidentPickerOpen(true)}
                onBlur={() => {
                  // allow click on suggestion before closing
                  setTimeout(() => setResidentPickerOpen(false), 120);
                }}
              />

              {residentPickerOpen && (
                <div className="rounded-md border bg-white">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredResidentOptions.length > 0 ? (
                      filteredResidentOptions.slice(0, 30).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`w-full text-left px-3 py-2 hover:bg-teal-50 ${
                            String(form.resident_id || "") === String(opt.id)
                              ? "bg-teal-50"
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

              <input type="hidden" name="resident_id" value={String(form.resident_id || "")} />
            </>
          ) : (
            <Input
              name="resident_id"
              placeholder="resident_id"
              value={form.resident_id || ""}
              onChange={handleChange}
            />
          )}

          <label>Người khai báo:</label>
          <Input
            name="declarant_name"
            placeholder="Họ và tên người khai báo"
            value={form.declarant_name || ""}
            onChange={handleChange}
          />

          {form.paper_type === "TemporaryStay" && (
            <>
              <label>Nơi tạm trú:</label>
              <Input
                name="temporary_address"
                placeholder="Địa chỉ tạm trú"
                value={form.temporary_address || ""}
                onChange={handleChange}
              />

              <label>Hộ tạm trú (ID hộ khẩu, nếu có):</label>
              {householdOptions.length > 0 ? (
                <>
                  <Input
                    placeholder="Gõ mã hộ / địa chỉ / chủ hộ để tìm..."
                    value={householdQuery}
                    onChange={(e) => {
                      setHouseholdQuery(e.target.value);
                      setForm((prev) => ({ ...prev, temporary_household_id: "" }));
                    }}
                    onFocus={() => setHouseholdPickerOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setHouseholdPickerOpen(false), 120);
                    }}
                  />

                  {householdPickerOpen && (
                    <div className="rounded-md border bg-white">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredHouseholdOptions.length > 0 ? (
                          filteredHouseholdOptions.slice(0, 30).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`w-full text-left px-3 py-2 hover:bg-teal-50 ${
                                String(form.temporary_household_id || "") === String(opt.id)
                                  ? "bg-teal-50"
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
            </>
          )}

          <label>Từ ngày:</label>
          <Input
            type="date"
            name="start_date"
            value={toDateInputValue(form.start_date)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, start_date: e.target.value }))
            }
          />

          <label>Đến ngày (nếu có):</label>
          <Input
            type="date"
            name="end_date"
            value={toDateInputValue(form.end_date)}
            onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
          />

          <label>Lý do:</label>
          <Input
            name="reason"
            placeholder="Lý do"
            value={form.reason || ""}
            onChange={handleChange}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white accent-outline transition-transform hover:-translate-y-0.5"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button type="submit" className="accent-btn transition-transform hover:-translate-y-0.5">
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
