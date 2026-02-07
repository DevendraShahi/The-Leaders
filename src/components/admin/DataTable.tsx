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
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, Trash, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    onDelete?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onDelete
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
                    {selectedRows.length > 0 && onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-none font-mono uppercase text-xs h-10 animate-in fade-in"
                            onClick={() => {
                                const originalRows = selectedRows.map(row => row.original);
                                onDelete(originalRows);
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
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b [&_tr]:border-border">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <th key={header.id} className="h-10 px-4 text-left align-middle font-bebas tracking-wide text-lg text-muted-foreground font-normal [&:has([role=checkbox])]:pr-0 uppercase">
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
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
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
                                        colSpan={columns.length}
                                        className="h-32 text-center text-muted-foreground font-mono text-sm uppercase tracking-wide"
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
                <div className="flex-1 text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs font-mono font-bold mx-2">
                        PAGE {table.getState().pagination.pageIndex + 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
