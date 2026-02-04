"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash, Star, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ActionCell = ({ row, type, onDelete }: { row: any, type: string, onDelete: (id: string, type: string) => void }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-none hover:bg-muted">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-border">
                <DropdownMenuLabel className="font-mono text-xs uppercase text-muted-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild className="rounded-none cursor-pointer font-manrope">
                    <Link href={`/admin/content/${type}/${row._id}`} className="flex items-center w-full">
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(row._id, type)}
                    className="text-destructive focus:text-destructive rounded-none cursor-pointer font-manrope"
                >
                    <Trash className="mr-2 h-3.5 w-3.5" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const isPublished = status === 'published';
    return (
        <span className={`
            inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border
            ${isPublished
                ? 'bg-primary/5 text-primary border-primary/20'
                : 'bg-muted text-muted-foreground border-border'}
        `}>
            {status || 'Draft'}
        </span>
    );
};

export const articleColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        id: "title.en",
        accessorKey: "title.en",
        header: "Title",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div className="py-1">
                <div className="font-manrope font-bold text-foreground text-sm line-clamp-1">
                    {row.original.title?.en || 'Untitled Article'}
                </div>
                <div className="font-serif text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {row.original.title?.ne}
                </div>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
        cell: ({ row }) => (
            row.original.isFeatured
                ? <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                : <span className="text-muted-foreground/30 text-xs font-mono">-</span>
        )
    },
    {
        accessorKey: "views",
        header: "Views",
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {row.original.views || 0}
            </span>
        )
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            if (!row.original.createdAt) return <span className="text-muted-foreground text-xs font-mono">-</span>;
            try {
                return (
                    <span className="font-mono text-xs text-muted-foreground">
                        {format(new Date(row.original.createdAt), 'MMM d, yyyy')}
                    </span>
                );
            } catch (e) {
                return <span className="text-destructive text-xs font-mono">Invalid</span>;
            }
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row.original} type="article" onDelete={onDelete} />
    },
]

export const leaderColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => (
            <div className="w-8 h-8 relative bg-muted border border-border flex items-center justify-center overflow-hidden">
                {row.original.image ? (
                    <img src={row.original.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bebas text-xs text-muted-foreground">No Img</span>
                )}
            </div>
        )
    },
    {
        id: "name.en",
        accessorKey: "name.en",
        header: "Name",
        enableColumnFilter: true,
        cell: ({ row }) => {
            const name = row.original.name;
            const displayName = typeof name === 'string' ? name : (name?.en || name?.ne || 'Unnamed Leader');

            const party = row.original.party;
            const displayParty = typeof party === 'string' ? party : (party?.en || party?.ne);

            return (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm">
                        {displayName}
                    </div>
                    {displayParty && (
                        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                            {displayParty}
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row.original} type="leader" onDelete={onDelete} />
    },
]

export const historyColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        id: "title.en",
        accessorKey: "title.en",
        header: "Event",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div className="py-1">
                <div className="font-manrope font-bold text-foreground text-sm">
                    {row.original.title?.en || 'Untitled Event'}
                </div>
            </div>
        )
    },
    {
        accessorKey: "date",
        header: "Occurred",
        cell: ({ row }) => {
            if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
            try {
                return (
                    <span className="font-mono text-xs text-muted-foreground">
                        {format(new Date(row.original.date), 'MMMM d')}
                    </span>
                );
            } catch (e) {
                return <span className="text-destructive text-xs font-mono">Invalid</span>;
            }
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row.original} type="history" onDelete={onDelete} />
    },
]
