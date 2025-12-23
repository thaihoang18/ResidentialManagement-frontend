import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function HouseholdHeader({ onCreate }) {
    return (
        <div className="rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Quản lý hộ khẩu</h1>
                <p className="text-base text-gray-500">Xem và quản lý thông tin hộ khẩu của cộng đồng</p>
            </div>
            <Button
                onClick={onCreate}
                className="flex gap-2 items-center px-5 py-2 rounded-xl shadow font-semibold text-base accent-btn transition-transform hover:-translate-y-0.5"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Thêm hộ khẩu</span>
            </Button>
        </div>
    );
}
