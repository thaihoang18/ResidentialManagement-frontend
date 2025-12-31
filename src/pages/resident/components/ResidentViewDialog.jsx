import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const statusLabel = (s) => {
  const map = {
    Permanent: "Thường trú",
    TemporaryStay: "Tạm trú",
    TemporaryLeave: "Tạm vắng",
    Dead: "Đã chết",
  };
  return map[s] || s || "-";
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return "-";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function ResidentViewDialog({ open, onOpenChange, resident }) {
  if (!resident) return null;
  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông tin cư dân</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto pr-2">
          <div><strong>Họ và tên:</strong> {resident.full_name || "-"}</div>
          <div><strong>Ngày sinh:</strong> {formatDate(resident.date_of_birth)}</div>
          <div><strong>Nơi sinh:</strong> {resident.place_of_birth || "-"}</div>
          <div><strong>Quê quán:</strong> {resident.native_place || "-"}</div>
          <div><strong>Giới tính:</strong> {resident.gender || "-"}</div>
          <div><strong>Dân tộc:</strong> {resident.ethnicity || "-"}</div>
          <div><strong>Nghề nghiệp:</strong> {resident.occupation || "-"}</div>
          <div><strong>Số CMND/CCCD:</strong> {resident.id_number || "-"}</div>
          <div><strong>Ngày cấp:</strong> {formatDate(resident.id_issue_date)}</div>
          <div><strong>Nơi cấp:</strong> {resident.id_issue_place || "-"}</div>
          <div><strong>Quan hệ:</strong> {resident.relation_to_head || "-"}</div>
          <div><strong>Trạng thái:</strong> {statusLabel(resident.status)}</div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
