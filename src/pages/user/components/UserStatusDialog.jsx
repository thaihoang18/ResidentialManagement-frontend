import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UserStatusDialog({ open, onOpenChange, user, nextStatus, saving, error, onConfirm }) {
  const title = useMemo(() => {
    const label = user?.email || user?.full_name || "tài khoản";
    return nextStatus ? `Mở khóa • ${label}` : `Khóa • ${label}`;
  }, [user, nextStatus]);

  const description = nextStatus
    ? "Tài khoản sẽ hoạt động trở lại và có thể đăng nhập."
    : "Tài khoản sẽ bị khóa và không nên dùng để thao tác nghiệp vụ.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">{description}</div>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            className={nextStatus ? "accent-btn" : "bg-destructive text-white hover:bg-destructive/90"}
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Đang xử lý..." : nextStatus ? "Mở khóa" : "Khóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
