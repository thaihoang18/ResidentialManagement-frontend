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
        header: () => <div className="text-right">Thao tác</div>,
        enableSorting: false,
        enableGlobalFilter: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(row.original)}
                  aria-label="Sửa"
                  className="accent-text"
                >
                  <Edit2 />
                  <span className="sr-only">Sửa</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Sửa</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(row.original)}
                  aria-label="Xóa"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                  <span className="sr-only">Xóa</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Xóa</TooltipContent>
            </Tooltip>
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
      rowClassName="table-row-hover"
    />
  );
}
