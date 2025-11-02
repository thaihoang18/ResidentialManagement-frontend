import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function CalendarHeader({ monthName, year, onPrev, onNext, onToday, onAdd }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-semibold">Lịch họp</h1>
                <p className="text-sm text-gray-500">Xem và quản lý các cuộc họp của cộng đồng</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onToday} style={{ backgroundColor: '#ffffff', color: '#000000' }}>Hôm nay</Button>
                <Button variant="ghost" size="icon" onClick={onPrev} style={{ backgroundColor: '#ffffff', color: '#000000' }}><ChevronLeftIcon className="w-4 h-4"/></Button>
                <div
                    className="px-4 py-2 border rounded-md bg-gray-50 font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ minWidth: '180px' }} 
                >
                    {monthName} {year}
                </div>
                <Button variant="ghost" size="icon" onClick={onNext} style={{ backgroundColor: '#ffffff', color: '#000000' }}><ChevronRightIcon className="w-4 h-4"/></Button>
                <Button className="ml-4" onClick={onAdd} style={{ backgroundImage: 'linear-gradient(90deg,#2563eb,#4f46e5)', color: '#ffffff' }}>
                    <PlusIcon className="w-4 h-4" />
                    <span>Tạo cuộc họp</span>
                </Button>
            </div>
        </div>
    );
}
