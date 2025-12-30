import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function CalendarHeader({ monthName, year, onPrev, onNext, onToday, onAdd }) {
    return (
        <div className="mb-6">
            <div className="page-header glass-header rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient border border-border/60">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Lịch họp</h1>
                    <p className="text-base text-muted-foreground">Xem và quản lý các cuộc họp của cộng đồng</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Button variant="outline" size="sm" onClick={onToday} className="accent-outline">Hôm nay</Button>
                    <Button variant="outline" size="icon" onClick={onPrev} className="accent-outline">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </Button>
                    <div
                        className="px-6 py-2 rounded-xl text-white font-semibold text-lg shadow text-center whitespace-nowrap overflow-hidden text-ellipsis border-2 accent-gradient-bg"
                        style={{ minWidth: "180px", letterSpacing: "0.03em" }}
                    >
                        {monthName} <span className="font-bold">{year}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={onNext} className="accent-outline">
                        <ChevronRightIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={onAdd}
                        className="action-btn flex gap-2 items-center px-5 py-2.5 rounded-xl font-semibold text-base accent-btn"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Tạo cuộc họp</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
