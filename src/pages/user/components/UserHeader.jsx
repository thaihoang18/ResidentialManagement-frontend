import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, User } from "lucide-react";

export default function UserHeader({ onCreate }) {
  return (
    <div className="mb-6">
      <div className="page-header glass-header rounded-2xl shadow-lg px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 header-gradient border border-border/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <User className="size-7 text-[color:var(--primary-dark)]" />
            <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm accent-text">Quản lý người dùng</h1>
          </div>
          <p className="text-base text-muted-foreground">
            Quản lý tài khoản cán bộ (leader / deputy / officer), phân quyền và trạng thái hoạt động.
          </p>
        </div>

        <Button
          onClick={onCreate}
          className="action-btn flex gap-2 items-center px-5 py-2.5 rounded-xl font-semibold text-base accent-btn"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Tạo tài khoản</span>
        </Button>
      </div>
    </div>
  );
}
