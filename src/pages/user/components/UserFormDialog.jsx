import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function generatePassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(length);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  mode,
  saving,
  error,
  form,
  onChange,
  onSubmit,
  roleOptions = [],
}) {
  const isCreate = mode === "create";

  const title = isCreate ? "Tạo tài khoản" : "Cập nhật tài khoản";

  const statusLabel = form?.status ? "Hoạt động" : "Đã khóa";
  const statusBadge = form?.status ? "secondary" : "destructive";

  const roleList = useMemo(() => {
    if (Array.isArray(roleOptions) && roleOptions.length) return roleOptions;
    return [
      { value: "leader", label: "leader" },
      { value: "deputy", label: "deputy" },
      { value: "officer", label: "officer" },
    ];
  }, [roleOptions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {title}
            <Badge variant={statusBadge}>{statusLabel}</Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              value={form?.email || ""}
              onChange={(e) => onChange?.({ ...form, email: e.target.value })}
              placeholder="vd: officer01@khu-a.local"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">Dùng làm tên đăng nhập / định danh tài khoản.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Họ và tên</label>
            <Input
              value={form?.full_name || ""}
              onChange={(e) => onChange?.({ ...form, full_name: e.target.value })}
              placeholder="vd: Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Vai trò</label>
            <Select value={form?.role || undefined} onValueChange={(v) => onChange?.({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleList.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Trạng thái</label>
            <Select
              value={form?.status ? "true" : "false"}
              onValueChange={(v) => onChange?.({ ...form, status: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCreate ? (
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">Mật khẩu</label>
              <div className="flex gap-2">
                <Input
                  value={form?.password_hash || ""}
                  onChange={(e) => onChange?.({ ...form, password_hash: e.target.value })}
                  placeholder="Nhập mật khẩu (hệ thống sẽ lưu vào password_hash)"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="accent-outline action-btn"
                  onClick={() => onChange?.({ ...form, password_hash: generatePassword(12) })}
                >
                  Tạo nhanh
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bạn có thể tự đặt hoặc bấm “Tạo nhanh”.
              </p>
            </div>
          ) : (
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">
                Mật khẩu tách riêng ở nút “Đổi mật khẩu” trong bảng.
              </p>
            </div>
          )}

          {error ? (
            <div className="md:col-span-2 text-sm text-destructive">{error}</div>
          ) : null}

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Hủy
            </Button>
            <Button type="submit" className="accent-btn" disabled={saving}>
              {saving ? "Đang lưu..." : isCreate ? "Tạo" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
