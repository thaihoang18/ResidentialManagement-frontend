import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, MapPin } from "lucide-react";

export default function TemporaryStayLeaveHeader({ onCreate }) {
  return (
    <div className="mb-4">
      <div className="rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 accent-text">
            <MapPin className="w-6 h-6" />
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">
              Tạm trú / Tạm vắng
            </h1>
          </div>
          <p className="text-base text-gray-500">
            Lập và quản lý giấy tạm trú, tạm vắng theo thời hạn
          </p>
        </div>
        <Button
          onClick={onCreate}
          className="flex gap-2 items-center px-5 py-2 rounded-xl shadow font-semibold text-base accent-btn transition-transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm giấy</span>
        </Button>
      </div>
    </div>
  );
}
