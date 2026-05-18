"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { CheckCircle2, FileText, Search, Trash, Archive } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    onDelete?: (rows: TData[]) => void | Promise<void>
    onStatusChange?: (rows: TData[], status: "draft" | "published" | "archived") => void | Promise<void>
    bulkActionDisabled?: boolean
    totalRows?: number
    currentPage?: number
    pageSize?: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onDelete,
    onStatusChange,
    bulkActionDisabled = false,
    totalRows,
    currentPage = 1,
    pageSize = 10,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        enableRowSelection: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Safe check for bulk actions
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedOriginalRows = selectedRows.map(row => row.original);
    const totalAvailableRows = typeof totalRows === "number" ? totalRows : data.length;
    const pageStart = totalAvailableRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const pageEnd = Math.min(currentPage * pageSize, totalAvailableRows);
    const runBulkStatusChange = (status: "draft" | "published" | "archived") => {
        if (!onStatusChange || selectedOriginalRows.length === 0) return;
        onStatusChange(selectedOriginalRows, status);
        setRowSelection({});
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-border bg-card">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="SEARCH RECORDS..."
                        value={(table.getColumn(searchKey || "")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey || "")?.setFilterValue(event.target.value)
                        }
                        className="pl-9 h-10 rounded-none border-border font-mono text-xs uppercase tracking-wider placeholder:text-muted-foreground/50 focus-visible:ring-primary"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {selectedRows.length > 0 && onStatusChange && (
                        <div className="flex flex-wrap items-center gap-2 animate-in fade-in">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none font-mono uppercase text-xs h-10"
                                disabled={bulkActionDisabled}
                                onClick={() => runBulkStatusChange("published")}
                            >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                Published ({selectedRows.length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none font-mono uppercase text-xs h-10"
                                disabled={bulkActionDisabled}
                                onClick={() => runBulkStatusChange("archived")}
                            >
                                <Archive className="mr-2 h-3.5 w-3.5" />
                                Archived ({selectedRows.length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none font-mono uppercase text-xs h-10"
                                disabled={bulkActionDisabled}
                                onClick={() => runBulkStatusChange("draft")}
                            >
                                <FileText className="mr-2 h-3.5 w-3.5" />
                                Draft ({selectedRows.length})
                            </Button>
                        </div>
                    )}
                    {selectedRows.length > 0 && onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-none font-mono uppercase text-xs h-10 animate-in fade-in"
                            disabled={bulkActionDisabled}
                            onClick={() => {
                                onDelete(selectedOriginalRows);
                                setRowSelection({});
                            }}
                        >
                            <Trash className="mr-2 h-3.5 w-3.5" />
                            Delete ({selectedRows.length})
                        </Button>
                    )}
                </div>
            </div>

            <div className="border-t border-b border-border bg-card overflow-hidden">
                <div className="relative w-full overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x] [-webkit-overflow-scrolling:touch]">
                    <table className="w-full min-w-[980px] lg:min-w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b [&_tr]:border-border">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-10 w-10 px-3 text-left align-middle max-md:whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={table.getIsAllPageRowsSelected()}
                                            onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
                                            aria-label="Select all rows"
                                            className="h-4 w-4 rounded-none border-border accent-primary"
                                        />
                                    </th>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th key={header.id} className="h-10 px-4 text-left align-middle font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-semibold max-md:whitespace-nowrap [&:has([role=checkbox])]:pr-0">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 font-manrope">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-b border-border/50 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-3 align-middle max-md:whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={row.getIsSelected()}
                                                onChange={(event) => row.toggleSelected(event.target.checked)}
                                                aria-label="Select row"
                                                className="h-4 w-4 rounded-none border-border accent-primary"
                                            />
                                        </td>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 align-middle max-md:whitespace-nowrap [&:has([role=checkbox])]:pr-0">
                                                {(() => {
                                                    const rendered = flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    ) as any;
                                                    if (rendered && typeof rendered === "object") {
                                                        if (Array.isArray(rendered)) return rendered;
                                                        if (rendered.$$typeof) return rendered;
                                                        if (rendered.en) return rendered.en;
                                                        if (rendered.ne) return rendered.ne;
                                                        try {
                                                            return JSON.stringify(rendered);
                                                        } catch {
                                                            return "";
                                                        }
                                                    }
                                                    return rendered;
                                                })()}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length + 1}
                                        className="h-32 text-center text-muted-foreground font-mono text-sm uppercase tracking-wide"
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="sm:hidden px-4 py-2 border-t border-border/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                    Swipe horizontally to view all columns
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                <div className="flex-1 text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} visible row(s) selected.
                </div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    Showing {pageStart}-{pageEnd} of {totalAvailableRows}
                </div>
            </div>
        </div>
    )
}
