import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResidentFormDialog({ open, onClose, onSaved, initialData }) {
  const [form, setForm] = useState({
    household_id: "",
    full_name: "",
    date_of_birth: "",
    place_of_birth: "",
    native_place: "",
    ethnicity: "",
    occupation: "",
    id_number: "",
    id_issue_date: "",
    id_issue_place: "",
    registration_date: "",
    previous_address: "",
    relation_to_head: "",
    gender: "",
    status: "",
  });
  const [displayDates, setDisplayDates] = useState({
    date_of_birth: "",
    id_issue_date: "",
    registration_date: "",
  });

  const pad = (n) => String(n).padStart(2, "0");
  const formatDateForDisplay = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const parseDisplayToISO = (str) => {
    if (!str) return "";
    const dmY = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/;
    const ymd = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/;
    let m;
    if ((m = str.match(dmY))) {
      const d = pad(m[1]);
      const mo = pad(m[2]);
      const y = m[3];
      return `${y}-${mo}-${d}`;
    }
    if ((m = str.match(ymd))) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
    const parsed = new Date(str);
    if (!isNaN(parsed)) {
      return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    }
    return "";
  };

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
    else setForm((s) => ({ ...s, household_id: s.household_id || "" }));
    setDisplayDates({
      date_of_birth: initialData ? formatDateForDisplay(initialData.date_of_birth) : "",
      id_issue_date: initialData ? formatDateForDisplay(initialData.id_issue_date) : "",
      registration_date: initialData ? formatDateForDisplay(initialData.registration_date) : "",
    });
  }, [initialData]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDateChange = (name, value) => {
    setDisplayDates((s) => ({ ...s, [name]: value }));
  };

  const handleDateBlur = (name, value) => {
    const iso = parseDisplayToISO(value);
    setForm((s) => ({ ...s, [name]: iso }));
    setDisplayDates((s) => ({ ...s, [name]: formatDateForDisplay(iso) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/residents/${initialData.id}` : "/api/residents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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
          <DialogTitle>{initialData ? "Sửa cư dân" : "Thêm cư dân"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-2">
          <label>Họ và tên:</label><Input name="full_name" placeholder="Họ và tên" value={form.full_name || ""} onChange={handleChange} />
          <label>Ngày sinh:</label>
          <Input name="date_of_birth" type="text" placeholder="dd/mm/yyyy" value={displayDates.date_of_birth} onChange={(e) => handleDateChange("date_of_birth", e.target.value)} onBlur={(e) => handleDateBlur("date_of_birth", e.target.value)} />
          <label>Nơi sinh:</label><Input name="place_of_birth" placeholder="Nơi sinh" value={form.place_of_birth || ""} onChange={handleChange} />
          <label>Quê quán:</label><Input name="native_place" placeholder="Quê quán" value={form.native_place || ""} onChange={handleChange} />
          <label>Giới tính:</label>
            <select
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          <label>Dân tộc:</label><Input name="ethnicity" placeholder="Dân tộc" value={form.ethnicity || ""} onChange={handleChange} />
          <label>Nghề nghiệp:</label><Input name="occupation" placeholder="Nghề nghiệp" value={form.occupation || ""} onChange={handleChange} />
          <label>Số CMND/CCCD:</label><Input name="id_number" placeholder="Số CMND/CCCD" value={form.id_number || ""} onChange={handleChange} />
          <label>Ngày cấp:</label>
          <Input name="id_issue_date" type="text" placeholder="dd/mm/yyyy" value={displayDates.id_issue_date} onChange={(e) => handleDateChange("id_issue_date", e.target.value)} onBlur={(e) => handleDateBlur("id_issue_date", e.target.value)} />
          <label>Nơi cấp:</label><Input name="id_issue_place" placeholder="Nơi cấp" value={form.id_issue_place || ""} onChange={handleChange} />
          <label>STT hộ khẩu:</label><Input name="household_id" placeholder="STT hộ khẩu" value={form.household_id || ""} onChange={handleChange} />
          <label>Ngày đăng ký thường trú:</label>
          <Input name="registration_date" type="text" placeholder="dd/mm/yyyy" value={displayDates.registration_date} onChange={(e) => handleDateChange("registration_date", e.target.value)} onBlur={(e) => handleDateBlur("registration_date", e.target.value)} />

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="bg-white accent-outline transition-transform hover:-translate-y-0.5" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="accent-btn transition-transform hover:-translate-y-0.5">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
