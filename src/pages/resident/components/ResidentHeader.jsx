import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function ResidentHeader({ onCreate }) {
    return (
        <div className="mb-4">
            <div className="rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Quản lý cư dân</h1>
                    <p className="text-base text-gray-500">Xem và quản lý thông tin cư dân của cộng đồng</p>
                </div>
                <Button
                    onClick={onCreate}
                    className="flex gap-2 items-center px-5 py-2 rounded-xl shadow font-semibold text-base accent-btn transition-transform hover:-translate-y-0.5"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Thêm cư dân</span>
                </Button>
            </div>
        </div>
    );
}
