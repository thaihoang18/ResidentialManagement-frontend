import React, { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Edit2, History, Trash2 } from "lucide-react";
import ResidentHistoryDialog from "./ResidentHistoryDialog";

export default function ResidentTable({ data = [], onEdit, onDelete, loading }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyResident, setHistoryResident] = useState(null);

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
      { id: "actions", header: () => <div className="text-right">Thao tác</div>, enableSorting: false, enableGlobalFilter: false, enableColumnFilter: false, cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setHistoryResident(row.original);
                  setHistoryOpen(true);
                }}
                aria-label="Lịch sử"
                className="accent-text"
              >
                <History />
                <span className="sr-only">Lịch sử</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Lịch sử</TooltipContent>
          </Tooltip>

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
      )},
    ],
    [onEdit, onDelete]
  );

  return (
    <>
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
          { id: "gender", label: "Giới tính", type: "select" },
          { id: "occupation", label: "Nghề nghiệp", type: "select" },
          { id: "relation_to_head", label: "Quan hệ", type: "select" },
        ]}
        rowClassName="table-row-hover"
      />

      <ResidentHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        resident={historyResident}
      />
    </>
  );
}
