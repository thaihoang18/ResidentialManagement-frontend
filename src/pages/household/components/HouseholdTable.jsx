import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
              onClick={() => onSplit(row.original)}
              title="Tách hộ"
              className="bg-white accent-text transition-transform hover:-translate-y-0.5"
            >
              <Split className="w-4 h-4" />
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
    [onDelete, onEdit, onSplit]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSearch
      searchPlaceholder="Tìm theo mã hộ, số nhà, tên đường, chủ hộ..."
      enableFilters
      filters={[
        { id: "household_code", label: "Mã hộ", type: "text", placeholder: "VD: HK001" },
        { id: "house_number", label: "Số nhà", type: "text", placeholder: "VD: 12A" },
        { id: "street", label: "Tên đường", type: "select" },
        { id: "head_name", label: "Tên chủ hộ", type: "text", placeholder: "VD: Nguyễn Văn A" },
      ]}
      rowClassName="hover:bg-teal-50"
    />
  );
}
