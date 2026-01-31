"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash, Eye, CheckCircle, XCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button" // Assuming standard button or use custom
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Shadcn or I need to build/mock
import Link from "next/link"
import { format } from "date-fns"

// Since I don't have Shadcn dropdown, I'll use a simple custom implementation or use the one I'd need to install. 
// I'll stick to simple buttons for actions for now to avoid dependency hell if shadcn is not set up.
// Actually, I can use a simple generic Action cell.

const ActionCell = ({ row, type, onDelete }: { row: any, type: string, onDelete: (id: string, type: string) => void }) => {
    return (
        <div className="flex items-center gap-2">
            <Link href={`/admin/content/${type}/${row._id}`} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600">
                <Edit className="h-4 w-4" />
            </Link>
            <button
                onClick={() => onDelete(row._id, type)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-600"
            >
                <Trash className="h-4 w-4" />
            </button>
        </div>
    )
}

export const articleColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        id: "title.en",
        accessorKey: "title.en",
        header: "Title",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.title?.en || 'Untitled'}</div>
                <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.original.title?.ne}</div>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    status === 'draft' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {status}
                </span>
            )
        }
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
        cell: ({ row }) => (
            row.original.isFeatured ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <span className="text-gray-300">•</span>
        )
    },
    {
        accessorKey: "views",
        header: "Views",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy')
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell row={row.original} type="article" onDelete={onDelete} />
    },
]

export const leaderColumns = (onDelete: any): ColumnDef<any>[] => [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => (
            row.original.image ?
                <img src={row.original.image} alt="" className="h-8 w-8 rounded-full object-cover" /> :
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">U</div>
        )
    },
    {
        id: "name.en",
        accessorKey: "name.en",
        header: "Name",
        enableColumnFilter: true,
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.name?.en || 'Unnamed'}</div>
                <div className="text-xs text-gray-500">{row.original.name?.ne}</div>
            </div>
        )
    },
    {
        accessorKey: "party.en",
        header: "Party",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {row.original.status}
            </span>
        )
    },
    {
        id: "actions",
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
            <div>
                <div className="font-medium">{row.original.title?.en || 'Untitled'}</div>
            </div>
        )
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            if (!row.original.date) return 'N/A';
            try {
                return format(new Date(row.original.date), 'MMMM d');
            } catch (e) {
                return 'Invalid Date';
            }
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                {row.original.status}
            </span>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell row={row.original} type="history" onDelete={onDelete} />
    },
]
