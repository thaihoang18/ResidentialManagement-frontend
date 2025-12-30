import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function UserPasswordDialog({ open, onOpenChange, user, saving, error, onSubmit }) {
  const [value, setValue] = useState("");

  const title = useMemo(() => {
    const label = user?.email || user?.full_name || "tài khoản";
    return `Đổi mật khẩu • ${label}`;
  }, [user]);

  function handleOpenChange(next) {
    onOpenChange?.(next);
    if (!next) setValue("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit?.(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
            <div className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="outline"
                className="accent-outline action-btn"
                onClick={() => setValue(generatePassword(12))}
              >
                Tạo nhanh
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Hệ thống sẽ lưu vào trường password_hash.</p>
          </div>

          {error ? <div className="text-sm text-destructive">{error}</div> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="accent-btn" disabled={saving}>
              {saving ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
