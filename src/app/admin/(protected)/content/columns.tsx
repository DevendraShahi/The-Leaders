"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash, Star, MoreHorizontal, Eye } from "lucide-react"
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

const getRowId = (row: any): string => {
    const raw = row?.id ?? row?._id ?? row?.slug;
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (raw?.$oid) return String(raw.$oid);
    if (typeof raw?.toString === "function") return raw.toString();
    return String(raw);
};

const getRowSlugOrId = (row: any): string => {
    if (row?.slug) return String(row.slug);
    return getRowId(row);
};

const ActionCell = ({ row, type, onDelete }: { row: any, type: string, onDelete: (id: string, type: string) => void }) => {
    const viewOnlyTypes = new Set(["brief", "fact-check", "election-article"]);
    const isViewOnly = viewOnlyTypes.has(type);
    const actionLabel = isViewOnly ? "View" : "Edit";
    const ActionIcon = isViewOnly ? Eye : Edit;
    const rowId = isViewOnly ? getRowSlugOrId(row) : getRowId(row);
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
                    <Link href={`/admin/content/${type}/${rowId}`} className="flex items-center w-full">
                        <ActionIcon className="mr-2 h-3.5 w-3.5" />
                        {actionLabel}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(rowId, type)}
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
const StatusBadge = ({ status }: { status: string | boolean }) => {
    const isPublished = status === true || status === 'published';
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

export const briefColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const rowId = getRowSlugOrId(row.original);
            if (row.original?.image) {
                return (
                    <div className="w-12 h-12 border border-border overflow-hidden bg-muted">
                        <img src={row.original.image} alt="" className="w-full h-full object-cover" />
                    </div>
                );
            }
            return (
                <Link
                    href={`/admin/content/brief/${rowId}`}
                    className="inline-flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                >
                    Add image
                </Link>
            );
        }
    },
    {
        id: "title",
        accessorKey: "title",
        header: "Headline / Brief",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div className="py-1">
                <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                    {row.original.title || 'Untitled Brief'}
                </div>
                {row.original.summary && (
                    <div className="font-manrope text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {row.original.summary}
                    </div>
                )}
            </div>
        )
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
            try {
                return (
                    <span className="font-mono text-xs text-muted-foreground">
                        {format(new Date(row.original.date), 'MMM d, yyyy')}
                    </span>
                );
            } catch (e) {
                return <span className="text-destructive text-xs font-mono">Invalid</span>;
            }
        }
    },
    {
        accessorKey: "isPublished",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.isPublished} />
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row.original} type="brief" onDelete={onDelete} />
    },
]

export const factCheckColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const rowId = getRowSlugOrId(row.original);
            if (row.original?.image) {
                return (
                    <div className="w-12 h-12 border border-border overflow-hidden bg-muted">
                        <img src={row.original.image} alt="" className="w-full h-full object-cover" />
                    </div>
                );
            }
            return (
                <Link
                    href={`/admin/content/fact-check/${rowId}`}
                    className="inline-flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                >
                    Add image
                </Link>
            );
        }
    },
    {
        id: "claim",
        accessorKey: "claim",
        header: "Claim",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div className="py-1">
                <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                    {row.original.claim}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    By: {row.original.claimBy}
                </div>
            </div>
        )
    },
    {
        accessorKey: "verdict",
        header: "Verdict",
        cell: ({ row }) => {
            const verdict = row.original.verdict || 'unverified';
            const colors: any = {
                true: 'text-green-600 bg-green-50 border-green-200',
                false: 'text-red-600 bg-red-50 border-red-200',
                misleading: 'text-amber-600 bg-amber-50 border-amber-200',
                unverified: 'text-gray-600 bg-gray-50 border-gray-200'
            };
            return (
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono uppercase border ${colors[verdict] || colors.unverified}`}>
                    {verdict}
                </span>
            );
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row.original} type="fact-check" onDelete={onDelete} />
    },
]

export const electionArticleColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const rowId = getRowSlugOrId(row.original);
            if (row.original?.image) {
                return (
                    <div className="w-12 h-12 border border-border overflow-hidden bg-muted">
                        <img src={row.original.image} alt="" className="w-full h-full object-cover" />
                    </div>
                );
            }
            return (
                <Link
                    href={`/admin/content/election-article/${rowId}`}
                    className="inline-flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                >
                    Add image
                </Link>
            );
        }
    },
    {
        id: "title_en",
        accessorKey: "title_en",
        header: "Title",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div className="py-1">
                <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                    {row.original.title_en || 'Untitled Election Article'}
                </div>
                {row.original.editor && (
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
                        {row.original.editor}
                    </div>
                )}
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
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
        cell: ({ row }) => <ActionCell row={row.original} type="election-article" onDelete={onDelete} />
    },
]
