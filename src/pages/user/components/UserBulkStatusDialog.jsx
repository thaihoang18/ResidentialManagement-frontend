import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UserBulkStatusDialog({
  open,
  onOpenChange,
  count,
  nextStatus,
  saving,
  error,
  onConfirm,
}) {
  const title = useMemo(() => {
    if (nextStatus) return `Mở khóa hàng loạt (${count})`;
    return `Khóa hàng loạt (${count})`;
  }, [count, nextStatus]);

  const description = nextStatus
    ? "Các tài khoản đã chọn sẽ hoạt động trở lại."
    : "Các tài khoản đã chọn sẽ bị khóa.";

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
