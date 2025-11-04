import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function CalendarHeader({ monthName, year, onPrev, onNext, onToday, onAdd }) {
    return (
        <div className="mb-8">
            <div className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 via-white to-indigo-100 px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-indigo-700 tracking-tight drop-shadow-sm">Lịch họp</h1>
                    <p className="text-base text-gray-500">Xem và quản lý các cuộc họp của cộng đồng</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                    <Button variant="outline" size="sm" onClick={onToday} className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50">Hôm nay</Button>
                    <Button variant="ghost" size="icon" onClick={onPrev} className="bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-100"><ChevronLeftIcon className="w-5 h-5"/></Button>
                    <div
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-semibold text-lg shadow text-center whitespace-nowrap overflow-hidden text-ellipsis border-2 border-indigo-200"
                        style={{ minWidth: '180px', letterSpacing: '0.03em' }}
                    >
                        {monthName} <span className="font-bold">{year}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNext} className="bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-100"><ChevronRightIcon className="w-5 h-5"/></Button>
                    <Button className="ml-4 flex gap-2 items-center px-5 py-2 rounded-xl shadow font-semibold text-base bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 transition-colors" onClick={onAdd}>
                        <PlusIcon className="w-5 h-5" />
                        <span>Tạo cuộc họp</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
