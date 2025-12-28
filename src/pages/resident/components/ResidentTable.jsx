import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Edit2, Trash2 } from "lucide-react";

export default function ResidentTable({ data = [], onEdit, onDelete, loading }) {
  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return "-";
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", cell: ({ row }) => row.original.id },
      { accessorKey: "full_name", header: "Họ và tên", cell: ({ row }) => {
        const r = row.original;
        const idIssueDate = formatDate(r.id_issue_date);
        const regDate = formatDate(r.registration_date);
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-dotted underline-offset-2">{r.full_name}</span>
            </TooltipTrigger>
            <TooltipContent sideOffset={6} className="max-w-xs">
              <div>Quê quán: {r.native_place || "-"}</div>
              <div>Ngày cấp CCCD: {idIssueDate}</div>
              <div>Nơi cấp CCCD: {r.id_issue_place || "-"}</div>
              <div>Ngày đăng ký thường trú: {regDate}</div>
            </TooltipContent>
          </Tooltip>
        );
      }},
      { accessorKey: "date_of_birth", header: "Ngày sinh", cell: ({ row }) => formatDate(row.original.date_of_birth) },
      { accessorKey: "place_of_birth", header: "Nơi sinh" },
      { accessorKey: "gender", header: "Giới tính" },
      { accessorKey: "ethnicity", header: "Dân tộc" },
      { accessorKey: "occupation", header: "Nghề nghiệp" },
      { accessorKey: "id_number", header: "Số CMND/CCCD" },
      { accessorKey: "household_id", header: "STT hộ khẩu thường trú" },
      { accessorKey: "relation_to_head", header: "Quan hệ" },
      { id: "actions", header: "Thao tác", enableSorting: false, enableGlobalFilter: false, enableColumnFilter: false, cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            title="Sửa"
            className="bg-white accent-text transition-transform hover:-translate-y-0.5"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            title="Xóa"
            className="bg-white accent-text transition-transform hover:-translate-y-0.5"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )},
    ],
    [onEdit, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      enablePagination
      pageSize={20}
      enableSearch
      searchPlaceholder="Tìm theo tên, số CMND, nơi sinh..."
      enableFilters
      filters={[
        { id: "full_name", label: "Họ và tên", type: "text", placeholder: "VD: Nguyễn Văn A" },
        { id: "place_of_birth", label: "Nơi sinh", type: "text", placeholder: "VD: Hà Nội" },
        { id: "gender", label: "Giới tính", type: "select"},
        { id: "ethnicity", label: "Dân tộc", type: "select"},
        { id: "occupation", label: "Nghề nghiệp", type: "select"},
        { id: "relation_to_head", label: "Quan hệ", type: "select"},
      ]}
      rowClassName="hover:bg-teal-50"
    />
  );
}
