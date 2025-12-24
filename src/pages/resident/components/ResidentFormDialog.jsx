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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-2">
          <Input name="household_id" placeholder="household_id" value={form.household_id || ""} onChange={handleChange} />
          <Input name="full_name" placeholder="Họ và tên" value={form.full_name || ""} onChange={handleChange} />
          <Input name="date_of_birth" type="date" placeholder="Ngày sinh" value={form.date_of_birth ? form.date_of_birth.substring(0,10) : ""} onChange={handleChange} />
          <Input name="place_of_birth" placeholder="Nơi sinh" value={form.place_of_birth || ""} onChange={handleChange} />
          <Input name="native_place" placeholder="Quê quán" value={form.native_place || ""} onChange={handleChange} />
          <Input name="occupation" placeholder="Nghề nghiệp" value={form.occupation || ""} onChange={handleChange} />
          <Input name="id_number" placeholder="Số CMND/CCCD" value={form.id_number || ""} onChange={handleChange} />

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
