import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function CalendarHeader({ monthName, year, onPrev, onNext, onToday, onAdd }) {
    return (
        <div className="mb-8">
            <div className="rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Lịch họp</h1>
                    <p className="text-base text-gray-500">Xem và quản lý các cuộc họp của cộng đồng</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Button variant="outline" size="sm" onClick={onToday} className="bg-white accent-outline">Hôm nay</Button>
                    <Button variant="ghost" size="icon" onClick={onPrev} className="bg-white accent-text"><ChevronLeftIcon className="w-5 h-5"/></Button>
                    <div
                        className="px-6 py-2 rounded-xl text-white font-semibold text-lg shadow text-center whitespace-nowrap overflow-hidden text-ellipsis border-2 accent-gradient-bg"
                        style={{ minWidth: '180px', letterSpacing: '0.03em' }}
                    >
                        {monthName} <span className="font-bold">{year}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNext} className="bg-white accent-text"><ChevronRightIcon className="w-5 h-5"/></Button>
                    <Button className="ml-4 flex gap-2 items-center px-5 py-2 rounded-xl shadow font-semibold text-base accent-btn" onClick={onAdd}>
                        <PlusIcon className="w-5 h-5" />
                        <span>Tạo cuộc họp</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
