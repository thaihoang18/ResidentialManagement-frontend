import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfileInfoCard({
  email,
  fullName,
  onFullNameChange,
  newEmail,
  onNewEmailChange,
  loading,
  saving,
  canSave,
  onReload,
  onSave,
}) {
  return (
    <Card className="glass-panel border overflow-hidden relative">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ backgroundImage: "var(--primary-gradient)" }}
      />
      <CardHeader className="pb-5">
        <CardTitle className="text-2xl font-bold tracking-tight text-[color:var(--primary-dark)]">
          Thông tin tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-base font-medium text-foreground/90">Họ tên</div>
            <Input value={fullName} onChange={(e) => onFullNameChange(e.target.value)} placeholder="Nhập họ tên" />
          </div>

          <div className="space-y-1">
            <div className="text-base font-medium text-foreground/90">Email hiện tại</div>
            <Input value={email || ""} disabled />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <div className="text-base font-medium text-foreground/90">Đổi email (tuỳ chọn)</div>
            <Input value={newEmail} onChange={(e) => onNewEmailChange(e.target.value)} placeholder="Nhập email mới (nếu muốn)" />
            <div className="text-xs text-muted-foreground">Nếu đổi email, hệ thống sẽ dùng email mới cho lần đăng nhập sau.</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2 pt-5">
        <Button variant="outline" onClick={onReload} disabled={loading || saving}>
          Tải lại
        </Button>
        <Button
          variant="default"
          className="action-btn accent-btn px-5 py-2.5 rounded-xl font-semibold text-base"
          onClick={onSave}
          disabled={loading || saving || !canSave}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </CardFooter>
    </Card>
  );
}
