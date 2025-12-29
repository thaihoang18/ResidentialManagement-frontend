import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function TemporaryStayLeaveHeader({ onCreate }) {
  return (
    <div className="mb-6">
      <div className="page-header rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient border border-border/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">
              Tạm trú / Tạm vắng
            </h1>
          </div>
          <p className="text-base text-muted-foreground">
            Lập và quản lý giấy tạm trú, tạm vắng theo thời hạn
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="action-btn flex gap-2 items-center px-5 py-2.5 rounded-xl font-semibold text-base accent-btn"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm giấy</span>
        </Button>
      </div>
    </div>
  );
}
