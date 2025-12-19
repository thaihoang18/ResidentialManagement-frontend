import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

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
            <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}>
              Sửa
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onSplit(row.original)}>
              Tách hộ
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original)}>
              Xóa
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
    />
  );
}
