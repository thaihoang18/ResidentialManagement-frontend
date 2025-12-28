import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, Trash2 } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const formatPaperType = (paperType) => {
  if (paperType === "TemporaryStay") return "Tạm trú";
  if (paperType === "TemporaryLeave") return "Tạm vắng";
  return paperType || "-";
};

export default function TemporaryStayLeaveTable({ data = [], onEdit, onDelete, loading }) {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", cell: ({ row }) => row.original.id },
      {
        id: "paper_type",
        accessorFn: (row) => formatPaperType(row.paper_type),
        header: "Loại giấy",
        cell: ({ row }) => row.getValue("paper_type"),
      },
      {
        id: "resident_full_name",
        accessorFn: (row) => {
          const name = row.resident_full_name || "";
          const idNumber = row.resident_id_number || "";
          const id = row.resident_id != null ? String(row.resident_id) : "";
          return `${name} ${idNumber} ${id}`.trim();
        },
        header: "Nhân khẩu",
        cell: ({ row }) => {
          const r = row.original;
          const label = r.resident_full_name || `ID ${r.resident_id}`;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help underline decoration-dotted underline-offset-2">
                  {label}
                </span>
              </TooltipTrigger>
              <TooltipContent sideOffset={6} className="max-w-xs">
                <div>Số CCCD/CMND: {r.resident_id_number || "-"}</div>
                <div>Hộ thường trú: {r.resident_household_code || r.resident_household_id || "-"}</div>
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "start_date",
        header: "Từ ngày",
        cell: ({ row }) => formatDate(row.original.start_date),
      },
      {
        accessorKey: "end_date",
        header: "Đến ngày",
        cell: ({ row }) => formatDate(row.original.end_date),
      },
      {
        accessorKey: "temporary_address",
        header: "Nơi tạm trú",
        cell: ({ row }) => {
          const r = row.original;
          if (r.paper_type !== "TemporaryStay") return "-";
          return r.temporary_address || r.temporary_household_code || (r.temporary_household_id ? `Hộ #${r.temporary_household_id}` : "-");
        },
      },
      { accessorKey: "declarant_name", header: "Người khai báo" },
      {
        accessorKey: "reason",
        header: "Lý do",
        cell: ({ row }) => row.original.reason || "-",
      },
      {
        id: "actions",
        header: "Thao tác",
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
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
        ),
      },
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
      searchPlaceholder="Tìm theo tên nhân khẩu, CCCD/CMND..."
      enableFilters
      filters={[
        { id: "paper_type", label: "Loại giấy", type: "select" },
        {
          id: "resident_full_name",
          label: "Nhân khẩu",
          type: "text",
          placeholder: "Nhập tên / CCCD / ID...",
        },
      ]}
      rowClassName="hover:bg-teal-50"
    />
  );
}
