import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, Split, Trash2 } from "lucide-react";

export default function HouseholdTable({ data, onEdit, onDelete, onSplit }) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "STT",
        cell: ({ row }) => row.original.id,
      },
      {
        accessorKey: "household_code",
        header: "Mã hộ",
      },
      {
        accessorKey: "house_number",
        header: "Số nhà",
        cell: ({ row }) => row.original.house_number || "-",
      },
      {
        accessorKey: "street",
        header: "Tên đường",
        cell: ({ row }) => row.original.street || "-",
      },
      {
        accessorKey: "head_name",
        header: "Tên chủ hộ",
        cell: ({ row }) => row.original.head_name || "-",
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
                  onClick={() => onSplit(row.original)}
                  aria-label="Tách hộ"
                  className="accent-text"
                >
                  <Split />
                  <span className="sr-only">Tách hộ</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Tách hộ</TooltipContent>
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
    [onDelete, onEdit, onSplit]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enablePagination
      pageSize={20}
      enableSearch
      searchPlaceholder="Tìm theo mã hộ, số nhà, tên đường, chủ hộ..."
      enableFilters
      filters={[
        { id: "household_code", label: "Mã hộ", type: "text", placeholder: "VD: HK001" },
        { id: "house_number", label: "Số nhà", type: "text", placeholder: "VD: 12A" },
        { id: "street", label: "Tên đường", type: "select" },
        { id: "head_name", label: "Tên chủ hộ", type: "text", placeholder: "VD: Nguyễn Văn A" },
      ]} 
      rowClassName="table-row-hover"
    />
  );
}
