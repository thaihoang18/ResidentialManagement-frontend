import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateField } from "@/components/ui/date-field";
import { toLocalYmd } from "@/lib/date";

export default function ResidentFormDialog({ open, onClose, onSaved, initialData }) {
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    place_of_birth: "",
    native_place: "",
    ethnicity: "",
    occupation: "",
    id_number: "",
    id_issue_date: "",
    id_issue_place: "",
    previous_address: "",
    relation_to_head: "",
    gender: "",
    status: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emptyForm = {
    full_name: "",
    date_of_birth: "",
    place_of_birth: "",
    native_place: "",
    ethnicity: "",
    occupation: "",
    id_number: "",
    id_issue_date: "",
    id_issue_place: "",
    previous_address: "",
    relation_to_head: "",
    gender: "",
    status: "",
  };

  useEffect(() => {
    if (initialData) {
      // Normalize date fields to yyyy-mm-dd in local time to avoid off-by-one when backend returns ISO timestamps.
      setForm({
        ...initialData,
        date_of_birth: toLocalYmd(initialData.date_of_birth),
        id_issue_date: toLocalYmd(initialData.id_issue_date),
      });
    } else {
      setForm({ ...emptyForm });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setSubmitError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!String(form.full_name || "").trim()) {
      setSubmitError("Vui lòng nhập họ và tên.");
      return;
    }

    setIsSubmitting(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/residents/${initialData.id}` : "/api/residents";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa cư dân" : "Thêm cư dân"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <Input
                  name="full_name"
                  placeholder="Nguyễn Văn A"
                  value={form.full_name || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Giới tính</label>
                <Select
                  value={form.gender || undefined}
                  onValueChange={(v) => handleChange({ target: { name: "gender", value: v } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày sinh</label>
                <DateField
                  name="date_of_birth"
                  placeholder="Chọn ngày sinh"
                  value={form.date_of_birth || ""}
                  onChange={(next) => {
                    setSubmitError("");
                    setForm((s) => ({ ...s, date_of_birth: next }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={form.status || undefined}
                  onValueChange={(v) => handleChange({ target: { name: "status", value: v } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Thường trú</SelectItem>
                    <SelectItem value="TemporaryStay">Tạm trú</SelectItem>
                    <SelectItem value="TemporaryLeave">Tạm vắng</SelectItem>
                    <SelectItem value="Dead">Đã chết</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nơi sinh</label>
                <Input name="place_of_birth" placeholder="" value={form.place_of_birth || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quê quán</label>
                <Input name="native_place" placeholder="" value={form.native_place || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dân tộc</label>
                <Input name="ethnicity" placeholder="" value={form.ethnicity || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nghề nghiệp</label>
                <Input name="occupation" placeholder="" value={form.occupation || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số CMND/CCCD</label>
                <Input name="id_number" placeholder="" value={form.id_number || ""} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày cấp</label>
                <DateField
                  name="id_issue_date"
                  placeholder="Chọn ngày cấp"
                  value={form.id_issue_date || ""}
                  onChange={(next) => {
                    setSubmitError("");
                    setForm((s) => ({ ...s, id_issue_date: next }));
                  }}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Nơi cấp</label>
                <Input name="id_issue_place" placeholder="" value={form.id_issue_place || ""} onChange={handleChange} />
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
            <Button type="submit" className="accent-btn transition-transform hover:-translate-y-0.5" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
