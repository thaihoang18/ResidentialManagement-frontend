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

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
    else setForm((s) => ({ ...s, household_id: s.household_id || "" }));
  }, [initialData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
          <label>Ngày sinh:</label><Input name="date_of_birth" type="date" placeholder="Ngày sinh" value={form.date_of_birth ? form.date_of_birth.substring(0,10) : ""} onChange={handleChange} />
          <label>Nơi sinh:</label><Input name="place_of_birth" placeholder="Nơi sinh" value={form.place_of_birth || ""} onChange={handleChange} />
          <label>Quê quán:</label><Input name="native_place" placeholder="Quê quán" value={form.native_place || ""} onChange={handleChange} />
          <label>Giới tính:</label><Input name="gender" placeholder="Giới tính" value={form.gender || ""} onChange={handleChange} />
          <label>Dân tộc:</label><Input name="ethnicity" placeholder="Dân tộc" value={form.ethnicity || ""} onChange={handleChange} />
          <label>Nghề nghiệp:</label><Input name="occupation" placeholder="Nghề nghiệp" value={form.occupation || ""} onChange={handleChange} />
          <label>Số CMND/CCCD:</label><Input name="id_number" placeholder="Số CMND/CCCD" value={form.id_number || ""} onChange={handleChange} />
          <label>Ngày cấp:</label><Input name="id_issue_date" type="date" placeholder="Ngày cấp" value={form.id_issue_date ? form.id_issue_date.substring(0,10) : ""} onChange={handleChange} />
          <label>Nơi cấp:</label><Input name="id_issue_place" placeholder="Nơi cấp" value={form.id_issue_place || ""} onChange={handleChange} />
          <label>STT hộ khẩu:</label><Input name="household_id" placeholder="STT hộ khẩu" value={form.household_id || ""} onChange={handleChange} />
          <label>Ngày đăng ký thường trú:</label><Input name="registration_date" type="date" placeholder="Ngày đăng ký thường trú" value={form.registration_date ? form.registration_date.substring(0,10) : ""} onChange={handleChange} />
          <label>Quan hệ:</label><Input name="relation_to_head" placeholder="Quan hệ" value={form.relation_to_head || ""} onChange={handleChange} />

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
