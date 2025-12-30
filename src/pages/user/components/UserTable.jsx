import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, KeyRound, Lock, Unlock } from "lucide-react";

function roleLabel(role) {
  if (role === "leader") return "Leader";
  if (role === "deputy") return "Deputy";
  if (role === "officer") return "Officer";
  return role || "-";
}

function roleVariant(role) {
  if (role === "leader") return "default";
  if (role === "deputy") return "secondary";
  return "outline";
}

export default function UserTable({
  data = [],
  loading,
  roleOptions = [],
  onEdit,
  onPassword,
  onToggleStatus,
  enableRowSelection,
  onSelectionChange,
  resetRowSelectionKey,
}) {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", cell: ({ row }) => row.original.id },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="font-medium text-slate-800">{row.original.email}</span>
        ),
      },
      { accessorKey: "full_name", header: "Họ tên" },
      {
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => {
          const role = row.original.role;
          return <Badge variant={roleVariant(role)}>{roleLabel(role)}</Badge>;
        },
      },
      {
        id: "status",
        accessorFn: (row) => String(!!row.status),
        header: "Trạng thái",
        cell: ({ row }) => {
          const active = !!row.original.status;
          return (
            <Badge variant={active ? "secondary" : "destructive"}>
              {active ? "Hoạt động" : "Đã khóa"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const r = row.original;
          const active = !!r.status;
          return (
            <div className="flex items-center justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit?.(r)}
                    aria-label="Sửa"
                    className="accent-text"
                  >
                    <Edit2 />
                    <span className="sr-only">Sửa</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Sửa thông tin</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPassword?.(r)}
                    aria-label="Đổi mật khẩu"
                    className="accent-text"
                  >
                    <KeyRound />
                    <span className="sr-only">Đổi mật khẩu</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Đổi mật khẩu</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onToggleStatus?.(r)}
                    aria-label={active ? "Khóa" : "Mở khóa"}
                    className={active ? "text-destructive hover:text-destructive" : "accent-text"}
                  >
                    {active ? <Lock /> : <Unlock />}
                    <span className="sr-only">{active ? "Khóa" : "Mở khóa"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>{active ? "Khóa tài khoản" : "Mở khóa"}</TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [onEdit, onPassword, onToggleStatus]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      enableRowSelection={enableRowSelection}
      getRowId={(row) => String(row.id)}
      onSelectionChange={onSelectionChange}
      resetRowSelectionKey={resetRowSelectionKey}
      enablePagination
      pageSize={15}
      enableSearch
      searchPlaceholder="Tìm theo email hoặc họ tên..."
      enableFilters
      filters={[
        {
          id: "role",
          label: "Vai trò",
          type: "select",
          options: roleOptions.map((o) => o.value),
        },
        {
          id: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Lock" },
          ],
        },
      ]}
      rowClassName={(row) => (row.original.status ? "table-row-hover" : "")}
    />
  );
}
