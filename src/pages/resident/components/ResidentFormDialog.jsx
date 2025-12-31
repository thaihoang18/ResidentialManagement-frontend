import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [displayDates, setDisplayDates] = useState({
    date_of_birth: "",
    id_issue_date: "",
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
    if (initialData) {
      // Normalize date fields to yyyy-mm-dd in local time to avoid off-by-one when backend returns ISO timestamps.
      setForm({
        ...initialData,
        date_of_birth: toLocalYmd(initialData.date_of_birth),
        id_issue_date: toLocalYmd(initialData.id_issue_date),
      });
      setDisplayDates({
        date_of_birth: initialData ? formatDateForDisplay(initialData.date_of_birth) : "",
        id_issue_date: initialData ? formatDateForDisplay(initialData.id_issue_date) : "",
      });
    } else {
      setForm({ ...emptyForm });
      setDisplayDates({ date_of_birth: "", id_issue_date: "" });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setSubmitError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, value) => {
    setSubmitError("");
    setDisplayDates((s) => ({ ...s, [name]: value }));
  };

  const handleDateBlur = (name, value) => {
    const iso = parseDisplayToISO(value);
    setForm((s) => ({ ...s, [name]: iso }));
    setDisplayDates((s) => ({ ...s, [name]: formatDateForDisplay(iso) }));
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

  const selectClassName =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
                <select name="gender" value={form.gender || ""} onChange={handleChange} className={selectClassName}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày sinh</label>
                <Input
                  name="date_of_birth"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={displayDates.date_of_birth}
                  onChange={(e) => handleDateChange("date_of_birth", e.target.value)}
                  onBlur={(e) => handleDateBlur("date_of_birth", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Nhập theo định dạng dd/mm/yyyy.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <select name="status" value={form.status || ""} onChange={handleChange} className={selectClassName}>
                  <option value="">Chọn trạng thái</option>
                  <option value="Permanent">Thường trú</option>
                  <option value="TemporaryStay">Tạm trú</option>
                  <option value="TemporaryLeave">Tạm vắng</option>
                  <option value="Dead">Đã chết</option>
                </select>
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
                <Input
                  name="id_issue_date"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={displayDates.id_issue_date}
                  onChange={(e) => handleDateChange("id_issue_date", e.target.value)}
                  onBlur={(e) => handleDateBlur("id_issue_date", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Nhập theo định dạng dd/mm/yyyy.</p>
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
