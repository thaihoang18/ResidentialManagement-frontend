import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ResidentDeleteDialog({ target, onClose, onDeleted }) {
  if (!target) return null;

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/residents/${target.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) onDeleted();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
        </DialogHeader>
        <div className="py-4">Bạn có muốn xóa cư dân <strong>{target.full_name}</strong> không?</div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={handleDelete}>Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
