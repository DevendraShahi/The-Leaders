'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { articleColumns, leaderColumns, historyColumns, briefColumns, factCheckColumns, electionArticleColumns } from './columns';
import { useAuth } from '@/components/admin/AuthProvider';
import { toast } from 'sonner';
import { Plus, Loader2, RefreshCw, Upload } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

function ContentList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();

    // Default tab from URL or 'articles'
    const type = searchParams.get('type') || 'articles';
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingStatusKeys, setUpdatingStatusKeys] = useState<Set<string>>(new Set());
    const [pendingDelete, setPendingDelete] = useState<{ id: string; type: string } | null>(null);
    const [pendingBulkDeleteRows, setPendingBulkDeleteRows] = useState<any[] | null>(null);

    const fetchContent = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (dateFrom) params.set('from', dateFrom);
            if (dateTo) params.set('to', dateTo);
            if (statusFilter) params.set('status', statusFilter);

            const endpoint = `/api/admin/${type}?${params.toString()}`;
            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const responseData = await res.json();

            if (res.ok) {
                // Determine data key based on type
                let key = type;
                if (type === 'fact-checks') key = 'factChecks';
                if (type === 'election-articles') key = 'electionArticles';

                setData(responseData.data[key] || []);
                setTotalPages(responseData.data.pagination.pages);
                setTotalItems(responseData.data.pagination.total || 0);
                setPageSize(responseData.data.pagination.limit || 10);
            } else {
                toast.error('Failed to load content');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
        // Reset page when switching types? Yes preferably.
    }, [type, page, token, dateFrom, dateTo, statusFilter]);

    const handleTabChange = (newType: string) => {
        // Update URL
        router.push(`/admin/content?type=${newType}`);
        setPage(1);
    };

    const executeDelete = async (id: string, deleteType: string) => {
        try {
            const mapping: any = {
                'article': 'articles',
                'leader': 'leaders',
                'history': 'history',
                'brief': 'briefs',
                'fact-check': 'fact-checks',
                'election-article': 'election-articles'
            };

            const routeType = mapping[deleteType] || deleteType;

            const res = await fetch(`/api/admin/${routeType}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Item deleted successfully');
                fetchContent(); // Refresh
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    const handleDelete = (id: string, deleteType: string) => {
        setPendingDelete({ id, type: deleteType });
    };

    const handleStatusChange = async (row: any, itemType: string, status: string) => {
        if (!token) return;
        const routeType = getRouteType(itemType);
        const itemId = getBulkDeleteId(row, itemType);
        if (!itemId) return;
        const rowKey = `${itemType}:${itemId}`;

        setUpdatingStatusKeys((prev) => {
            const next = new Set(prev);
            next.add(rowKey);
            return next;
        });

        try {
            const res = await fetch(`/api/admin/${routeType}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result?.error || 'Failed to update status');
            }

            setData((prev) =>
                prev.map((item) => {
                    const candidateId = getBulkDeleteId(item, itemType);
                    if (candidateId !== itemId) return item;
                    return {
                        ...item,
                        status,
                        ...(itemType === 'brief' ? { isPublished: status === 'published' } : {})
                    };
                })
            );
            toast.success('Status updated');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update status');
        } finally {
            setUpdatingStatusKeys((prev) => {
                const next = new Set(prev);
                next.delete(rowKey);
                return next;
            });
        }
    };

    const isStatusUpdating = (row: any, itemType: string) => {
        const itemId = getBulkDeleteId(row, itemType);
        if (!itemId) return false;
        return updatingStatusKeys.has(`${itemType}:${itemId}`);
    };

    const getRouteType = (deleteType: string) => {
        const mapping: Record<string, string> = {
            'article': 'articles',
            'leader': 'leaders',
            'history': 'history',
            'brief': 'briefs',
            'fact-check': 'fact-checks',
            'election-article': 'election-articles'
        };
        return mapping[deleteType] || deleteType;
    };

    const getBulkDeleteId = (row: any, deleteType: string): string => {
        if (deleteType === 'brief' || deleteType === 'fact-check' || deleteType === 'election-article') {
            if (row?.slug) return String(row.slug);
        }
        const raw = row?.id ?? row?._id ?? row?.slug;
        if (!raw) return '';
        if (typeof raw === 'string') return raw;
        if (raw?.$oid) return String(raw.$oid);
        if (typeof raw?.toString === 'function') return raw.toString();
        return String(raw);
    };

    const executeBulkDelete = async (rows: any[]) => {
        if (!token || rows.length === 0) return;

        const sectionTypeMap: Record<string, string> = {
            articles: 'article',
            leaders: 'leader',
            history: 'history',
            briefs: 'brief',
            'fact-checks': 'fact-check',
            'election-articles': 'election-article'
        };
        const itemType = sectionTypeMap[type] || type;
        const routeType = getRouteType(itemType);

        try {
            const results = await Promise.all(
                rows.map(async (row) => {
                    const itemId = getBulkDeleteId(row, itemType);
                    if (!itemId) return { ok: false };
                    const res = await fetch(`/api/admin/${routeType}/${itemId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    return { ok: res.ok };
                })
            );

            const successCount = results.filter((r) => r.ok).length;
            const failureCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(`${successCount} item(s) deleted successfully`);
            }
            if (failureCount > 0) {
                toast.error(`${failureCount} item(s) failed to delete`);
            }
            fetchContent();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting selected items');
        }
    };

    const handleBulkDelete = async (rows: any[]) => {
        if (!token || rows.length === 0) return;
        setPendingBulkDeleteRows(rows);
    };

    const getColumns = () => {
        switch (type) {
            case 'leaders': return leaderColumns(handleDelete, handleStatusChange, isStatusUpdating);
            case 'history': return historyColumns(handleDelete, handleStatusChange, isStatusUpdating);
            case 'fact-checks': return factCheckColumns(handleDelete, handleStatusChange, isStatusUpdating);
            case 'briefs': return briefColumns(handleDelete, handleStatusChange, isStatusUpdating);
            case 'election-articles': return electionArticleColumns(handleDelete, handleStatusChange, isStatusUpdating);
            case 'articles':
            default: return articleColumns(handleDelete, handleStatusChange, isStatusUpdating);
        }
    };

    const getCreatePath = () => {
        if (type === 'leaders') return '/admin/content/leader/new';
        if (type === 'history') return '/admin/content/history/new';
        if (type === 'briefs') return '/admin/content/brief/new';
        if (type === 'fact-checks') return '/admin/content/fact-check/new';
        if (type === 'election-articles') return '/admin/content/election-article/new';
        return '/admin/content/article/new';
    };

    const getCreateLabel = () => {
        if (type === 'history') return 'New Event';
        if (type === 'briefs') return 'New Brief';
        if (type === 'fact-checks') return 'New Fact Check';
        if (type === 'election-articles') return 'New Election Article';
        return `New ${type.slice(0, -1)}`;
    };

    // Editorial Theme Classes
    const tabBase = "flex-1 sm:flex-none px-6 py-2 text-sm font-mono uppercase tracking-wider transition-all border-b-2";
    const activeTab = "border-primary text-primary font-bold bg-primary/5";
    const inactiveTab = "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="font-bebas text-4xl text-foreground tracking-wide">Content Management</h1>
                    <p className="text-muted-foreground font-manrope text-sm mt-1">
                        Secure administration for The Leaders archive.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchContent}
                        className="rounded-none font-mono uppercase text-xs h-10 border-border"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Link
                        href={getCreatePath()}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 transition-colors text-sm font-bold font-mono uppercase tracking-wider rounded-none h-10 shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {getCreateLabel()}
                    </Link>

                    <Link
                        href="/admin/content/import"
                        className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-foreground px-4 py-2.5 transition-colors text-xs font-bold font-mono uppercase tracking-wider rounded-none h-10"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Import Perplexity
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm min-w-[140px]"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setPage(1);
                        }}
                        className="h-10 px-3 border border-border bg-background text-foreground rounded-none text-sm"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setStatusFilter('');
                        setDateFrom('');
                        setDateTo('');
                        setPage(1);
                    }}
                    className="rounded-none font-mono uppercase text-xs h-10 border-border"
                >
                    Clear Dates
                </Button>
            </div>

            {/* Type Switcher Tabs - Minimalist Editorial Style */}
            <div className="flex w-full sm:w-auto border-b border-border overflow-x-auto">
                <button
                    onClick={() => handleTabChange('articles')}
                    className={`${tabBase} ${type === 'articles' ? activeTab : inactiveTab}`}
                >
                    Articles
                </button>
                <button
                    onClick={() => handleTabChange('election-articles')}
                    className={`${tabBase} ${type === 'election-articles' ? activeTab : inactiveTab}`}
                >
                    Election Articles
                </button>
                <button
                    onClick={() => handleTabChange('leaders')}
                    className={`${tabBase} ${type === 'leaders' ? activeTab : inactiveTab}`}
                >
                    Leaders
                </button>
                <button
                    onClick={() => handleTabChange('history')}
                    className={`${tabBase} ${type === 'history' ? activeTab : inactiveTab}`}
                >
                    History
                </button>
                <button
                    onClick={() => handleTabChange('briefs')}
                    className={`${tabBase} ${type === 'briefs' ? activeTab : inactiveTab}`}
                >
                    Briefs
                </button>
                <button
                    onClick={() => handleTabChange('fact-checks')}
                    className={`${tabBase} ${type === 'fact-checks' ? activeTab : inactiveTab}`}
                >
                    Fact Checks
                </button>
            </div>

            {/* Content Table - Clean & Sharp */}
            <div className="bg-card border border-border rounded-none shadow-sm">
                {loading && data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                        <span className="font-mono text-xs uppercase tracking-widest">Loading Records...</span>
                    </div>
                ) : (
                    <DataTable
                        columns={getColumns()}
                        data={data}
                        onDelete={handleBulkDelete}
                        totalRows={totalItems}
                        currentPage={page}
                        pageSize={pageSize}
                        searchKey={
                            type === 'leaders'
                                ? 'name.en'
                                : type === 'briefs'
                                    ? 'title'
                                    : type === 'fact-checks'
                                        ? 'claim'
                                        : type === 'election-articles'
                                            ? 'title_en'
                                            : 'title.en'
                        }
                    />
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-card border border-border hover:bg-muted disabled:opacity-50 rounded-none transition-colors"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 text-sm font-mono text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-card border border-border hover:bg-muted disabled:opacity-50 rounded-none transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Delete this item?"
                description="This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={async () => {
                    if (!pendingDelete) return;
                    await executeDelete(pendingDelete.id, pendingDelete.type);
                    setPendingDelete(null);
                }}
            />

            <ConfirmDialog
                open={!!pendingBulkDeleteRows}
                onOpenChange={(open) => {
                    if (!open) setPendingBulkDeleteRows(null);
                }}
                title={
                    pendingBulkDeleteRows
                        ? `Delete ${pendingBulkDeleteRows.length} selected item(s)?`
                        : 'Delete selected items?'
                }
                description="This action cannot be undone."
                confirmLabel="Delete Selected"
                variant="destructive"
                onConfirm={async () => {
                    if (!pendingBulkDeleteRows) return;
                    await executeBulkDelete(pendingBulkDeleteRows);
                    setPendingBulkDeleteRows(null);
                }}
            />
        </div>
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ContentList />
        </Suspense>
    );
}
