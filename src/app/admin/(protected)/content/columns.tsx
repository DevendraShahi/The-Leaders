"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash, Star, Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageCode } from "@/components/providers/language-provider"

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

const localizedCellText = (value: any, language: LanguageCode): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
        if (language === "ne") return value.ne || value.en || "";
        return value.en || value.ne || "";
    }
    return "";
};

const ActionCell = ({
    row,
    type,
    onPreview,
    language,
}: {
    row: any,
    type: string,
    onPreview?: (row: any, type: string) => void,
    language: LanguageCode,
}) => {
    return (
        <div className="flex items-center gap-1">
            {onPreview && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-none px-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => onPreview(row, type)}
                    title={language === "ne" ? "पूर्वावलोकन" : "View Details"}
                    aria-label={language === "ne" ? "पूर्वावलोकन" : "View Details"}
                >
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    {language === "ne" ? "हेर्नुहोस्" : "View"}
                </Button>
            )}
        </div>
    )
}

const normalizeStatus = (status: string | boolean | null | undefined): string => {
    if (typeof status === "boolean") return status ? "published" : "draft";
    if (!status) return "draft";
    return status;
};

const StatusBadgeCell = ({
    current,
    language,
}: {
    current: string | boolean | null | undefined;
    language: LanguageCode;
}) => {
    const value = normalizeStatus(current);

    let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
    if (value === "published") variant = "default";
    else if (value === "archived") variant = "secondary";

    const labelMap: Record<string, { en: string; ne: string }> = {
        draft: { en: "Draft", ne: "मस्यौदा" },
        published: { en: "Published", ne: "प्रकाशित" },
        archived: { en: "Archived", ne: "अभिलेख" }
    };

    const label = labelMap[value]?.[language] || value;

    return (
        <Badge variant={variant} className="rounded-none font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 pointer-events-none">
            {label}
        </Badge>
    );
};

export const articleColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            id: "title.en",
            accessorKey: "title.en",
            header: language === "ne" ? "शीर्षक" : "Title",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm line-clamp-1">
                        {localizedCellText(row.original.title, language) || (language === "ne" ? "शीर्षक नभएको लेख" : "Untitled Article")}
                    </div>
                    <div className="font-serif text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {language === "ne" ? row.original.title?.en : row.original.title?.ne}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            accessorKey: "isFeatured",
            header: language === "ne" ? "फिचर्ड" : "Featured",
            cell: ({ row }) => (
                row.original.isFeatured
                    ? <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    : <span className="text-muted-foreground/30 text-xs font-mono">-</span>
            )
        },
        {
            accessorKey: "createdAt",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.createdAt) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
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
            cell: ({ row }) => <ActionCell row={row.original} type="article" onPreview={onPreview} language={language} />
        },
    ]

export const leaderColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
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
            header: language === "ne" ? "नाम" : "Name",
            enableColumnFilter: true,
            cell: ({ row }) => {
                const name = row.original.name;
                const displayName = typeof name === 'string' ? name : (language === "ne" ? (name?.ne || name?.en || 'नेता नाम नभएको') : (name?.en || name?.ne || 'Unnamed Leader'));

                const party = row.original.party;
                const displayParty = typeof party === 'string' ? party : (language === "ne" ? (party?.ne || party?.en) : (party?.en || party?.ne));

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
            accessorKey: "date",
            header: language === "ne" ? "घटेको मिति" : "Occurred",
            cell: ({ row }) => {
                if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(row.original.date), 'MMM d, yyyy')}
                        </span>
                    );
                } catch (e) {
                    return <span className="text-destructive text-xs font-mono">Invalid</span>;
                }
            }
        },
        {
            accessorKey: "status",
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <ActionCell row={row.original} type="leader" onPreview={onPreview} language={language} />
        },
    ]

export const historyColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            id: "title.en",
            accessorKey: "title.en",
            header: language === "ne" ? "घटना" : "Event",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm">
                        {localizedCellText(row.original.title, language) || (language === "ne" ? "शीर्षक नभएको घटना" : "Untitled Event")}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "date",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(row.original.date), 'MMM d, yyyy')}
                        </span>
                    );
                } catch (e) {
                    return <span className="text-destructive text-xs font-mono">Invalid</span>;
                }
            }
        },
        {
            accessorKey: "status",
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <ActionCell row={row.original} type="history" onPreview={onPreview} language={language} />
        },
    ]

