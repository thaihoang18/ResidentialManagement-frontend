import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TemporaryStayLeaveDeleteDialog({ target, onClose, onDeleted }) {
  if (!target) return null;

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/temporary-stay-leave/${target.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) onDeleted();
    } catch (e) {
      console.error(e);
    }
  };

  const name = target.resident_full_name || `ID ${target.resident_id}`;

  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Bạn có muốn xóa giấy của <strong>{name}</strong> không?
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-white accent-outline transition-transform hover:-translate-y-0.5"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="accent-btn transition-transform hover:-translate-y-0.5"
            onClick={handleDelete}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
