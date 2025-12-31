import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const statusLabel = (s) => {
  const map = {
    Permanent: "Thường trú",
    TemporaryStay: "Tạm trú",
    TemporaryLeave: "Tạm vắng",
    Dead: "Đã chết",
  };
  return map[s] || s || "-";
};

const statusVariant = (s) => {
  if (s === "Dead") return "destructive";
  if (s === "TemporaryStay") return "secondary";
  if (s === "TemporaryLeave") return "outline";
  return "default";
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

  const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-3">
      <div className="text-xs font-medium text-muted-foreground sm:pt-0.5">{label}</div>
      <div className="text-sm font-medium text-foreground break-words">{value || "-"}</div>
    </div>
  );

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" overlayClassName="bg-transparent">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Thông tin cư dân</span>
            <Badge variant={statusVariant(resident.status)}>{statusLabel(resident.status)}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <Card className="rm-border-only">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{resident.full_name || "-"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Ngày sinh" value={formatDate(resident.date_of_birth)} />
                <InfoRow label="Giới tính" value={resident.gender} />
                <InfoRow label="Dân tộc" value={resident.ethnicity} />
                <InfoRow label="Nghề nghiệp" value={resident.occupation} />
              </CardContent>
            </Card>

            <Card className="rm-border-only">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Thông tin nhân thân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Nơi sinh" value={resident.place_of_birth} />
                <InfoRow label="Quê quán" value={resident.native_place} />
                <Separator />
                <InfoRow label="Quan hệ" value={resident.relation_to_head} />
              </CardContent>
            </Card>

            <Card className="rm-border-only">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Giấy tờ tùy thân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Số CMND/CCCD" value={resident.id_number} />
                <InfoRow label="Ngày cấp" value={formatDate(resident.id_issue_date)} />
                <InfoRow label="Nơi cấp" value={resident.id_issue_place} />
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