export const briefColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "image",
            header: language === "ne" ? "तस्बिर" : "Image",
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
                        {language === "ne" ? "तस्बिर थप्नुहोस्" : "Add image"}
                    </Link>
                );
            }
        },
        {
            id: "title",
            accessorKey: "title",
            header: language === "ne" ? "हेडलाइन / संक्षिप्त" : "Headline / Brief",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                        {localizedCellText(row.original.title, language) || (language === "ne" ? "शीर्षक नभएको संक्षिप्त" : "Untitled Brief")}
                    </div>
                    {row.original.summary && (
                        <div className="font-manrope text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {localizedCellText(row.original.summary, language)}
                        </div>
                    )}
                </div>
            )
        },
        {
            accessorKey: "date",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(row.original.date), 'MMM d, yyyy')}
                        </span>
                    );
                } catch (e) {
                    return <span className="text-destructive text-xs font-mono">Invalid</span>;
                }
            }
        },
        {
            accessorKey: "status",
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status ?? row.original.isPublished} language={language} />
            )
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <ActionCell row={row.original} type="brief" onPreview={onPreview} language={language} />
        },
    ]

export const factCheckColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "image",
            header: language === "ne" ? "तस्बिर" : "Image",
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
                        {language === "ne" ? "तस्बिर थप्नुहोस्" : "Add image"}
                    </Link>
                );
            }
        },
        {
            id: "claim",
            accessorKey: "claim",
            header: language === "ne" ? "दाबी" : "Claim",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                        {localizedCellText(row.original.claim, language)}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {language === "ne" ? "दाबीकर्ता:" : "By:"} {localizedCellText(row.original.claimBy, language)}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "date",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.date) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(row.original.date), 'MMM d, yyyy')}
                        </span>
                    );
                } catch (e) {
                    return <span className="text-destructive text-xs font-mono">Invalid</span>;
                }
            }
        },
        {
            accessorKey: "status",
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <ActionCell row={row.original} type="fact-check" onPreview={onPreview} language={language} />
        },
    ]

export const electionArticleColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "image",
            header: language === "ne" ? "तस्बिर" : "Image",
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
                        {language === "ne" ? "तस्बिर थप्नुहोस्" : "Add image"}
                    </Link>
                );
            }
        },
        {
            id: "title_en",
            accessorKey: "title_en",
            header: language === "ne" ? "शीर्षक" : "Title",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                        {(language === "ne" ? row.original.title_ne || row.original.title_en : row.original.title_en || row.original.title_ne) || (language === "ne" ? "शीर्षक नभएको चुनावी लेख" : "Untitled Election Article")}
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
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            accessorKey: "createdAt",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.createdAt) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
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
            cell: ({ row }) => <ActionCell row={row.original} type="election-article" onPreview={onPreview} language={language} />
        },
    ]

export const columnArticleColumns = (
    onDelete: any,
    onStatusChange: any,
    isStatusUpdating: any,
    language: LanguageCode = "en",
    onPreview?: (row: any, type: string) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "image",
            header: language === "ne" ? "तस्बिर" : "Image",
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
                        href={`/admin/content/column-article/${rowId}`}
                        className="inline-flex items-center px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors"
                    >
                        {language === "ne" ? "तस्बिर थप्नुहोस्" : "Add image"}
                    </Link>
                );
            }
        },
        {
            id: "title_en",
            accessorKey: "title_en",
            header: language === "ne" ? "शीर्षक" : "Title",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-manrope font-bold text-foreground text-sm line-clamp-2">
                        {(language === "ne" ? row.original.title_ne || row.original.title_en : row.original.title_en || row.original.title_ne) || (language === "ne" ? "शीर्षक नभएको स्तम्भ" : "Untitled Column")}
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
            header: language === "ne" ? "स्थिति" : "Status",
            cell: ({ row }) => (
                <StatusBadgeCell current={row.original.status} language={language} />
            )
        },
        {
            accessorKey: "createdAt",
            header: language === "ne" ? "मिति" : "Date",
            cell: ({ row }) => {
                if (!row.original.createdAt) return <span className="text-muted-foreground text-xs font-mono">-</span>;
                try {
                    return (
                        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
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
            cell: ({ row }) => <ActionCell row={row.original} type="column-article" onPreview={onPreview} language={language} />
        },
    ]
