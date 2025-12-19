import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable({
  columns,
  data,
  enableSearch = false,
  searchPlaceholder = "Tìm kiếm...",
  enableFilters = false,
  filters = [],
}) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, columnId, filterValue) => {
      const v = row.getValue(columnId);
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!q) return true;
      return String(v ?? "").toLowerCase().includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function clearFilters() {
    setColumnFilters([]);
  }

  return (
    <div className="space-y-3">
      {enableSearch ? (
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
        />
      ) : null}

      {enableFilters && filters?.length ? (
        <div className="flex flex-wrap items-end gap-3">
          {filters.map((f) => {
            const col = table.getColumn(f.id);
            if (!col) return null;
            const value = col.getFilterValue() ?? "";

            if (f.type === "select") {
              const options = f.options?.length
                ? f.options
                : Array.from(col.getFacetedUniqueValues().keys())
                    .filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
                    .map((v) => String(v))
                    .sort((a, b) => a.localeCompare(b, "vi"));

              return (
                <div key={f.id} className="space-y-1">
                  <label className="text-sm font-medium">{f.label}</label>
                  <select
                    value={String(value)}
                    onChange={(e) => col.setFilterValue(e.target.value)}
                    className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm shadow-xs">
                    <option value="">Tất cả</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // default: text filter
            return (
              <div key={f.id} className="space-y-1">
                <label className="text-sm font-medium">{f.label}</label>
                <Input
                  value={String(value)}
                  onChange={(e) => col.setFilterValue(e.target.value)}
                  placeholder={f.placeholder || ""}
                />
              </div>
            );
          })}

          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            Xóa lọc
          </Button>
        </div>
      ) : null}

      <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2"
                      onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span className="text-xs text-muted-foreground">
                        {header.column.getIsSorted() === "asc"
                          ? "▲"
                          : header.column.getIsSorted() === "desc"
                          ? "▼"
                          : ""}
                      </span>
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
