import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

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
  rowClassName = "table-row-hover",
  enableRowSelection = false,
  getRowId,
  onSelectionChange,
  resetRowSelectionKey,
  enablePagination = false,
  pageSize = 10,
}) {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const selectionColumn = React.useMemo(() => {
    if (!enableRowSelection) return null;

    return {
      id: "__select__",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-[color:var(--primary-dark)]"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="h-4 w-4 accent-[color:var(--primary-dark)]"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Chọn dòng"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      size: 44,
    };
  }, [enableRowSelection]);

  const computedColumns = React.useMemo(() => {
    if (!enableRowSelection || !selectionColumn) return columns;
    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection, selectionColumn]);

  const table = useReactTable({
    data,
    columns: computedColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      ...(enableRowSelection ? { rowSelection } : {}),
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    ...(typeof getRowId === "function" ? { getRowId } : {}),
    ...(enableRowSelection ? { enableRowSelection: true } : {}),
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
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (!enableRowSelection) return;
    setRowSelection({});
  }, [enableRowSelection, resetRowSelectionKey]);

  React.useEffect(() => {
    if (!enableRowSelection) return;
    if (typeof onSelectionChange !== "function") return;

    const selected = table.getSelectedRowModel().flatRows.map((r) => r.original);
    onSelectionChange(selected);
  }, [enableRowSelection, onSelectionChange, rowSelection, table]);

  const [pageInput, setPageInput] = React.useState("");
  React.useEffect(() => {
    if (!enablePagination) return;
    setPageInput(String(table.getState().pagination.pageIndex + 1));
  }, [table, table?.getState()?.pagination?.pageIndex, enablePagination]);

  function clearFilters() {
    setGlobalFilter("");
    setColumnFilters([]);

    // keep table internal state consistent even if TanStack changes
    table.resetGlobalFilter();
    table.resetColumnFilters();
  }

  return (
    <div className="glass-panel rounded-xl border p-4 space-y-3">
      {enableSearch || (enableFilters && filters?.length) ? (
        <div className="flex flex-col gap-3">
          {enableSearch ? (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
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

              const normalizedOptions = options.map((opt) => {
                if (opt && typeof opt === "object") {
                  const value = String(opt.value ?? "");
                  return { value, label: String(opt.label ?? value) };
                }
                const value = String(opt);
                return { value, label: value };
              });

              return (
                <div key={f.id} className="space-y-1 min-w-[220px]">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <select
                    value={String(value)}
                    onChange={(e) => col.setFilterValue(e.target.value)}
                    className="border-input bg-background/60 text-foreground h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-[2px]">
                    <option value="">Tất cả</option>
                    {normalizedOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // default: text filter
            return (
              <div key={f.id} className="space-y-1 min-w-[220px]">
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <Input
                  value={String(value)}
                  onChange={(e) => col.setFilterValue(e.target.value)}
                  placeholder={f.placeholder || ""}
                />
              </div>
            );
          })}

              <Button type="button" variant="outline" size="sm" onClick={clearFilters} className="accent-outline action-btn">
                <X className="size-4" />
                Xóa lọc
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
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
              <TableRow key={row.id} className={typeof rowClassName === "function" ? rowClassName(row) : rowClassName}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={computedColumns.length} className="h-24 text-center">
                Không có dữ liệu.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {enablePagination ? (
          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </div>

            <div className="flex items-center gap-1">
              {(() => {
                const pageCount = table.getPageCount();
                const current = table.getState().pagination.pageIndex;
                if (pageCount <= 7) {
                  return Array.from({ length: pageCount }).map((_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={i === current ? "default" : "ghost"}
                      onClick={() => table.setPageIndex(i)}
                    >
                      {i + 1}
                    </Button>
                  ));
                }

                const delta = 2;
                const left = Math.max(0, current - delta);
                const right = Math.min(pageCount - 1, current + delta);
                const items = [];

                if (left > 0) {
                  items.push(0);
                  if (left > 1) items.push('left-ellipsis');
                }

                for (let i = left; i <= right; i++) items.push(i);

                if (right < pageCount - 1) {
                  if (right < pageCount - 2) items.push('right-ellipsis');
                  items.push(pageCount - 1);
                }

                return items.map((p, idx) => {
                  if (p === 'left-ellipsis' || p === 'right-ellipsis') {
                    return (
                      <span key={p + idx} className="px-2 text-sm text-muted-foreground">…</span>
                    );
                  }

                  return (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === current ? "default" : "ghost"}
                      onClick={() => table.setPageIndex(p)}
                    >
                      {p + 1}
                    </Button>
                  );
                });
              })()}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Đến trang</label>
              <Input
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const pageCount = table.getPageCount();
                  let p = Number(pageInput) || 1;
                  if (p < 1) p = 1;
                  if (p > pageCount) p = pageCount;
                  table.setPageIndex(p - 1);
                }}
                className="w-20"
              />
              <Button
                size="sm"
                onClick={() => {
                  const pageCount = table.getPageCount();
                  let p = Number(pageInput) || 1;
                  if (p < 1) p = 1;
                  if (p > pageCount) p = pageCount;
                  table.setPageIndex(p - 1);
                }}
              >
                Đi
              </Button>
            </div>
          </div>
        ) : null}
    </div>
  );
}
