import React, { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

export default function ResidentTable({ data = [], onEdit, onDelete, loading }) {
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", cell: ({ row }) => row.original.id },
      { accessorKey: "full_name", header: "Họ và tên" },
      { accessorKey: "date_of_birth", header: "Ngày sinh", cell: ({ row }) => new Date(row.original.date_of_birth).toLocaleDateString() },
      { accessorKey: "place_of_birth", header: "Nơi sinh" },
      { accessorKey: "gender", header: "Giới tính" },
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
      enableSearch
      searchPlaceholder="Tìm theo tên, số CMND, nơi sinh..."
      rowClassName="hover:bg-teal-50"
    />
  );
}
